---
title: Getting Started
weight: 10
aliases: /rag-llm-gitops/getting-started/
---

## Prerequisites

- Podman is installed on your system.
- You have the OpenShift Container Platform installation program and the pull secret for your cluster. You can get these from [Install OpenShift on AWS with installer-provisioned infrastructure](https://console.redhat.com/openshift/install/aws/installer-provisioned).
- Red Hat Openshift cluster running in AWS.

## Procedure

1. Create the installation configuration file using the steps described in [Creating the installation configuration file](https://docs.openshift.com/container-platform/latest/installing/installing_aws/ipi/installing-aws-customizations.html#installation-initializing_installing-aws-customizations).

   > **Note:**
   > Supported regions are `us-east-1` `us-east-2` `us-west-1` `us-west-2` `ca-central-1` `sa-east-1` `eu-west-1` `eu-west-2` `eu-west-3` `eu-central-1` `eu-north-1` `ap-northeast-1` `ap-northeast-2` `ap-northeast-3` `ap-southeast-1` `ap-southeast-2` and `ap-south-1`. For more information about installing on AWS see, [Installation methods](https://docs.openshift.com/container-platform/latest/installing/installing_aws/preparing-to-install-on-aws.html).
   >

2. Customize the generated `install-config.yaml` creating one control plane node with instance type `m5.2xlarge` and 3 worker nodes with instance type `m5.2xlarge`. A sample YAML file is shown here:
   ```yaml
   additionalTrustBundlePolicy: Proxyonly
   apiVersion: v1
   baseDomain: aws.validatedpatterns.io
   compute:
   - architecture: amd64
     hyperthreading: Enabled
     name: worker
     platform:
      aws:
        type: m5.2xlarge
     replicas: 3
   controlPlane:
     architecture: amd64
     hyperthreading: Enabled
     name: master
     platform:
       aws:
         type: m5.2xlarge
     replicas: 1
   metadata:
     creationTimestamp: null
     name: kevstestcluster
   networking:
     clusterNetwork:
     - cidr: 10.128.0.0/14
       hostPrefix: 23
     machineNetwork:
     - cidr: 10.0.0.0/16
     networkType: OVNKubernetes
     serviceNetwork:
     - 172.30.0.0/16
     platform:
       aws:
         region: us-east-1
     publish: External
     pullSecret: '<pull-secret>'
     sshKey: |
       ssh-ed25519 <public-key> someuser@redhat.com
   ```

3. Fork the [rag-llm-gitops](https://github.com/validatedpatterns/rag-llm-gitops.git) git repository.

4. Clone the forked repository by running the following command:

   ```sh
   $ git clone git@github.com:your-username/rag-llm-gitops.git
   ```
5. Go to your repository: Ensure you are in the root directory of your git repository by using the following command:

   ```sh
   $ cd rag-llm-gitops
   ```
6. Create a local copy of the secret values file by running the following command:

   ```sh
   $ cp values-secret.yaml.template ~/values-secret-rag-llm-gitops.yaml
   ```
   > **Note:**
   >For this demo, editing this file is unnecessary as the default configuration works out of the box upon installation.

7. Add the remote upstream repository by running the following command:

   ```sh
   $ git remote add -f upstream git@github.com:validatedpatterns/rag-llm-gitops.git
   ```
8. Create a local branch by running the following command:

   ```sh
   $ git checkout -b my-test-branch main
   ```

9. By default the pattern deploys the EDB Postgres for Kubernetes as a vector database. To deploy Redis, change the `global.db.type` parameter to the `REDIS` value in your local branch in `values-global.yaml`. For more information see, [Deploying a different databases](/rag-llm-gitops/deploy-different-db/) to change the vector database.

10. By default instance types for the GPU nodes are `g5.2xlarge`. Follow the [Customize GPU provisioning nodes](/rag-llm-gitops/gpuprovisioning/) to change the GPU instance types.

11. Run the following command to push `my-test-branch` (including any changes) to the origin remote repository:

    ```sh
    $ git push origin my-test-branch
    ```
12. Ensure you have logged in to the cluster at both command line and the console by using the login credentials presented to you when you installed the cluster. For example:

    ```sh
    INFO Install complete!
    INFO Run 'export KUBECONFIG=<your working directory>/auth/kubeconfig' to manage the cluster with 'oc', the OpenShift CLI.
    INFO The cluster is ready when 'oc login -u kubeadmin -p <provided>' succeeds (wait a few minutes).
    INFO Access the OpenShift web-console here: https://console-openshift-console.apps.demo1.openshift4-beta-abcorp.com
    INFO Login to the console with user: kubeadmin, password: <provided>
    ```
13. Add GPU nodes to your existing cluster deployment by running the following command:

    ```sh
    $ ./pattern.sh make create-gpu-machineset
    ```
    > **Note:**
    > You may need to create a file `config` in your home directory and populate it with the region name.
    > 1. Run the following:
    > ```sh
    > vi ~/.aws/config
    > ```
    > 2. Add the following:
    > ```sh
    > [default]
    > region = us-east-1
    > ```

14. Adding the GPU nodes should take about 5-10 minutes. You can verify the addition of these `g5.2xlarge` nodes in the OpenShift web console under **Compute** > **Nodes**.

15. Install the pattern with the demo application by running the following command:

    ```sh
    $ ./pattern.sh make install
    ```

    > **Note:**
    > This deploys everything you need to run the demo application including the Nividia GPU Operator and the Node Feature Discovery Operator used to determine your GPU nodes.
    >

## Verify the Installation

1. In the OpenShift web console go to the **Workloads** > **Pods** menu.

2. Select the `rag-llm` project from the drop down.

3. Following pods should be up and running.

   ![Pods](/images/rag-llm-gitops/rag-llm.png)

### Launch the application

- Click the `Application box` icon in the header, and select `Retrieval-Augmented-Generation (RAG) LLM Demonstration UI`

  ![Launch Application](/images/rag-llm-gitops/launch-application-main_menu.png)

- It should launch the application

  ![Application](/images/rag-llm-gitops/application.png)

### Generate the proposal document

- The demo generates a proposal document using the default provider `Mistral-7B-Instruct`; a model available on Hugging Face. It is a fine-tuned version of the base `Mistral-7B` model.

- Enter any company name for example `Microsoft`.
- Enter the product as `RedHat OpenShift AI`
- Click the `Generate` button, a project proposal should be generated. The project proposal also contains the reference of the RAG content. The project proposal document can be Downloaded in the form of a PDF document.

  ![Routes](/images/rag-llm-gitops/proposal.png)


