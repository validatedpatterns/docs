---
title: Getting Started
weight: 10
aliases: /rag-llm-gitops/getting-started/
---

### Demo Scenario

- **Hugging Face Text Generation Inference Server:** The pattern deploys a Hugging Face TGIS server. The server deploys `meta-llama/Llama-2-7b-chat-hf` model. The server will require a GPU node.
- **Redis Server:** A Redis Server is deployed to store vector embeddings created from Red Hat product documentation.
- **Populate VectorDb Job:** The job creates the embeddings and populates the vector database (Redis).
- **LLM Application:** This is a Chatbot application that can generate a project proposal by augmenting the LLM  with the Red Hat product documentation stored in vector db.
- **Prometheus:**  Deploys a prometheus instance to store the various metrics from the LLM application and TGIS server.
- **Grafana:** Deploys Grafana application to visualize the metrics.

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

### 1: Verify the installation

- Login to the OpenShift web console.
- Navigate to the Workloads --> Pods.
- Select the `rag-llm` project from the drop down.
- Following pods should be up and running.

![Pods](/images/rag-llm-gitops/rag-llm.png)

Note: If the hf-text-generation-server is not running, make sure you have followed the steps to configure a node with GPU from the [instructions](/rag-llm-gitops/gpuprovisioning) provided above.

### 2: Launch the application

- Navigate to routes, Networking --> Routes

  ![Routes](/images/rag-llm-gitops/routes.png)

- Click on the Location link and it should launch the application

  ![Application](/images/rag-llm-gitops/application.png)

### 3: Generate the proposal document

- It will use the default provider and model configured as part of the application deployment. The default provider is a Hugging Face model server running in the OpenShift. The model server is deployed with this valdiated pattern and requires a node with GPU.
- Enter any company name
- Enter the product as `RedHat OpenShift`
- Click the `Generate` button, a project proposal should be generated. The project proposal also contains the reference of the RAG content. The project proposal document can be Downloaded in the form of a PDF document.

  ![Routes](/images/rag-llm-gitops/proposal.png)

### 4: Add an OpenAI provider

You can optionally add additional providers. The application supports the following providers

- Hugging Face Text Generation Inference Server
- OpenAI
- NVIDIA

Click on the `Add Provider` tab to add a new provider. Fill in the details and click `Add Provider` button. The provider should be added in the `Providers` dropdown uder `Chatbot` tab.

![Routes](/images/rag-llm-gitops/add_provider.png)

### 5: Generate the proposal document using OpenAI provider

Follow the instructions in step 3 to generate the proposal document using the OpenAI provider.

![Routes](/images/rag-llm-gitops/chatgpt.png)

### 6: Rating the provider

You can provide rating to the model by clicking on the `Rate the model` radio button. The rating will be captured as part of the metrics and can help the company which model to deploy in prodcution.

### 7: Grafana Dashboard

By default, Grafana application is deployed in `llm-monitoring` namespace.To launch the Grafana Dashboard, follow the instructions below:

- Grab the credentials of Grafana Application
  - Navigate to Workloads --> Secrets
  - Click on the grafana-admin-credentials and copy the GF_SECURITY_ADMIN_USER, GF_SECURITY_ADMIN_PASSWORD
- Launch Grafana Dashboard
  - Navigate to Networking --> Routes in the llm-monitoring namespace.
  - Click on the `Location` link for `grafana-route`.
  - Enter the Grafana admin credentials.
  - Ratings are displayed for each model.

![Routes](/images/rag-llm-gitops/monitoring.png)
