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

This deployment is based on `validated pattern framework` that uses GitOps to easily provision all operators and apps. It deploys a Chatbot application that leverages the power of Large Language Models (LLMs) in conjunction with the Retrieval-Augmented Generation (RAG) framework running on Red Hat OpenShift to generate a project proposal for a given Red Hat product.

## Pre-requisites

- Podman
- Red Hat Openshift cluster running in AWS. Supported regions are us-west-2 and us-east-1.
- GPU Node to run Hugging Face Text Generation Inference server on Red Hat OpenShift cluster.
- Create a fork of the [rag-llm-gitops](https://github.com/validatedpatterns/rag-llm-gitops.git) git repository.

## Demo Description & Architecture

The goal of this demo is to demonstrate a Chatbot LLM application augmented with data from Red Hat product documentation running on Red Hat OpenShift. It deploys an LLM application that connects to multiple LLM providers such as OpenAI, Hugging Face, and NVIDIA NIM. The application generates a project proposal for a Red Hat product

### Key Features

- LLM Application augmented with content from Red Hat product documentation.
- Multiple LLM providers (OpenAI, Hugging Face, NVIDIA)
- Vector Database, such as PGVECTOR or REDIS, to store embeddings of RedHat product documentation.
- Monitoring dashboard to provide key metrics such as ratings
- GitOps setup to deploy e2e demo (frontend / vector database / served models)


![Overview](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/intro-marketectures/rag-demo-vp-marketing-slide.png)

_Figure 1. Overview of the validated pattern for RAG Demo with Red Hat OpenShift_

![Logical](https://gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/images/logical-diagrams/rag-demo-vp-ld.png)

_Figure 2. Logical diagram of the RAG Demo with Red Hat OpenShift._

## Test Plan
GOTO: [Test Plan](./TESTPLAN.md)
