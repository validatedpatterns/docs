---
title: RAG LLM chatbot on CPU
date: 2025-10-24
tier: sandbox
summary: This patterns deploys a CPU-based LLM, your choice of several RAG DB providers, and a simple chatbot UI which exposes the configuration and results of the RAG queries.
rh_products:
  - Red Hat OpenShift Container Platform
  - Red Hat OpenShift GitOps
  - Red Hat OpenShift AI
partners:
  - Microsoft
industries:
  - General
aliases: /rag-llm-cpu/
links:
  github: https://github.com/validatedpatterns-sandbox/rag-llm-cpu
  install: getting-started
  bugs: https://github.com/validatedpatterns-sandbox/rag-llm-cpu/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
---

# **CPU-based RAG LLM chatbot**

## **Introduction**

This Validated Pattern deploys a Retrieval-Augmented Generation (RAG) chatbot on Red Hat OpenShift by using Red Hat OpenShift AI. The pattern runs entirely on CPU nodes without requiring GPU hardware, making it a cost-effective and accessible solution for environments where GPU resources are limited or unavailable.
It provides a secure, flexible, and production-ready starting point for building and deploying on-premise generative AI applications.

## **Target audience**

This pattern is designed for:

- **Developers and data scientists** looking to build and experiment with RAG-based LLM applications.
- **MLOps and DevOps engineers** responsible for deploying and managing AI/ML workloads on OpenShift.
- **Architects** evaluating cost-effective methods for delivering generative AI capabilities on-premise.

## **Why use this pattern?**

- **Cost-effective:** Runs entirely on CPU, removing the need for expensive and often scarce GPU resources.
- **Flexible:** Supports multiple vector database backends (Elasticsearch, PGVector, Microsoft SQL Server) to integrate with your existing data infrastructure.
- **Transparent:** The Gradio front end is designed to expose the internals of the RAG query and LLM prompts, giving you clear insight into the generation process.
- **Extensible:** Built on open source standards (KServe, OpenAI-compatible API) to serve as a robust foundation for more complex applications.

## **Architecture overview**

At a high level, the components work together as follows:

1. A user enters a query into the **Gradio UI**.
2. The backend application, using **LangChain**, first queries a configured **Vector database** to retrieve relevant documents (the "R" in RAG).
3. These documents are combined with the user's original query into a prompt.
4. The prompt is sent to the **KServe-deployed LLM** (running via llama.cpp on a CPU node).
5. The LLM generates a response, which is streamed back to the Gradio UI for the user.
6. **Vault** securely provides the necessary credentials for the vector database and HuggingFace token at runtime.

![Overview](/images/rag-llm-cpu/rag-augmented-query.png)

_Figure 1. Overview of RAG Query from User's perspective._

## **Prerequisites**

Before you begin, ensure you have access to the following:

- A Red Hat OpenShift cluster (version 4.x). (Recommended size of at least 2 `m5.4xlarge` nodes.)
- A HuggingFace API token.
- Command-line tools: Podman.

## **What this pattern provides**

- A [kserve](https://github.com/kserve/kserve)-based LLM deployed to [RHOAI](https://www.redhat.com/en/products/ai/openshift-ai) that runs entirely on a CPU-node with a [llama.cpp](https://github.com/ggml-org/llama.cpp) runtime.
- A choice of one (or multiple) Vector DB providers to serve as a RAG-backend with configurable web-based or git repo-based sources. Vector embedding and document retrieval are implemented with [LangChain](https://docs.langchain.com/oss/python/langchain/overview).
- [Vault](https://developer.hashiCorp.com/vault)-based secret management for HuggingFace API token and credentials for supported databases ([Elasticsearch](https://www.elastic.co/docs/solutions/search/vector), [PGVector](https://github.com/pgvector/pgvector), [Microsoft SQL Server](https://learn.microsoft.com/en-us/sql/sql-server/ai/vectors?view=sql-server-ver17)).
- A [gradio](https://www.gradio.app/)-based front end for connecting to multiple [OpenAI API-compatible](https://github.com/openai/openai-openapi) LLMs which exposes the internals of the RAG query and LLM prompts so that users have better insight into what is running.
