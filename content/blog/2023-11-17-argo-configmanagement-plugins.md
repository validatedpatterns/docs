---
date: 2023-11-17
title: Argo CD Config Management Plugins in Validated Patterns
summary: Validated Patterns now support sidecar configmanagement plugins in ArgoCD
author: Martin Jackson
blog_tags:
- openshift-platform-plus
- devsecops
- devops
- patterns
- pipelines
- gitops
aliases: /2023/11/17/argocd-cmps/
---

# Argo CD Configuration Management Plugins and the Validated Patterns Framework

## Problem

Argo CD has a number of mechanisms for facilitating Kubernetes application deployments besides applying raw manifests.
The most prominent mechanisms it uses are Kustomize (which is built into kubectl now) and Helm (which is an external tool still). If the user has additional needs for manifest generation that cannot be met by either of these tools, Argo CD
provides a mechanism called Configuration Management Plugins that allow for editing the manifest stream either in
addition to or in lieu of Helm or Kustomize. This mechanism allows, for example, using both Helm and Kustomize on the
same template files and/or bases at the same time. If the user needs a custom tool, such as [PolicyGen](https://cloud.redhat.com/blog/generating-governance-policies-using-kustomize-and-gitops) to be involved in generating Kubernetes
manifests, this feature enables its use. Similarly, another use for this feature is to enable the
[Argo CD Vault Plugin](https://github.com/argoproj-labs/argocd-vault-plugin), which works by substituting specific tags
in manifests. This allows users to avoid storing secrets directly in git repositories, which is one of the key needs
of an operational GitOps strategy.

## Implementation

The implementation in the Validated Patterns framework is meant to conform to the mechanism described [here](https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/) upstream. Note that the plugin configuration
actually must live inside the container - either "baked in" to the sidecar image, or injected via configmap. The
framework supports both options.

Previously, the Validated Patterns `clusterGroup` chart would create three plugins using the CMP 1.0 framework. Only one
of these was ever used (to the best of our knowledge), `helm-with-kustomize` in the [Industrial Edge](https://github.com/validatedpatterns/industrial-edge) pattern. As of this publication, the kustomize integration is no longer necessary -
the code was refactored to operate directly on helm value files instead of creating dynamic kustomize patches.

In the `clusterGroup` chart (which is the heart of the Validated Patterns framework), there is a new key, `argoCD`,
that can optionally be used to implement an arbitrary number of CMP 2.0-style plugins.

For example:

```yaml
  argoCD:
    initContainers: []
    configManagementPlugins:
      - name: helm-with-kustomize
        image: quay.io/hybridcloudpatterns/utility-container:latest
        imagePullPolicy: Always
        pluginArgs:
          - '--loglevel=debug'
        pluginConfig: |
          apiVersion: argoproj.io/v1alpha1
          kind: ConfigManagementPlugin
          metadata:
            name: helm-with-kustomize
          spec:
            preserveFileMode: true
            init:
              command: ["/bin/sh", "-c"]
              args: ["helm dependency build"]
            generate:
              command: ["/bin/bash", "-c"]
              args: ["helm template . --name-template ${ARGOCD_APP_NAME:0:52}
                -f $(git rev-parse --show-toplevel)/values-global.yaml
                -f $(git rev-parse --show-toplevel)/values-{{ .Values.clusterGroup.name }}.yaml
                --set global.repoURL=$ARGOCD_APP_SOURCE_REPO_URL
                --set global.targetRevision=$ARGOCD_APP_SOURCE_TARGET_REVISION
                --set global.namespace=$ARGOCD_APP_NAMESPACE
                --set global.pattern={{ .Values.global.pattern }}
                --set global.clusterDomain={{ .Values.global.clusterDomain }}
                --set global.hubClusterDomain={{ .Values.global.hubClusterDomain }}
                --set global.localClusterDomain={{ coalesce .Values.global.localClusterDomain .Values.global.hubClusterDomain }}
                --set clusterGroup.name={{ .Values.clusterGroup.name }}
                --post-renderer ./kustomize"]
```

`initContainers` is an array of initContainers that will be added to the repo-server pod. In most cases you do not need
to do this. (By default, an init container in the repo-server pod will copy the argocd binary into /var to run as the
cmp server for the container. This behavior will happen even if you specify nothing here, which is the default. Since
the argocd kind supports this, so do we.)

`configManagementPlugins` is an array. Each element will add one sidecar plugin to the GitOps repo-server pod the
clusterGroup chart controls. In the `argoCD` instance it primarily adds elements to the `sidecarContainers` property.

The `name` element is the name of the plugin - this is how applications can specifically request that Argo CD/GitOps
process the manifests. This name is also used to compose a configmap name if the user specifies the pluginConfig string.

The `image` element is the image the sidecar will use. The repo-server default initContainer will copy the argocd server
into the image; the user must supply any external binaries though.

The `imagePullPolicy` element is optional. It defaults to `Always` if not specified.

The `pluginArgs` element is optional, and is an array. If omitted, it does not have a default. It can be used to turn
up the debug level of the cmp-server process inside the container.

The `pluginConfig` element is a string, and is optional. If specified, it will be passed through the Helm `tpl`
function, so any recognized Helm variables or functions will be rendered. The chart will arrange for this string to
be injected into the sidecar as `plugin.yaml` via configmap. While it is possible to bake this into the sidecar, changes
to the plugin.yaml would require the sidecar image to be rebuilt and redeployed, and the repo-server pod restarted. It
is a documented method in the upstream documentation, so the framework allows it.

Please note that the `preserveFileMode` setting in the example plugin config is not yet supported in Argo CD 2.6/GitOps
Operator 1.8, but is in Argo CD 2.8/GitOps Operator 1.10. The main use for this property is to call executables inside
the repository as post-renderers (as this example does). Please be aware that there are security concerns associated
with doing this. The suggested practice is to ship any executable programs (including shell scripts, Python scripts
etc.) as part of the sidecar image.

## History

### How CMPs came into the Validated Patterns Framework

In the beginning, the Validated Patterns framework had not yet developed its preference (though not, as occasionally
reported, an insistence) for Helm, and most of the existing gitops repositories were based on kustomize. The first
pattern implemented with the framework was [industrial-edge](https://github.com/validatedpatterns/industrial-edge).
This was based on the [MANUela](https://github.com/sa-mw-dach/manuela) demo, which was completely based on kustomize.

We developed the Validated Patterns framework, to some degree, around what the industrial-edge pattern needed. One of
the things we wanted to do was to find ways to allow the framework to be used to instantiate a demo without requiring
the user to configure things that could be automatically discovered from the environment. So - the user has to
configure their own credentials for connecting to git forges and container registries; but the domain the OpenShift
cluster that will be running the demo can be discovered, so rather than requiring that to be configured, we provided a
mechanism that extracted that information and stored it as a Helm variable. Meanwhile, the components of industrial-edge
that used this information had very opinionated kustomize-based deployment mechanisms and workflows to update them.
We did not want to change this mechanism at the time, so it was better for us to work out how to apply Helm templating
on top of a set of of manifests that kustomize had already rendered. The CMP 1.0 framework was suitable for this, and
fairly straightforward to use, so we did. However, we did not, at that time, put any thought into parameterizing the
use of config management plugins; making too radical a change to how the repo server worked would have difficult, and
would have required injecting a new (and unsupported) image into a product; not something to be undertaken lightly.
Finally, it was unclear that there would be significant demand for such a feature in the framework.

### Questions that arose around CMPs in the Validated Patterns Framework

Of course, there is some common wisdom about making assumptions in situations like this. Two major factors caused us to
revisit the question of config management plugins in the framework. First, one of our prospective users clearly had an
architectural need of the framework that was best met using config management plugins; and upstream, Argo CD had come up
with an entirely new mechanism for implementing CMPs using sidecars. This took the question of rebuilding or
substituting the repo-server image off the table; but required some changes in the framework to accommodate the new
mechanism. Secondly, we learned that the existing plugin framework had been deprecated and was at risk of being removed. It was actually removed upstream in Argo CD 2.9.

Now that the framework supports user-specified sidecar plugins, we would love to hear your feedback. Does our adoption
of CMP 2.0 meet your needs? Please engage with us in our [upstream issue tracker](https://github.com/validatedpatterns/common/issues).
