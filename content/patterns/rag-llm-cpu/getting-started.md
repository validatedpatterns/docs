---
title: Getting Started
weight: 10
aliases: /rag-llm-cpu/getting-started/
---

## Prerequisites

* Podman is installed on your system.
* You are logged into a Red Hat OpenShift 4 cluster with administrator permissions.

## Deploying the pattern

1. Fork the [rag-llm-cpu](https://github.com/validatedpatterns-sandbox/rag-llm-cpu) Git repository.

2. Clone the forked repository by running the following command:

   ```sh
   $ git clone git@github.com:your-username/rag-llm-cpu.git
   ```

3. Navigate to the root directory of your Git repository:

   ```sh
   $ cd rag-llm-cpu
   ```

4. Create a local copy of the secret values file by running the following command:

   ```sh
   $ cp values-secret.yaml.template ~/values-secret-rag-llm-cpu.yaml
   ```

5. Create an API token on [HuggingFace](https://huggingface.co/).

6. Update the secret values file:

   ```sh
   vim ~/values-secret-rag-llm-cpu.yaml
   ```

   > **NOTE**: Update the value of the `token` field in the `huggingface` section with the API token from the previous step. By default, this pattern deploys Microsoft SQL Server as a retrieval-augmented generation (RAG) database provider. Update the `sapassword` field in the `mssql` section. If you plan to use other database providers, update those secrets.

7. To install the pattern without modifications, run the following commands:

   ```sh
   $ ./pattern.sh oc whoami --show-console
   ```

   The output displays the cluster where the pattern will be installed. If the correct cluster is not displayed, log into your OpenShift cluster.

   ```sh
   $ ./pattern.sh make install
   ```

   ArgoCD deploys the components after you run the install command. To check the status of the components after the installation completes, run the following command:

   ```sh
   $ ./pattern.sh make argo-healthcheck
   ```

8. To make changes to the pattern before installation, such as using different RAG database providers or changing the large language model (LLM), see [Configuring this Pattern](/rag-llm-cpu/configure/).

## Verifying the installation

1. Confirm that all applications are successfully installed:

   ```sh
   $ ./pattern.sh make argo-healthcheck
   ```

   It might take several minutes for all applications to synchronize and reach a healthy state because the process includes downloading the LLM models and populating the RAG databases.

   ![Healthcheck](/images/rag-llm-cpu/healthcheck.png)

2. Open the **RAG LLM Demo UI** by clicking the link in the **Red Hat applications** menu.

   ![9Dots](/images/rag-llm-cpu/9dots.png)

3. Confirm that the configured LLMs and RAG database providers are available. Verify that a query in the chatbot triggers a response from the selected RAG database and LLM.

   > **NOTE**: The CPU-based LLM might take approximately one minute to start streaming a response during the first query because the system must load the data into memory.

   ![App](/images/rag-llm-cpu/app.png)

## Next Steps

After the pattern is running, you can customize the configuration. See [Configuring this Pattern](/rag-llm-cpu/configure/)for information about changing the LLM, adding RAG sources, or switching vector databases.
