---
title: Getting Started
weight: 10
aliases: /industrial-edge/getting-started/
---

# Deploying the Industrial Edge Pattern

# Prerequisites

1. An OpenShift cluster (Go to [the OpenShift console](https://console.redhat.com/openshift/create)). Cluster must have a dynamic StorageClass to provision PersistentVolumes. See also [sizing your cluster](../../industrial-edge/cluster-sizing).
1. (Optional) A second OpenShift cluster for edge/factory
1. A quay account with the following repositories set as public:

    - http-ionic
    - httpd-ionic
    - iot-anomaly-detection
    - iot-consumer
    - iot-frontend
    - iot-software-sensor

The use of this pattern depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the data
center assets and a separate cluster(s) for the factory assets.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## Prerequisites

For installation tooling dependencies, see [Patterns quick start](/learn/quickstart)


# How to deploy

1. Fork the [industrial-edge](https://github.com/validatedpatterns/industrial-edge) repository on GitHub.  It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Fork the [manuela-dev](https://github.com/validatedpatterns-demos/manuela-dev) repository on GitHub.  It is necessary to fork this repository because the GitOps framework will push tags to this repository that match the versions of software that it will deploy.

1. Clone the forked copy of the `industrial-edge` repository. Create a deployment branch using the branch `v2.3`.

   ```sh
   git clone git@github.com:{your-username}/industrial-edge.git
   cd industrial-edge
   git checkout v2.3
   git switch -c deploy-v2.3
   ```

1. A `values-secret-industrial-edge.yaml` file is used to automate setup of secrets needed for:

   - A git repository hosted on a service such as GitHub, GitLab, or so on.
   - A container image registry (E.g. Quay)
   - S3 storage (E.g. AWS)

   DO NOT COMMIT THIS FILE. You do not want to push personal credentials to GitHub.

   ```sh
   cp values-secret.yaml.template ~/values-secret-industrial-edge.yaml
   vi ~/values-secret-industrial-edge.yaml
   ```

1. Customize the following secret values.

   ```yaml
   version: "2.0"
   secrets:
   - name: imageregistry
         fields:
       # E.G. Quay -> Robot Accounts -> Robot Login
       - name: username
         value: <Your-Robot-Account>
       - name: password
         value: <Your-RobotAccount-Password>

     - name: git
       fields:
       # Go to: https://github.com/settings/tokens
       - name: username
         value: <github-user>
       - name: password
         value: <github-token>

     - name: aws
       fields:
       - name: aws_access_key_id
         ini_file: ~/.aws/credentials
         ini_key: aws_access_key_id
       - name: aws_secret_access_key
         ini_file: ~/.aws/credentials
         ini_key: aws_secret_access_key
   ```

1. Customize the deployment for your cluster. Change the appropriate values in `values-global.yaml`

   ```yaml
   main:
   clusterGroupName: datacenter

   global:
   pattern: industrial-edge

   options:
      useCSV: False
      syncPolicy: Automatic
      installPlanApproval: Automatic

   imageregistry:
      account: PLAINTEXT
      hostname: quay.io
      type: quay

   git:
      hostname: github.com
      account: PLAINTEXT
      #username: PLAINTEXT
      email: SOMEWHERE@EXAMPLE.COM
      dev_revision: main
   ```

   ```sh
   vi values-global.yaml
   git add values-global.yaml
   git commit -m "Added personal values to values-global" values-global.yaml
   git push origin deploy-v2.3
   ```

1. You can deploy the pattern using the [Validated Patterns Operator](/infrastructure/using-validated-pattern-operator/) directly. If you deploy the pattern using the Validated Patterns Operator, installed through `Operator Hub`, you will need to run `./pattern.sh make load-secrets` through a terminal session on your laptop or bastion host.

1. If you deploy the pattern through a terminal session on your laptop or bastion host login to your cluster by using the `oc login` command or by exporting the `KUBECONFIG` file.

   ```sh
   oc login
   ```

   or

   ```sh
   export KUBECONFIG=~/my-ocp-cluster/auth/kubeconfig
   ```

1. Apply the changes to your cluster from the root directory of the pattern.

   ```sh
   ./pattern.sh make install
   ```
 The `make install` target deploys the Validated Patterns Operator, all the resources that are defined in the `values-datacenter.yaml` and runs the `make load-secrets` target to load the secrets configured in your `values-secrets-industrial-edge.yaml` file.

# Validating the Environment

1. Verify that the following Operators are installed on the HUB cluster:

   ```text
   $ oc get operators.operators.coreos.com -A
   NAME                                                  AGE
   advanced-cluster-management.open-cluster-management   3h8m
   amq-broker-rhel8.manuela-tst-all                      3h8m
   amq-streams.manuela-data-lake                         3h8m
   amq-streams.manuela-tst-all                           3h8m
   camel-k.manuela-data-lake                             3h8m
   camel-k.manuela-tst-all                               3h8m
   mcg-operator.openshift-storage                        3h7m
   multicluster-engine.multicluster-engine               3h4m
   ocs-client-operator.openshift-storage                 3h7m
   ocs-operator.openshift-storage                        3h7m
   odf-csi-addons-operator.openshift-storage             3h7m
   odf-operator.openshift-storage                        3h8m
   odf-prometheus-operator.openshift-storage             3h7m
   openshift-gitops-operator.openshift-operators         3h11m
   openshift-pipelines-operator-rh.openshift-operators   3h8m
   patterns-operator.openshift-operators                 3h12m
   recipe.openshift-storage                              3h7m
   rhods-operator.redhat-ods-operator                    3h8m
   rook-ceph-operator.openshift-storage                  3h7m
   ```

1. Access the ArgoCD environment

   You can find the ArgoCD application links listed under the nine box **Red Hat applications** in the OpenShift Container Platform web console.

   FIXME(bandini): needs a newer image
   ![ArgoCD Links](/images/ocp-applications-menu.png)

   The most important ArgoCD instance to examine at this point is `data-center-gitops-server`. This is where all the applications for the datacenter, including the test environment, can be tracked.

   
1. Apply the secrets from the `values-secret-industrial-edge.yaml` to the secrets management Vault. This can be done through Vault's UI - manually without the file. The required secrets and scopes are:

   FIXME(bandini): This is terrible worded and with the registry work we can drop the whole thing.
   - **secret/hub/imageregistry** Quay or DockerHub *username* & *password*

   Using the Vault UI check that the secrets have been setup.

   For more information on secrets management see [here](/secrets). For information on Hashicorp's Vault see [here](/secrets/vault)

1. Check that all applications are synchronised

## Next Steps

Once the data center has been setup correctly and confirmed to be working, you can:

1. Add a dedicated cluster to [deploy the factory pieces using ACM](/industrial-edge/factory)
2. Once the data center and the factory have been deployed you will want to check out and test the Industrial Edge 2.0 demo code. You can find that [here](../application/)

   a. Making [configuration changes](https://validatedpatterns.io/industrial-edge/application/#configuration-changes-with-gitops) with GitOps
   a. Making [application changes](https://validatedpatterns.io/industrial-edge/application/#application-changes-using-devops) using DevOps
   a. Making [AI/ML model changes](https://validatedpatterns.io/industrial-edge/application/#application-ai-model-changes-with-devops) with DevOps

# Uninstalling

We currently do not support uninstalling this pattern.

# Help & Feedback

[Help & Feedback](https://groups.google.com/g/validatedpatterns) [Report Bugs](https://github.com/validatedpatterns/industrial-edge/issues)
