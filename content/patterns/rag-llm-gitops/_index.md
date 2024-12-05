---
title: AI Generation with LLM and RAG
date: 2024-07-25
tier: tested
summary: The goal of this demo is to demonstrate a Chatbot LLM application augmented with data from Red Hat product documentation running on Red Hat OpenShift. It deploys an LLM application that connects to multiple LLM providers such as OpenAI, Hugging Face, and NVIDIA NIM. The application generates a project proposal for a Red Hat product.
rh_products:
- Red Hat OpenShift Container Platform
- Red Hat OpenShift GitOps
industries:
- General
aliases: /ai/
# uncomment once this exists
# pattern_logo: retail.png
links:
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/rag-llm-gitops/issues
# uncomment once this exists
ci: ai
---

# Document generation demo with LLM and RAG

## Introduction

This deployment is based on the _validated pattern framework_, using GitOps for
seamless provisioning of all operators and applications. It deploys a Chatbot
application that harnesses the power of Large Language Models (LLMs) combined
with the Retrieval-Augmented Generation (RAG) framework.

The pattern uses the [Red Hat OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai) to deploy and serve LLM models at scale.

The application uses either the [EDB Postgres for Kubernetes operator](https://catalog.redhat.com/software/container-stacks/detail/5fb41c88abd2a6f7dbe1b37b)
(default), or Redis, to store embeddings of Red Hat product documentation, running on Red Hat
OpenShift Container Platform to generate project proposals for specific Red Hat products.

## Demo Description & Architecture

The goal of this demo is to demonstrate a Chatbot LLM application augmented with data from Red Hat product documentation running on [Red Hat OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai). It deploys an LLM application that connects to multiple LLM providers such as OpenAI, Hugging Face, and NVIDIA NIM.
The application generates a project proposal for a Red Hat product.

### Key Features

- Leveraging [Red Hat OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai) to deploy and serve LLM models powered by NVIDIA GPU accelerator.
- LLM Application augmented with content from Red Hat product documentation.
- Multiple LLM providers (OpenAI, Hugging Face, NVIDIA).
- Vector Database, such as EDB Postgres for Kubernetes, or Redis, to store embeddings of Red Hat product documentation.
- Monitoring dashboard to provide key metrics such as ratings.
- GitOps setup to deploy e2e demo (frontend / vector database / served models).

<<<<<<< HEAD
=======
#### RAG Demo Workflow

![Overview of workflow](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-sd.png)

_Figure 3. Schematic diagram for workflow of RAG demo with Red Hat OpenShift._


#### RAG Data Ingestion

![ingestion](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-ingress-sd.png)

_Figure 4. Schematic diagram for Ingestion of data for RAG._


#### RAG Augmented Query


![query](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/schematic-diagrams/rag-demo-vp-query-sd.png)

_Figure 5. Schematic diagram for RAG demo augmented query._

In Figure 5, we can see RAG augmented query. The Mistral-7B model is used for
language processing. LangChain is used to integrate different tools of the LLM-based
application together and to process the PDF files and web pages. A vector
database provider such as EDB Postgres for Kubernetes (or Redis), is used to
store vectors. HuggingFace TGI is used to serve the Mistral-7B model. Gradio is
used for user interface and object storage to store language model and other
datasets. Solution components are deployed as microservices in the Red Hat
OpenShift Container Platform cluster.

#### Download diagrams
View and download all of the diagrams above in our open source tooling site.

[Open Diagrams](https://www.redhat.com/architect/portfolio/tool/index.html?#gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/diagrams/rag-demo-vp.drawio)

![Diagram](/images/rag-llm-gitops/diagram-edb.png)

_Figure 6. Proposed demo architecture with OpenShift AI_

### Components deployed

- **Hugging Face Text Generation Inference Server:** The pattern deploys a Hugging Face TGIS server. The server deploys `mistral-community/Mistral-7B-v0.2` model. The server will require a GPU node.
- **EDB Postgres for Kubernetes / Redis Server:** A Vector Database server is deployed to store vector embeddings created from Red Hat product documentation.
- **Populate VectorDb Job:** The job creates the embeddings and populates the vector database.
- **LLM Application:** This is a Chatbot application that can generate a project proposal by augmenting the LLM with the Red Hat product documentation stored in vector db.
- **Prometheus:** Deploys a prometheus instance to store the various metrics from the LLM application and TGIS server.
- **Grafana:** Deploys Grafana application to visualize the metrics.


>>>>>>> 9e55287b (TELCODOCS-2134 updating AI pattern)
![Overview](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/intro-marketectures/rag-demo-vp-marketing-slide.png)

_Figure 1. Overview of the validated pattern for RAG Demo with Red Hat OpenShift_

![Logical](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/logical-diagrams/rag-demo-vp-ld.png)

_Figure 2. Logical diagram of the RAG Demo with Red Hat OpenShift._
