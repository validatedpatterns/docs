---
layout: default
title: Secrets
nav_order: 6
has_children: true
---

# Infrastructure
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background
Enterprise applications require security, especially in multi-cluster and multi-site environments. Applications require trust and use certificates and other secrets in order to establish and maintain trust. In this section we will look at various was of managing secrets. 

When you start developing distributed enterprise applications there is a strong temptation to ignore security during development and add it at the end. This is proven to be a very bad practice that accumulates technical debt that sometimes never gets resolved. 

While the DevOps model of development strongly encourages *shifting security to the left* many developers didn't really take notice and so the more explicit term DevSecOps was created. Essentially, "pay attention and consider and implement security as early as possible in the lifecycle". (i.e. shift left on the time line).

## Secret Management

One area that has been impacted by a more automated approach to security is in the secret management. DevOps (and DevSecOps) environments require the use of many different services:

1. Code repositories
1. GitOps tools
1. Image repositories
1. Build pipelines

All of these services require credentials. (Or should do!) And keeping those credentials secret is very important. E.g. pushing your credentials to your personal GitHub/GitLab repository is not a secure solution.

While using a file based secret management can work if done correctly, most organizations opt for a more enterprise solution using a secret management product or project. The Cloud Native Computing Foundation (CNCF) has many such [projects](https://radar.cncf.io/2021-02-secrets-management). The Hybrid Cloud Patterns project has started with Hashicorp Vault secret management product but we look forward to other project contributions.

## What's next?
[Getting started with Vault](secrets/vault.md)
