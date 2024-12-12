---
title: Rating the provider
weight: 11
aliases: /rag-llm-gitops/rating-provider/
---

# Rating the provider

You can provide rating to the model by clicking on the `Rate the model` radio button. The rating are captured as part of the metrics and can help the company decide which model to deploy in production.

## Grafana Dashboard

By default, the Grafana application is deployed in the `llm-monitoring` namespace. You can track the ratings by logging in to the Grafana Dashboard by following the steps below. 

1. In the OpenShift web console go to **Workloads** > **Secrets**.

2. Click on the `ai-llm-grafana-admin-credentials` scroll down. 

3. Launch Grafana Dashboard by clicking the `Application box` icon in the header, and select `Grafana UI for LLM ratings`. 

4. In the top right hand corner click `Sign in`

   ![Launch Application](/images/rag-llm-gitops/launch-application.png)

5. Enter the Grafana admin credentials. Copy the `GF_SECURITY_ADMIN_USER`, `GF_SECURITY_ADMIN_PASSWORD` from `ai-llm-grafana-admin-credentials` screen in the OpenShift web console. 

6. Ratings are displayed for each model. 

   ![Routes](/images/rag-llm-gitops/monitoring.png)