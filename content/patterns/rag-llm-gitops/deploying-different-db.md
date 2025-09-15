---
title: Deploying a different database
weight: 12
aliases: /rag-llm-gitops/deploy-different-db/
---

# Deploying a different database

This pattern supports several types of vector databases, EDB Postgres for Kubernetes, Elasticsearch, Redis, Microsoft SQL Server, and the cloud-deployed Azure SQL Server. By default the pattern will deploy EDB Postgres for Kubernetes as a vector database. To use a different vector database, change the `global.db.type` parameter to `ELASTIC`, `MSSQL` etc. in your local branch in `values-global.yaml`.

```yaml
global:
  pattern: rag-llm-gitops
  options:
    useCSV: false
    syncPolicy: Automatic
    installPlanApproval: Automatic
  # Possible values for RAG vector DB db.type:
  #   REDIS    -> Redis (Local chart deploy)
  #   EDB      -> PGVector (Local chart deploy)
  #   ELASTIC  -> Elasticsearch (Local chart deploy)
  #   MSSQL    -> MS SQL Server (Local chart deploy)
  #   AZURESQL -> Azure SQL (Pre-existing in Azure)
  db:
    index: docs
    type: EDB
  # Models used by the inference service (should be a HuggingFace model ID)
  model:
    vllm: ibm-granite/granite-3.3-8b-instruct
    embedding: sentence-transformers/all-mpnet-base-v2

  storageClass: gp3-csi

main:
  clusterGroupName: hub
  multiSourceConfig:
    enabled: true
    clusterGroupChartVersion: 0.9.*
```

This is also where you are able to update both the LLM model served by the vLLM inference service as well as the embedding model used by the vector database.
