---
title: AI Generation with LLM and RAG 
date: 2022-12-08
tier: tested
summary: This pattern demonstrates the deployment of a Chatbot application that leverages the power of Large Language Models (LLMs) in conjunction with the Retrieval-Augmented Generation (RAG) framework running on Red Hat OpenShift.
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
  bugs: https://github.com/validatedpatterns/retail/issues
# uncomment once this exists
ci: ai
---

# RAG-LLM GitOps Pattern

This deployment is based on `validated pattern framework` that uses GitOps to easily provision all operators and apps. It deploys a Chatbot application that leverages the power of Large Language Models (LLMs) in conjunction with the Retrieval-Augmented Generation (RAG) framework running on Red Hat OpenShift to generate a project proposal for a given Red Hat product.

## Background

The goal of this demo is to demonstrate a Chatbot LLM application augmented with data from Red Hat product documentation running on Red Hat OpenShift. It deploys an LLM application that connects to multiple LLM providers such as OpenAI, Hugging Face, and NVIDIA NIM. The application generates a project proposal for a Red Hat product

### Solution elements

- LLM Application augmented with content from Red Hat product documentation.
- Multiple LLM providers (OpenAI, Hugging Face, NVIDIA)
- Redis Vector Database to store embeddings of RedHat product documentation.
- Monitoring dashboard to provide key metrics such as ratings
- GitOps setup to deploy e2e demo (frontend / vector database / served models)

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat OpenShift Pipelines (Tekton)
- Red Hat OpenShift AI

## Architecture

The following diagram shows the relationship between the AI components:

![RAG-LLM AI Architecture](/images/rag-llm-gitops/diagram.png)
