---
title: Deploying a different database 
weight: 12
aliases: /rag-llm-gitops/deploy-different-db/
---

# Deploying a different database

This pattern supports two types of vector databases, EDB Postgres for Kubernetes, and Redis. By default the pattern will deploy EDB Postgres for Kubernetes as a vector database. To deploy change the global.db.type parameter to the REDIS value in your local branch in `values-global.yaml`.

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
    type: EDB
# Add for model ID
  model:
      modelId: mistral-community/Mistral-7B-Instruct-v0.3
main:
  clusterGroupName: hub
  multiSourceConfig:
    enabled: true
```


