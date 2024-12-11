---
title: Rating the provider
weight: 11
aliases: /rag-llm-gitops/getting-started/
---

# Rating the provider

You can provide rating to the model by clicking on the `Rate the model` radio button. The rating will be captured as part of the metrics and can help the company which model to deploy in production.

## Grafana Dashboard

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


