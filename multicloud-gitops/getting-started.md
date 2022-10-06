---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Multicloud GitOps
nav_order: 1
---

# Deploying the Multicloud GitOps Pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster (Go to [the OpenShift console](https://console.redhat.com/openshift/create)). Cluster must have a dynamic StorageClass to provision PersistentVolumes. See also [sizing your cluster](../../multicloud-gitops/cluster-sizing).
1. (Optional) A second OpenShift cluster for multicloud demonstration or testing
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)

The use of this blueprint depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster, you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# How to deploy

1. Fork the [multicloud-gitops](https://github.com/hybrid-cloud-patterns/multicloud-gitops) repo on GitHub.  It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/multicloud-gitops.git
    ```

1. Create a local copy of the Helm values file that can safely include credentials

    DO NOT COMMIT THIS FILE

    You do not want to push personal credentials to GitHub.

    ```sh
    cp values-secret.yaml.template ~/values-secret.yaml
    vi ~/values-secret.yaml
    ```

1. Customize the deployment for your cluster

   ```sh
   git checkout -b my-branch
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

1. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

1. Preview the changes

    ```sh
    make show
    ```

1. Login to your cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubconfig
    ```

1. Apply the changes to your cluster

    ```sh
    make install
    ```

1. Check the operators have been installed

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

1. Check all applications are synchronised
    Under the project `multicloud-gitops-hub` click on the URL for the `hub`gitops`server`. The Vault application is not synched.

[![Multicloud GitOps Hub](/images/multicloud-gitops/multicloud-gitops-argocd.png)](/images/multicloud-gitops/multicloud-gitops-argocd.png)

# Deploying the managed cluster applications

Once the management hub has been set up correctly and confirmed to be working, it is time to attach one or more managed clusters to the architecture (see diagrams below).

For instructions on deploying the edge, please read the following [document](https://hybrid-cloud-patterns.io/multicloud-gitops/managed-cluster/).

## Multicloud GitOps application demos

As part of this pattern HashiCorp Vault has been installed. Refer to the section on [Vault](https://hybrid-cloud-patterns.io/secrets/vault/).

# Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/multicloud-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
