---
title: Getting Started
weight: 10
aliases: /rag-llm-gitops/getting-started/
---

## Prerequisites

- Podman
- Red Hat Openshift cluster running in AWS. Supported regions are `us-west-2` and `us-east-1`. For more information about installing on AWS see, [Installation methods](https://docs.openshift.com/container-platform/latest/installing/installing_aws/preparing-to-install-on-aws.html). 
- GPU Node to run Hugging Face Text Generation Inference server on Red Hat OpenShift cluster.

## Procedure

1. Fork the [rag-llm-gitops](https://github.com/validatedpatterns/rag-llm-gitops.git) git repository.

2. Clone the forked repository by running the following command: 

   ```sh
   $ git clone git@github.com:your-username/multicloud-gitops.git
   ```
3. Go to your repository: Ensure you are in the root directory of your git repository by using the following command:

   ```sh
   $ cd rag-llm-gitops
   ```
3. Create a local copy of the secret values file by running the following command:

   ```sh
   $ cp values-secret.yaml.template ~/values-secret-rag-llm-gitops.yaml
   ```
   > **Note:**
   >For this demo, editing this file is unnecessary as the default configuration works out of the box upon installation.  

4. Add the remote upstream repository by running the following command: 

   ```sh
   $ git remote add -f upstream git@github.com:validatedpatterns/rag-llm-gitops.git
   ```
5. Create a local branch by running the following command: 

   ```sh
   $ git checkout -b my-test-branch main
   ```

6. Run the following command to push `my-test-branch` to the origin remote repository:

   ```sh
   $ git push origin my-test-branch
   ```
6. Ensure you have logged in to the cluster at both command line and the console by using the login credentials presented to you when you installed the cluster. For example: 

   ```sh
   INFO Install complete!
   INFO Run 'export KUBECONFIG=<your working directory>/auth/kubeconfig' to manage the cluster with 'oc', the OpenShift CLI.
   INFO The cluster is ready when 'oc login -u kubeadmin -p <provided>' succeeds (wait a few minutes).
   INFO Access the OpenShift web-console here: https://console-openshift-console.apps.demo1.openshift4-beta-abcorp.com
   INFO Login to the console with user: kubeadmin, password: <provided>
   ```
7. Add GPU nodes to your existing cluster deployment by running the following command: 

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

8. Adding the GPU nodes should take about 5-10 minutes. You can verify the addition of these `g5.2xlarge` nodes in the OpenShift web console under **Compute** > **Nodes**.   

9. Install the pattern with the demo application by running the following command: 

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

![Launch Application](/images/rag-llm-gitops/launch-application.png)

- It should launch the application

  ![Application](/images/rag-llm-gitops/application.png)

### Generate the proposal document

- It will use the default provider and model configured as part of the application deployment. The default provider is `Mistral-7B-Instruct` a model available on Hugging Face. It is a fine-tuned version of the base `Mistral-7B` model. The model server is deployed with this validated pattern and requires a node with GPU.

- Enter any company name for example Microsoft.
- Enter the product as `RedHat OpenShift AI`
- Click the `Generate` button, a project proposal should be generated. The project proposal also contains the reference of the RAG content. The project proposal document can be Downloaded in the form of a PDF document.

  ![Routes](/images/rag-llm-gitops/proposal.png)


