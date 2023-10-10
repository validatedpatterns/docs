---
title: Getting Started
weight: 10
aliases: /multicloud-gitops/getting-started/
---

# Deploying the Multicloud GitOps pattern

## Prerequisite

* An OpenShift cluster
  * To create an OpenShift cluster, go to the [Red Hat Hybrid Cloud console](https://console.redhat.com/).
  * Select **Services -> Containers -> Create cluster**.
  * The cluster must have a dynamic `StorageClass` to provision `PersistentVolumes`. See [sizing your cluster](../../multicloud-gitops/mcg-cluster-sizing).
* Optional: A second OpenShift cluster for multicloud demonstration.
* The git binary and podman. For details see [Installing Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [Installing Podman](https://podman.io/getting-started/installation)

The use of this pattern depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster, you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## Procedure

1. For installation tooling dependencies, see link:https://validatedpatterns.io/learn/quickstart/[Patterns quick start].

   {% include prerequisite-tools.md %}

2. Fork the [rh-multicloud-gitops-pxe](https://github.com/portworx/rh-multicloud-gitops-pxe) repository on GitHub. It is recommended to fork because you can update your fork as part of the GitOps and DevOps processes.

3. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/multicloud-gitops-pxe.git
    ```

4. Create a local copy of the secret values file that can safely include credentials.

    **Warning:**
    Do not commit this file. You do not want to push personal credentials to GitHub.
    Note that if you do not want to customize the secrets, these steps are not needed.
    The framework generates a random password for the config-demo application.

    ```sh
    cp values-secret.yaml.template ~/values-secret-multicloud-gitops-pxe.yaml
    vi ~/values-secret-multicloud-gitops-pxe.yaml
    ```

5. Customize the deployment for your cluster.

   ```sh
   git checkout -b my-branch
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

6. You can deploy the pattern by running `./pattern.sh make install` or by using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/).

##  Deploying the cluster by using the pattern.sh file
To deploy the cluster by using the `pattern.sh` file, complete the following steps:

1. Login to your cluster using oc login or exporting the `KUBECONFIG`.

    ```sh
    oc login
    ```

    or set `KUBECONFIG` to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubeconfig
    ```

2. Deploy the pattern to your cluster.

    ```sh
    ./pattern.sh make install
    ```

4. Verify that the Operators have been installed.
    1. To verify, in the *OpenShift Container Platform web console, navigate to **Operators → Installed Operators** page.
    2.Check that the Operator is installed in the `openshift-operators` namespace and its status is `Succeeded`.
<!-- Get a SME review for this step 5 -->
5. Verify that all applications are synchronized. Under the project `multicloud-gitops-hub` click the URL for the `hub` gitops `server`. The Vault application is not synched.

[![Multicloud GitOps Hub](/images/multicloud-gitops-Portworx/multicloud-gitops-argocd.png)](/images/multicloud-gitops-Portworx/multicloud-gitops-argocd.png)

<!-- Moved Deploying the managed cluster applications section under next step (or it should be a separate file-->

## Multicloud GitOps application demos

As part of this pattern, HashiCorp Vault has been installed. Refer to the section on [Vault](https://validatedpatterns.io/secrets/vault/).

<!--The Next steps heading is not inline with the chapter and only points to contibution links for help and feedback or bugs -->
# Next steps

## Deploying the managed cluster applications

After the management hub is set up and works correctly, attach one or more managed clusters to the architecture (see diagrams below).

For instructions on deploying the edge, refer to [Managed Cluster Sites](https://validatedpatterns.io/patterns/multicloud-gitops-portworx/managed-cluster/).

>Contribute to this pattern:
{{% button text="Help & Feedback" url="https://groups.google.com/g/validatedpatterns" %}}
{{% button text="Report Bugs" url="https://github.com/portworx/rh-multicloud-gitops-pxe/issues" color-class="btn-red" %}}
