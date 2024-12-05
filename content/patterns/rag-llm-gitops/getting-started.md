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
3. Navigate to your repository: Ensure you are in the root directory of your git repository by using the following command:

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
  $ git push origin my-branch
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
./pattern.sh make install
``` 

> **Note:**  
> This deploys everything you need to run the demo application including the Nividia GPU Operator and the Node Feature Discovery Operator used to determine your GPU nodes. 
> 


## Verify the Installation

- Login to the OpenShift web console.
- Navigate to the Workloads --> Pods.
- Select the `rag-llm` project from the drop down.
- Following pods should be up and running.

![Pods](/images/rag-llm-gitops/rag-llm.png)

Note: If the hf-text-generation-server is not running, make sure you have followed the steps to configure a node with GPU from the [instructions](../gpu_provisioning) provided above.

### Launch the application

- Click the `Application box` icon in the header, and select `Retrieval-Augmented-Generation (RAG) LLM Demonstration UI`

![Launch Application](/images/rag-llm-gitops/launch-application.png)

- It should launch the application

  ![Application](/images/rag-llm-gitops/application.png)

### Generate the proposal document

- It will use the default provider and model configured as part of the application deployment. The default provider is a Hugging Face model server running in the OpenShift. The model server is deployed with this validated pattern and requires a node with GPU.
- Enter any company name
- Enter the product as `RedHat OpenShift`
- Click the `Generate` button, a project proposal should be generated. The project proposal also contains the reference of the RAG content. The project proposal document can be Downloaded in the form of a PDF document.

  ![Routes](/images/rag-llm-gitops/proposal.png)

### Add an OpenAI provider

You can optionally add additional providers. The application supports the following providers

- Hugging Face Text Generation Inference Server
- OpenAI
- NVIDIA

Click on the `Add Provider` tab to add a new provider. Fill in the details and click `Add Provider` button. The provider should be added in the `Providers` dropdown under `Chatbot` tab.

![Routes](/images/rag-llm-gitops/add_provider.png)

### Generate the proposal document using OpenAI provider

Follow the instructions in step 3 to generate the proposal document using the OpenAI provider.

![Routes](/images/rag-llm-gitops/chatgpt.png)

### Rating the provider

You can provide rating to the model by clicking on the `Rate the model` radio button. The rating will be captured as part of the metrics and can help the company which model to deploy in production.

### Grafana Dashboard

By default, Grafana application is deployed in `llm-monitoring` namespace. Launch the Grafana Dashboard, by running the following instructions:

- Grab the credentials of Grafana Application
  - Navigate to Workloads --> Secrets
  - Click on the grafana-admin-credentials and copy the GF_SECURITY_ADMIN_USER, GF_SECURITY_ADMIN_PASSWORD
- Launch Grafana Dashboard
  - Click the `Application box` icon in the header, and select `Grafana UI for LLM ratings`
 ![Launch Application](/images/rag-llm-gitops/launch-application.png)
  - Enter the Grafana admin credentials.
  - Ratings are displayed for each model.

![Routes](/images/rag-llm-gitops/monitoring.png)




### Deploy application

**Note**: This pattern supports two types of vector databases, EDB Postgres for Kubernetes, and Redis. By default the pattern will deploy EDB Postgres for Kubernetes as a vector database. To deploy Redis, change the `global.db.type` parameter to the `REDIS` value in [values-global.yaml](./values-global.yaml).

```yaml
---
global:
  pattern: rag-llm-gitops
  options:
    useCSV: false
    syncPolicy: Automatic
    installPlanApproval: Automatic
# Possible value for db.type = [REDIS, EDB]
  db:
    index: docs
    type: EDB  # <--- Default is EDB, Change the db type to REDIS for Redis deployment
main:
  clusterGroupName: hub
  multiSourceConfig:
    enabled: true
```


