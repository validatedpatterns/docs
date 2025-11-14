---
title: Configuring the pattern
weight: 20
aliases: /rag-llm-cpu/configure/
---

# **Configuring the pattern**

This guide covers common customizations, such as changing the default LLM, adding new models, and configuring RAG data sources.
We assume you have already completed the [Getting Started](/rag-llm-cpu/getting-started/) guide.

## **How configuration works**

This pattern is managed by ArgoCD (GitOps). All application configurations are defined in `values-prod.yaml`.
To customize a component, you will typically:

1. **Enable an override:** In `values-prod.yaml`, find the application you want to change (e.g., `llm-inference-service`) and add an `extraValueFiles:` entry pointing to a new override file (e.g., `$patternref/overrides/llm-inference-service.yaml`).
2. **Create the override file:** Create the new .yaml file inside the `/overrides` directory.
3. **Add your settings:** Add _only_ the specific values you want to change into this new file.
4. **Commit and sync:** Commit your changes and let ArgoCD sync the application.

## **Task: Change the Default LLM**

By default, the pattern deploys the `mistral-7b-instruct-v0.2.Q5_0.gguf model`. You might want to change this to a different model (e.g., a different quantization) or adjust its resource usage.
You can do this by creating an override file for the _existing_ `llm-inference-service` application.

1. **Enable the override**:
   In `values-prod.yaml`, update the llm-inference-service application to use an override file:

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
   Create a new file `overrides/llm-inference-service.yaml`. Here is an example that switches to a different model file (Q8_0) and increases the CPU/memory requests:

   ```yaml
   inferenceService:
     resources: # <-- Increased allocated resources
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

## **Task: add a second LLM**

You can also deploy an entirely separate, second LLM and add it to the demo user interface (UI). This example deploys a different runtime, HuggingFace TGI, instead of `llama.cpp`.

This is a two-step process:

1. Deploy the new LLM.
2. Tell the front end UI about it.

### **Step 1: Deploy the new LLM service**

1. **Define the new application:**
   In `values-prod.yaml`, add a new application to the applications list. We'll call it `another-llm-inference-service`.

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
   Create the new file `overrides/another-llm-inference-service.yaml`. This file needs to define the new model and disable resource creation, such as secrets, that the first LLM already created.

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

   > **Warning:** There is currently a bug in the model-downloading container that requires you to explicitly list _all_ files you want to download from the HuggingFace repository. Make sure you list every file needed for the model to run.

### **Step 2: Add the new LLM to the demo UI**

Now, tell the front end that this new LLM exists.

1. **Edit the front end overrides**:
   Open `overrides/rag-llm-frontend-values.yaml` (this file should already exist from the initial setup).
2. **Update LLM_URLS:**
   Add the URL of your new service to the `LLM_URLS` environment variable. The URL follows the format _http://<service-name>-predictor/v1_ (or _http://<service-name>-predictor/openai/v1_ for the HF runtime).

   In `overrides/rag-llm-frontend-values.yaml`:

   ```yaml
   env:
     # ...
     - name: LLM_URLS
       value: '["http://cpu-inference-service-predictor/v1","http://hf-inference-service-predictor/openai/v1"]'
   ```

## **Task: Customize RAG data sources**

By default, the pattern loads data from the Validated Patterns documentation. You can change this to point to your own public git repositories or web pages.

1. **Edit the Vector DB overrides:**
   Open `overrides/vector-db-values.yaml` (this file should already exist).
2. **Update sources:**
   Modify the repoSources and webSources keys. You can add any publicly available Git repository (using globs to filter files) or public web URLs. The job will also process PDFs from webSources.

   In `overrides/vector-db-values.yaml`:

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

## **Task: Add a new RAG database provider**

By default, the pattern enables _qdrant_ and _mssql_. You can also enable _redis_, _pgvector_ (Postgres), or _elastic_ (Elasticsearch).
This is a three-step process: (1) Add secrets, (2) Enable the DB, and (3) Tell the front end UI.

### **Step 1: Update your secrets file**

If your new DB requires credentials (like _pgvector_ or _elastic_), add them to your main secrets file:

```sh
vim ~/values-secret-rag-llm-cpu.yaml
```

Add the necessary credentials. For example:

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

**Note:** refer to the file [`values-secret.yaml.template`](https://github.com/validatedpatterns-sandbox/rag-llm-cpu/blob/main/values-secret.yaml.template) for a reference as to which values are expected.

### **Step 2: Enable the provider in the Vector DB chart**

Edit `overrides/vector-db-values.yaml` and set enabled: true for the provider(s) you want to add.

In `overrides/vector-db-values.yaml`:

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

### **Step 3: Add the provider to the demo UI**

Finally, edit `overrides/rag-llm-frontend-values.yaml` to configure the UI. You must:

1. Add the new provider's secrets to the `dbProvidersSecret.vault` list.
2. Add the new provider's connection details to the `dbProvidersSecret.providers` list.

Below is a complete example showing configuration for the non-default RAG DB providers:

In `overrides/rag-llm-frontend-values.yaml`

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
