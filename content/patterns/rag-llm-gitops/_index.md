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

# Document Generation Demo with LLM and RAG

## Introduction

This deployment is based on the `validated pattern framework`, using GitOps for
seamless provisioning of all operators and applications. It deploys a Chatbot
application that harnesses the power of Large Language Models (LLMs) combined
with the Retrieval-Augmented Generation (RAG) framework.

The application uses either the [EDB Postgres for Kubernetes operator](https://catalog.redhat.com/software/container-stacks/detail/5fb41c88abd2a6f7dbe1b37b)
(default) or Redis to store embeddings of Red Hat products, running on Red Hat
OpenShift to generate project proposals for specific Red Hat products.

## Pre-requisites

- Podman
- Red Hat Openshift cluster running in AWS. Supported regions are us-west-2 and us-east-1.
- GPU Node to run Hugging Face Text Generation Inference server on Red Hat OpenShift cluster.
- Create a fork of the [rag-llm-gitops](https://github.com/validatedpatterns/rag-llm-gitops.git) git repository.

## Demo Description & Architecture

The goal of this demo is to demonstrate a Chatbot LLM application augmented with data from Red Hat product documentation running on Red Hat OpenShift. It deploys an LLM application that connects to multiple LLM providers such as OpenAI, Hugging Face, and NVIDIA NIM. The application generates a project proposal for a Red Hat product

### Key Features

- LLM Application augmented with content from Red Hat product documentation.
- Multiple LLM providers (OpenAI, Hugging Face, NVIDIA).
- Vector Database, such as EDB Postgres for Kubernetes, or Redis, to store embeddings of Red Hat product documentation.
- Monitoring dashboard to provide key metrics such as ratings.
- GitOps setup to deploy e2e demo (frontend / vector database / served models).


![Overview](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/intro-marketectures/rag-demo-vp-marketing-slide.png)

_Figure 1. Overview of the validated pattern for RAG Demo with Red Hat OpenShift_

![Logical](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/logical-diagrams/rag-demo-vp-ld.png)

_Figure 2. Logical diagram of the RAG Demo with Red Hat OpenShift._
