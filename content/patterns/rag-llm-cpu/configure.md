---
title: Configuring this pattern
weight: 20
aliases: /rag-llm-cpu/configure/
---

# **Configuring this pattern**

This guide covers common customizations, such as changing the default large language model (LLM), adding new models, and configuring retrieval-augmented generation (RAG) data sources. This guide assumes that you have already completed the [Getting started](/rag-llm-cpu/getting-started/) guide.

## **Configuration overview**

ArgoCD manages this pattern by using GitOps. All application configurations are defined in the `values-prod.yaml` file. To customize a component, complete the following steps:

1. **Enable an override:** In the `values-prod.yaml` file, locate the application that you want to change, such as `llm-inference-service`, and add an `extraValueFiles:` entry that points to a new override file, such as `$patternref/overrides/llm-inference-service.yaml`.
2. **Create the override file:** Create the new `.yaml` file in the `/overrides` directory.
3. **Add settings:** Add the specific values that you want to change to the new file.
4. **Commit and synchronize:** Commit your changes and allow ArgoCD to synchronize the application.

## **Task: Changing the default LLM**

By default, the pattern deploys the `mistral-7b-instruct-v0.2.Q5_0.gguf` model. You can change this to a different model, such as a different quantization, or adjust the resource usage. To change the default LLM, create an override file for the existing `llm-inference-service` application.

1. **Enable the override:**
In the `values-prod.yaml` file, update the `llm-inference-service` application to use an override file:
   ```yaml
   clusterGroup:
     # ...
     applications:
       # ...
       llm-inference-service:
         name: llm-inference-service
         namespace: rag-llm-cpu
         chart: llm-inference-service
         chartVersion: 0.3.*
         extraValueFiles: # <-- ADD THIS BLOCK
           - $patternref/overrides/llm-inference-service.yaml
   ```

2. **Create the override file:**
Create a new file named `overrides/llm-inference-service.yaml`. The following example switches to a different model file (Q8_0) and increases the CPU and memory requests:
   ```yaml
   inferenceService:
     resources: # <-- Increaed allocated resources
       requests:
         cpu: "8"
         memory: 12Gi
       limits:
         cpu: "12"
         memory: 24Gi

   servingRuntime:
     args:
       - --model
       - /models/mistral-7b-instruct-v0.2.Q8_0.gguf # <-- Changed model file

   model:
     repository: TheBloke/Mistral-7B-Instruct-v0.2-GGUF
     files:
       - mistral-7b-instruct-v0.2.Q8_0.gguf # <-- Changed file to download
   ```

## **Task: Adding a second LLM**

You can deploy an additional LLM and add it to the demonstration user interface (UI). The following example deploys the HuggingFace TGI runtime instead of `llama.cpp`. This process requires two steps: deploying the new LLM and configuring the frontend UI.

### **Step 1: Deploying the new LLM service**

1. **Define the new application:**
In the `values-prod.yaml` file, add a new application named `another-llm-inference-service` to the applications list.

   ```yaml
   clusterGroup:
     # ...
     applications:
       # ...
       another-llm-inference-service: # <-- ADD THIS NEW APPLICATION
         name: another-llm-inference-service
         namespace: rag-llm-cpu
         chart: llm-inference-service
         chartVersion: 0.3.*
         extraValueFiles:
           - $patternref/overrides/another-llm-inference-service.yaml
   ```

2. **Create the override file:**
Create a new file named `overrides/another-llm-inference-service.yaml`. This file defines the new model and disables the creation of resources, such as secrets, that the first LLM already created.
   ```yaml
   dsc:
     initialize: false
   externalSecret:
     create: false

   # Define the new InferenceService
   inferenceService:
     name: hf-inference-service # <-- New service name
     minReplicas: 1
     maxReplicas: 1
     resources:
       requests:
         cpu: "8"
         memory: 32Gi
       limits:
         cpu: "12"
         memory: 32Gi

   # Define the new runtime (HuggingFace TGI)
   servingRuntime:
     name: hf-runtime
     port: 8080
     image: docker.io/kserve/huggingfaceserver:latest
     modelFormat: huggingface
     args:
       - --model_dir
       - /models
       - --model_name
       - /models/Mistral-7B-Instruct-v0.3
       - --http_port
       - "8080"

   # Define the new model to download
   model:
     repository: mistralai/Mistral-7B-Instruct-v0.3
     files:
       - generation_config.json
       - config.json
       - model.safetensors.index.json
       - model-00001-of-00003.safetensors
       - model-00002-of-00003.safetensors
       - model-00003-of-00003.safetensors
       - tokenizer.model
       - tokenizer.json
       - tokenizer_config.json
   ```

   > **IMPORTANT:** A known issue in the model-downloading container requires that you explicitly list all files that you want to download from the HuggingFace repository. Ensure that you list every file required for the model to run.

### **Step 2: Adding the new LLM to the demonstration UI**

Configure the frontend to recognize the new LLM.

1. **Edit the frontend overrides**:
Open the `overrides/rag-llm-frontend-values.yaml` file.
2. **Update LLM_URLS:**
Add the URL of the new service to the `LLM_URLS` environment variable. The URL uses the `http://<service-name>-predictor/v1` format or `http://<service-name>-predictor/openai/v1` for the HuggingFace runtime.
In the `overrides/rag-llm-frontend-values.yaml` file:

   ```yaml
   env:
     # ...
     - name: LLM_URLS
       value: '["http://cpu-inference-service-predictor/v1","http://hf-inference-service-predictor/openai/v1"]'
   ```

## **Task: Customizing RAG data sources**

By default, the pattern ingests data from the Validated Patterns documentation. You can change this to point to public Git repositories or web pages.

1. **Edit the vector database overrides:**
Open the `overrides/vector-db-values.yaml` file.
2. **Update sources:**
Modify the `repoSources` and `webSources` keys. You can add any publicly available Git repository or public web URL. The job also processes PDF files from `webSources`.
In the `overrides/vector-db-values.yaml` file:

   ```yaml
   providers:
     qdrant:
       enabled: true
     mssql:
       enabled: true

   vectorEmbedJob:
     repoSources:
       - repo: https://github.com/your-org/your-docs.git # <-- Your repo
         globs:
           - "**/*.md"
     webSources:
       - https://your-company.com/product-manual.pdf # <-- Your PDF
     chunking:
       size: 4096
   ```

## **Task: Adding a new RAG database provider**

By default, the pattern enables `qdrant` and `mssql`. You can also enable `redis`, `pgvector`, or `elastic`. This process requires three steps: adding secrets, enabling the database, and configuring the UI.

### **Step 1: Updating the secrets file**

1. If the new database requires credentials, add them to the main secrets file:

   ```sh
   vim ~/values-secret-rag-llm-cpu.yaml
   ```
2. Add the necessary credentials. For example:

   ```yaml
   secrets:
     # ...
     - name: pgvector
       fields:
         - name: user
           value: user # <-- Update the user
         - name: password
           value: password # <-- Update the password
         - name: db
           value: db # <-- Update the db
   ```

> **NOTE:** For information about the expected values, see the [`values-secret.yaml.template`](https://github.com/validatedpatterns-sandbox/rag-llm-cpu/blob/main/values-secret.yaml.template) file.

### **Step 2: Enabling the provider in the vector database chart**

Edit the `overrides/vector-db-values.yaml` file and set `enabled: true` for the providers that you want to add.

In the `overrides/vector-db-values.yaml` file:

```yaml
providers:
  qdrant:
    enabled: true
  mssql:
    enabled: true
  pgvector: # <-- ADD THIS
    enabled: true
  elastic: # <-- OR THIS
    enabled: true
```

### **Step 3: Adding the provider to the demonstration UI**

Edit the `overrides/rag-llm-frontend-values.yaml` file to configure the UI:

1. Add the secrets for the new provider to the `dbProvidersSecret.vault` list.
2. Add the connection details for the new provider to the `dbProvidersSecret.providers` list.

The following example shows the configuration for non-default RAG database providers:

In the `overrides/rag-llm-frontend-values.yaml` file:

```yaml
dbProvidersSecret:
  vault:
    - key: mssql
      field: sapassword
    - key: pgvector # <-- Add this block
      field: user
    - key: pgvector
      field: password
    - key: pgvector
      field: db
    - key: elastic # <-- Add this block
      field: user
    - key: elastic
      field: password
  providers:
    - type: qdrant # <-- Example for Qdrant
      collection: docs
      url: http://qdrant-service:6333
      embedding_model: sentence-transformers/all-mpnet-base-v2
    - type: mssql # <-- Example for MSSQL
      table: docs
      connection_string: >-
        Driver={ODBC Driver 18 for SQL Server};
        Server=mssql-service,1433;
        Database=embeddings;
        UID=sa;
        PWD={{ .mssql_sapassword }};
        TrustServerCertificate=yes;
        Encrypt=no;
      embedding_model: sentence-transformers/all-mpnet-base-v2
    - type: redis # <-- Example for Redis
      index: docs
      url: redis://redis-service:6379
      embedding_model: sentence-transformers/all-mpnet-base-v2
    - type: elastic # <-- Example for Elastic
      index: docs
      url: http://elastic-service:9200
      user: "{{ .elastic_user }}"
      password: "{{ .elastic_password }}"
      embedding_model: sentence-transformers/all-mpnet-base-v2
    - type: pgvector # <-- Example for PGVector
      collection: docs
      url: >-
        postgresql+psycopg://{{ .pgvector_user }}:{{ .pgvector_password }}@pgvector-service:5432/{{ .pgvector_db }}
      embedding_model: sentence-transformers/all-mpnet-base-v2
```
