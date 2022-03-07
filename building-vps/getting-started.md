---
layout: default
title: Getting Started
parent: Creating a new pattern
nav_order: 2
---

# Getting started creating a new pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

Please make sure you ave read the [introduction section](/creating-a-new-pattern.md) and the [structure](building-vps/structure.md) section of this documentation.

# You're probably not starting from scratch

The validated patterns community has relied on existing architectures that have been successfully deployed in an enterprise. The architecture itself is a best practice in assembling technologies and projects to provide a working solution. How that solution is deployed and managed is a different matter. It may have evolved over time and may have grown in its deployment such that ongoing maintenance is not sustainable.

The validated patterns framework is much more of a best practice of structuring the various configuration assets and integrating with GitOps and DevOps tools.

Therefore the question really is: how do I move my successful architecture solution into a sustainable GitOps/DevOps framework? And that is what we are going to do in this section.

# Moving to the validated patterns framework

One of the first things that you should do is look at your current implementation of your workload and identify the kubernetes manifests that are involved in order to run the workloads.

## When and how to use `values-` files

There are 4 values files that make up any Validated Pattern.  The values files are:

* values-<main-hub>.yaml  (e.g. values-datacenter.yaml)
* values-<edge>.yaml (e.g. values-edge-site.yaml or values-factory.yaml)
* values-global.yaml
* values-secrets.yaml

## Operators into framework

We begin our journey by identifying what application services are needed to run the workload.  The Cloud Native Operator framework provides a way of managing the lifecycle of application services that are needed by the application workload.  The validated pattern framework gives you a way to describe these Operators in a values file that is specific to your pattern and the site type.

So for example if we wish deploy Advanced Cluster Management, AMQ (messaging) and AMQ Streams (Kafka) in our datacenter, we would make the following subscription entries in our `values-datacenter.yaml` file:

```yaml
namespaces:
  - open-cluster-management
  - my-application
  - backend-storage

subscriptions:
  - name: advanced-cluster-management
    namespace: open-cluster-management
    channel: release-2.3
    csv: advanced-cluster-management.v2.3.2

  - name: amq-streams
    namespace: my-application
    channel: amq-streams-1.7.x
    csv: amqstreams.v1.7.1

  - name: amq-broker
    namespace: my-application
    channel: 7.8.x
    csv: amq-broker-operator.v7.8.1-opr-3
```

This tells the framework which Operators are needed and what namespace they should be deployed in.

## Grouping applications for OpenShift GitOps

In the same values- file we need to inform OpenShift GitOps (ArgoCD) what applications to deploy and where the Helm Charts are so that they can be applied to the deployment and watched for future changes.

When using GitOps and specifically OpenShift GitOps (ArgoCD) it makes sense to break up applications into different areas of concern, i.e. projects. For example the main applications for the datacenter might be grouped separately from some storage components

```yaml
projects:
- datacenter
- storage

applications:
- name: acm
  namespace: open-cluster-management
  project: datacenter
  path: common/acm
  ignoreDifferences:
  - group: internal.open-cluster-management.io
    kind: ManagedClusterInfo
    jsonPointers:
    - /spec/loggingCA

- name: central-kafka
  namespace: backend-storage
  project: storage
  path: charts/datacenter/kafka
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas
  - group: route.openshift.io
    kind: Route
    jsonPointers:
    - /status
  - group: image.openshift.io
    kind: ImageStream
    jsonPointers:
    - /spec/tags
  - group: apps.openshift.io
    kind: DeploymentConfig
    jsonPointers:
    - /spec/template/spec/containers/0/image

  - name: cool-app
    namespace: my-application
    project: datacenter
    path: charts/datacenter/my-app
    plugin:
      name: helm-with-kustomize
```

In the above example `acm` (ACM) is part of the main `datacenter` deployment, as is `cool-app`. However `central-kafka` is part of `backend-storage`.

The `path:` tag tells OpenShift GitOps where to find the Helm charts needed to deploy this application (refer back to the [charts directory description](https://hybrid-cloud-patterns.io/building-vps/structure/#the-charts-directory) for more details). OpenShift GitOps will continuously monitor for changes to artifacts in that location for updates to apply.

Each different site type would have it's own values- file listing subscriptions and applications.

## Scripts to framework

## Ansible to Framework

## Kustomize to framework

Kustomize can still be used within the framework but it will be driven by Helm. If you have a lot of `kustomization.yaml` you may not need to refactor all of it. However you will need a Helm chart to drive it and you will need to check for names and paths etc. that you may need to parameterize using the Helm templates capabilities.

For example the original ArgoCD subscription YAML from one of the patterns looked like this:

``` yaml
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: argocd-operator
  namespace: argocd
spec:
  channel: alpha
  installPlanApproval: Manual
  name: argocd-operator
  source: community-operators
  sourceNamespace: openshift-marketplace
  startingCSV: argocd-operator.v0.0.11
```

While we could have continued to use the ArgoCD community operator we transitioned to using OpenShift GitOps, the Red Hat supported product. But this static subscription would not allow updates for continuous integration of new versions. And you'll remember from the Operators section above that we specify channel names as part of the subscription of operators. So we can instead using something like this (understanding the move to openshift-gitops-operator instead of ArgoCD).

```yaml
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: openshift-gitops-operator
  namespace: openshift-operators
  labels:
    operators.coreos.com/openshift-gitops-operator.openshift-operators: ""
spec:
  channel: {{ .Values.main.gitops.channel }}
  installPlanApproval: {{ .Values.main.options.installPlanApproval }}
  name: openshift-gitops-operator
  source: redhat-operators
  sourceNamespace: openshift-marketplace
{{- if .Values.main.options.useCSV }}
  startingCSV: openshift-gitops-operator.{{ .Values.main.gitops.csv }}
{{- end }}
```

# Lessons learned

## Size matters

If things are taking a long time to deploy, use the OpenShift console to check on memory and other potential capacity issues with the cluster. If running in a cloud you may wish to up the machine size. Check the [sizing charts](https://hybrid-cloud-patterns.io/infrastructure/).
