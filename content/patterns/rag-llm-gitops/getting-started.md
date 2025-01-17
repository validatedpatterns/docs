---
title: Getting Started
weight: 10
aliases: /rag-llm-gitops/getting-started/
---

## Deploying the demo

Following commands will take about 15-20 minutes
>**Validated pattern will be deployed**

```sh
git clone https://github.com/<<your-username>>/rag-llm-gitops.git
cd rag-llm-gitops
oc login --token=<> --server=<> # login to Openshift cluster
podman machine start
# Copy values-secret.yaml.template to ~/values-secret-rag-llm-gitops.yaml.
# You should never check these files
# Add secrets to the values-secret.yaml that needs to be added to the vault.
cp values-secret.yaml.template ~/values-secret-rag-llm-gitops.yaml
./pattern.sh make install
```

#### RAG Demo Workflow

![Overview of workflow](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-sd.png)

_Figure 3. Schematic diagram for workflow of RAG demo with Red Hat OpenShift._


#### RAG Data Ingestion

![ingestion](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-ingress-sd.png)

_Figure 4. Schematic diagram for Ingestion of data for RAG._


#### RAG Augmented Query


![query](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-query-sd.png)

_Figure 5. Schematic diagram for RAG demo augmented query._

In Figure 5, we can see RAG augmented query. Community version of [Mistral-7B-Instruct](https://huggingface.co/mistral-community/Mistral-7B-Instruct-v0.3) model is used for language processing. LangChain is used to integrate different tools of the LLM-based
application together and to process the PDF files and web pages. A vector
database provider such as EDB Postgres for Kubernetes (or Redis), is used to
store vectors. [Red Hat OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai) to serve the [Mistral-7B-Instruct](https://huggingface.co/mistral-community/Mistral-7B-Instruct-v0.3) model. Gradio is
used for user interface and object storage to store language model and other
datasets. Solution components are deployed as microservices in the Red Hat
OpenShift Container Platform cluster.

#### Download diagrams
View and download all of the diagrams above in our open source tooling site.

[Open Diagrams](https://www.redhat.com/architect/portfolio/tool/index.html?#gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/diagrams/rag-demo-vp.drawio)

![Diagram](/images/rag-llm-gitops/diagram-edb.png)

_Figure 6. Proposed demo architecture with OpenShift AI_

### Components deployed

- **vLLM Text Generation Inference Server:** The pattern deploys a vLLM Inference Server. The server deploys and serves `mistral-community/Mistral-7B-Instruct-v0.3` model. The server will require a GPU node.
- **EDB Postgres for Kubernetes / Redis Server:** A Vector Database server is deployed to store vector embeddings created from Red Hat product documentation.
- **Populate VectorDb Job:** The job creates the embeddings and populates the vector database.
- **LLM Application:** This is a Chatbot application that can generate a project proposal by augmenting the LLM with the Red Hat product documentation stored in vector db.
- **Prometheus:** Deploys a prometheus instance to store the various metrics from the LLM application and TGIS server.
- **Grafana:** Deploys Grafana application to visualize the metrics.

## Deploying the demo

To run the demo, ensure the Podman is running on your machine.Fork the [rag-llm-gitops](https://github.com/validatedpatterns/rag-llm-gitops) repo into your organization
### Login to OpenShift cluster

Replace the token and the api server url in the command below to login to the OpenShift cluster.

```sh
oc login --token=<token> --server=<api_server_url> # login to Openshift cluster
```

### Cloning repository

```sh
git clone https://github.com/<<your-username>>/rag-llm-gitops.git
cd rag-llm-gitops
```

### Configuring model

This pattern deploys community version of [Mistral-7B-Instruct](https://huggingface.co/mistral-community/Mistral-7B-Instruct-v0.3) out of box. Run the following command to configure vault with the model Id.

```sh
# Copy values-secret.yaml.template to ~/values-secret-rag-llm-gitops.yaml.
# You should never check-in these files
# Add secrets to the values-secret.yaml that needs to be added to the vault.
cp values-secret.yaml.template ~/values-secret-rag-llm-gitops.yaml
```

To deploy a non-community [Mistral-7b-Instruct](https://huggingface.co/mistralai/) model, grab the [Hugging Face token](https://huggingface.co/settings/tokens) and accept the terms and conditions on the model page. Edit ~/values-secret-rag-llm-gitops.yaml to replace the `model Id` and the `Hugging Face` token.

```sh
secrets:
  - name: hfmodel
    fields:
    - name: hftoken
      value: null
    - name: modelId
      value: "mistral-community/Mistral-7B-Instruct-v0.3"
  - name: minio
    fields:
    - name: MINIO_ROOT_USER
      value: minio
    - name: MINIO_ROOT_PASSWORD
      value: null
      onMissingValue: generate
```

### Provision GPU MachineSet

As a pre-requisite to deploy the application using the validated pattern, GPU nodes should be provisioned along with Node Feature Discovery Operator and NVIDIA GPU operator. To provision GPU Nodes

Following command will take about 5-10 minutes.

```sh
./pattern.sh make create-gpu-machineset
```

Wait till the nodes are provisioned and running.

![Diagram](/images/rag-llm-gitops/nodes.png)

Alternatively, follow the [instructions](../gpu_provisioning) to manually install GPU nodes, Node Feature Discovery Operator and NVIDIA GPU operator.

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

Following commands will take about 15-20 minutes

> **Validated pattern will be deployed**

```sh
./pattern.sh make install
```

### 1: Verify the installation

- Login to the OpenShift web console.
- Navigate to the Workloads --> Pods.
- Select the `rag-llm` project from the drop down.
- Following pods should be up and running.

![Pods](/images/rag-llm-gitops/rag-llm.png)

Note: If the hf-text-generation-server is not running, make sure you have followed the steps to configure a node with GPU from the [instructions](../gpu_provisioning) provided above.

### 2: Launch the application

- Click the `Application box` icon in the header, and select `Retrieval-Augmented-Generation (RAG) LLM Demonstration UI`

![Launch Application](/images/rag-llm-gitops/launch-application.png)

- It should launch the application

  ![Application](/images/rag-llm-gitops/application.png)

### 3: Generate the proposal document

- It will use the default provider and model configured as part of the application deployment. The default provider is a Hugging Face model server running in the OpenShift. The model server is deployed with this validated pattern and requires a node with GPU.
- Enter any company name
- Enter the product as `RedHat OpenShift`
- Click the `Generate` button, a project proposal should be generated. The project proposal also contains the reference of the RAG content. The project proposal document can be Downloaded in the form of a PDF document.

  ![Routes](/images/rag-llm-gitops/proposal.png)

### 4: Add an OpenAI provider

You can optionally add additional providers. The application supports the following providers

- Hugging Face Text Generation Inference Server
- OpenAI
- NVIDIA

Click on the `Add Provider` tab to add a new provider. Fill in the details and click `Add Provider` button. The provider should be added in the `Providers` dropdown under `Chatbot` tab.

![Routes](/images/rag-llm-gitops/add_provider.png)

### 5: Generate the proposal document using OpenAI provider

Follow the instructions in step 3 to generate the proposal document using the OpenAI provider.

![Routes](/images/rag-llm-gitops/chatgpt.png)

### 6: Rating the provider

You can provide rating to the model by clicking on the `Rate the model` radio button. The rating will be captured as part of the metrics and can help the company which model to deploy in production.

### 7: Grafana Dashboard

By default, Grafana application is deployed in `llm-monitoring` namespace.To launch the Grafana Dashboard, follow the instructions below:

- Grab the credentials of Grafana Application
  - Navigate to Workloads --> Secrets
  - Click on the grafana-admin-credentials and copy the GF_SECURITY_ADMIN_USER, GF_SECURITY_ADMIN_PASSWORD
- Launch Grafana Dashboard
  - Click the `Application box` icon in the header, and select `Grafana UI for LLM ratings`
 ![Launch Application](/images/rag-llm-gitops/launch-application.png)
  - Enter the Grafana admin credentials.
  - Ratings are displayed for each model.

![Routes](/images/rag-llm-gitops/monitoring.png)
