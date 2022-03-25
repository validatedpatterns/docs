---
layout: post
date: 2022-03-23
title: To musthave or to mustonlyhave
excerpt: ACM has multiple enforcement strategies, be careful which one you use
published: true
tags:
- acm
---

# To musthave or to mustonlyhave

Recently a user reported an issue when using the multicloud-gitops pattern: Namely, after testing changes in a feature branch (adding a helm application), said changes were not appearing on the remote clusters.

## Preamble

In the multicloud gitops pattern each cluster has to ArgoCD instances: the "main" one which has additional rights and a "secondary" one which is in charge to keep the user applications in sync.
The workflow of the initial pattern deployment is the following:

0. All helm charts and yaml files below are referenced directly from a remote git repo (the GitOps way). The branch being chosen is the one set to locally when running `make install`. In order to switch branch on an existing pattern, the user needs to run `make upgrade`. This will trigger a change in a helm variable pointing to the git revision which will then propagate throughout the cluster.
1. `make install` gets invoked which calls `helm install common/install`. This will install the main ArgoCD instance on the HUB cluster.
2. Step 1. will also do a helm install of the `common/clustergroup` chart. This will install a number of helm charts thanks to the customizable content defined in `values-hub.yaml`. Amongst other things it will install ACM, HashiCorp Vault, the External Secrets operator (and a few more)
3. The helm chart for ACM will install it and push out some cluster policies in order to add the necessary yaml files to configure ArgoCD on the remote clusters that will join the ACM hub. It will create the main ArgoCD instance on the remote cluster and run the `common/clustergroup` helm chart
4. The `common/clustergroup` chart will do it's thing like on the hub, except this time it will be the `values-region-one.yaml` file driving the list of things to be installed.

## The problem

The problem manifested itself in the following way: The user deployed the pattern from the `main` branch on to the clusters. Then the git branched was changed to something else (`feature-branch`), a new helm chart/application was added to the regional cluster (so in `values-region-one.yaml`) and the changes were pushed (`git push` and `make upgrade`). After the push, the application would never show up on the regional cluster.

## The symptoms

After a short investigation, it was clear that something was off when ACM was pushing the `common/clustergroup` Argo Application on to the regional cluster. We could observe the following yaml:

```sh
$ oc oc get -n openshift-gitops application multicloud-gitops-region-one -o yaml
...
project: default
source:
 repoURL: 'https://github.com/mbaldessari/multicloud-gitops.git'
 path: common/clustergroup
 targetRevision: feature-branch
 helm:
   valueFiles:
    - >-
      https://github.com/mbaldessari/multicloud-gitops/raw/feature-branch/values-global.yaml
    - >-
      https://github.com/mbaldessari/multicloud-gitops/raw/feature-branch/values-region-one.yaml
    - >-
      https://github.com/mbaldessari/multicloud-gitops/raw/main/values-global.yaml
    - >-
      https://github.com/mbaldessari/multicloud-gitops/raw/main/values-region-one.yaml
...
```

That list under the `valueFiles` attribute was wrong. It still contained references to the old `main` branch. To make matters worse they were listed after `feature-branch` making the value files from the new branch effectively useless. It really seemed like ACM was not really pushing out the changed policy fully. It's as if a merge happened when an existing application was changed.

## Resolution

The problem turned out to be in how we pushed out the ArgoCD Application via ACM. We did this:

```sh
apiVersion: policy.open-cluster-management.io/v1
kind: Policy
metadata:
  name: {{ .name }}-clustergroup-policy
  annotations:
    argocd.argoproj.io/sync-options: SkipDryRunOnMissingResource=true
    argocd.argoproj.io/compare-options: IgnoreExtraneous
spec:
  remediationAction: enforce
  disabled: false
  policy-templates:
    - objectDefinition:
        apiVersion: policy.open-cluster-management.io/v1
        kind: ConfigurationPolicy
        metadata:
          name: {{ .name }}-clustergroup-config
        spec:
          remediationAction: enforce
          severity: med
          namespaceSelector:
            exclude:
              - kube-*
            include:
              - default
          object-templates:
            - complianceType: musthave
              objectDefinition:
                apiVersion: argoproj.io/v1alpha1
                kind: Application
                metadata:
                  name: {{ $.Values.global.pattern }}-{{ .name }}
                  namespace: openshift-gitops
                  finalizers:
                  - argoproj.io/finalizer
                spec:
                  project: default
                  source:
                    repoURL: {{ coalesce .repoURL $.Values.global.repoURL }}
                    targetRevision: {{ coalesce .targetRevision $.Values.global.targetRevision }}
                    path: {{ default "common/clustergroup" .path }}
                    helm:
                      valueFiles:
                      - "{{ coalesce .valuesDirectoryURL $.Values.global.valuesDirectoryURL }}/values-global.yaml"
                      - "{{ coalesce .valuesDirectoryURL $.Values.global.valuesDirectoryURL }}/values-{{ .name }}.yaml"
                      parameters:
                      - name: global.repoURL
                        value: $ARGOCD_APP_SOURCE_REPO_URL
...
```

The problem was entirely into the `complianceType: musthave`. Quoting the docs at <https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.4/html-single/governance/index#configuration-policy-yaml-table> we have three possibilities:

* `mustonlyhave` Indicates that an object must exist with the exact name and relevant fields.
* `musthave` Indicates an object must exist with the same name as specified object-template. The other fields in the template are a subset of what exists in the object.
* `mustnothave`` Indicated that an object with the same name or labels cannot exist and need to be deleted, regardless of the specification or rules.

So `musthave` does not imply that the object being applied is *identical* to what is specified in the policy. The actual consequence of that on a real deployment is the following:

Existing object

```yaml
- foo:
   - a
   - b
```

If the above template gets changed in ACM:

```yaml
- foo:
   - c
   - d
```

The end result in case of 'musthave' complianceType will be:

```yaml
- foo:
   - a
   - b
   - c
   - d
```

Changing the complianceType to `mustonlyhave` fixed the issue as it enforced the template fully on the remote cluster and solved this issue.

## Thanks

Special thanks to Ilkka Tengvall and Christian Stark for their help and patience.
