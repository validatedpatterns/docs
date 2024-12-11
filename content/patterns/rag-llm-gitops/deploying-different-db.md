---
title: Deploying a different database 
weight: 12
aliases: /rag-llm-gitops/getting-started/
---

# Deploying a different database

This pattern supports two types of vector databases, EDB Postgres for Kubernetes, and Redis. By default the pattern will deploy EDB Postgres for Kubernetes as a vector database. To deploy Redis, change the `global.db.type` parameter to the `REDIS` value in [values-global.yaml](./values-global.yaml).

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


