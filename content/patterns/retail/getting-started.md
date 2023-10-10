---
title: Getting Started
weight: 10
aliases: /retail/getting-started/
---

# Deploying the Retail Pattern

## Prerequisites

1. An OpenShift cluster (Go to [the OpenShift console](https://console.redhat.com/openshift/create)). Cluster must have a dynamic StorageClass to provision PersistentVolumes. See also [sizing your cluster](../../retail/cluster-sizing).
1. (Optional) A second OpenShift cluster for a second store environment, "raleigh".
1. A GitHub account
1. (Optional) A quay account that can update images; this is if you want to use the pipelines to customize the applications
1. (Optional) A quay account with the following repositories set as public, and which you can write to:

    - quarkuscoffeeshop-barista
    - quarkuscoffeeshop-counter
    - quarkuscoffeeshop-customerloyalty
    - quarkuscoffeeshop-customermocker
    - quarkuscoffeeshop-inventory
    - quarkuscoffeeshop-kitchen
    - quarkuscoffeeshop-majestic-monolith
    - quarkuscoffeeshop-web

   These repos comprise the microservices that are in the demo. The public repos (quay.io/hybrid-cloud-patterns/*) contain pre-built images which will be downloaded and used by default; so the demo will run regardless of whether you choose to rebuild the apps or not. This mechanism is provided for transparency purposes (so you can reproduce the same results); or if you want to customize or change the apps themselves in some way.

The use of this pattern depends on having at least one running Red Hat
OpenShift cluster. All of the apps will run on a single cluster; optionally you can use RHACM to apply the store apps to a second cluster.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## Prerequisite Tools

Install the installation tooling dependencies. You will need:

{% include prerequisite-tools.md %}

## How to deploy

1. Fork the [retail](https://github.com/validatedpatterns/retail) repository on GitHub.

1. Clone the forked copy of the `retail` repo. Use branch `v1.0'.

   ```sh
   git clone git@github.com:{your-username}/retail.git
   cd retail
   git checkout v1.0
   ```

1. You could create your own branch where you specific values will be pushed to:

   ```sh
   git checkout -b my-branch
   ```

1. A `values-secret.yaml` file is used to automate setup of secrets needed for:

   - A container image registry (E.g. Quay)

   DO NOT COMMIT THIS FILE. You do not want to push personal credentials to GitHub.

   ```sh
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```

1. Customize the deployment for your cluster. Change the appropriate values in `values-global.yaml`

   ```sh
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

In particular, the values that you need to change are under the `imageregistry` key, to use your own account and hostname. If you like, you can change the git settings (`account`, `email`, `hostname` to reflect your own account settings).

If you plan to customize the build of the applications themselves, there `revision` and `imageTag` settings for each of them. The defaults should suffice if you just want to see the apps running.

1. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

1. Preview the changes

   ```sh
   ./pattern.sh make show
   ```

1. Login to your cluster using oc login or exporting the KUBECONFIG

   ```sh
   oc login
   ```

   or

   ```sh
   export KUBECONFIG=~/my-ocp-env/retail-hub
   ```

1. Apply the changes to your cluster

   ```sh
   ./pattern-util.sh make install
   ```

This will execute `make install` in the team's container, which will take a bit to load the first time. It contains ansible and other dependencies so that you do not need to install them on your workstation.

The default `install` target will:

1. Install the pattern via the operator
1. Load the imageregistry secret into the vault
1. Start the application build pipelines

If you chose not to put in your registry credential, `make install` cannot complete successfully because it waits for the secret to be populated before starting the pipelines.

If you do not want to run the (optional) components, another install target is provided:

```text
./common/scripts/pattern-util.sh make install-no-pipelines
```

This skips the vault setup and the pipeline builds, but still installs both Vault and the Pipelines operator, so if you want to run those in your installation later, you can run `make install` to enable them.

For more information on secrets management see [here](/secrets). For information on Hashicorp's Vault see [here](/secrets/vault)

## Validating the Environment

Check the operators have been installed

   ```text
   UI -> Installed Operators
   ```

[![retail-v1-operators](/images/retail/retail-v1-operators.png)](/images/retail/retail-v1-operators.png)

The OpenShift console menu should look like this. We will use it to validate that the pattern is working as expected:

[![retail-v1-console-menu](/images/retail/retail-v1-console-menu.png)](/images/retail/retail-v1-console-menu.png)

Check on the pipelines, if you chose to run them. They should all complete successfully:

[![retail-v1-pipelines](/images/retail/retail-v1-pipelines.png)](/images/retail/retail-v1-pipelines.png)

Ensure that the Hub ArgoCD instance shows all of its apps in Healthy and Synced status once all of the images have been built:

[![retail-v1-argo-apps-p1](/images/retail/retail-v1-argo-apps-p1.png)](/images/retail/retail-v1-argo-apps-p1.png)

We will go to the Landing Page, which will present the applications in the pattern:

[![retail-v1-landing-page](/images/retail/retail-v1-landing-page.png)](/images/retail/retail-v1-landing-page.png)

Clicking on the Store Web Page will place us in the Quarkus Coffeeshop Demo:

[![retail-v1-store-page](/images/retail/retail-v1-store-page.png)](/images/retail/retail-v1-store-page.png)

Clicking on the TEST Store Web Page will place us in a separate copy of the same demo.

Clicking on the respective Kafdrop links will go to a Kafdrop instance that allows inspection of each of the respective environments.

[![retail-v1-kafdrop](/images/retail/retail-v1-kafdrop.png)](/images/retail/retail-v1-kafdrop.png)

## Next Steps

[Help & Feedback](https://groups.google.com/g/validatedpatterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/validatedpatterns/retail/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
