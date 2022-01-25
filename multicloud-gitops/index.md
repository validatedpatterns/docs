---
layout: default
title: Multicloud GitOps
parent: Patterns
has_children: true
nav_order: 1
---

<div class="pattern_logo">
  <img src="/images/logos/multicloud-gitops.png" class="pattern_logo" alt="Points">
</div>

# Multicloud GitOps
{: .no_toc }

<a href="getting-started" class="btn" style="background-color:green;"> Install </a>
<a href="https://groups.google.com/u/1/g/hybrid-cloud-patterns" class="btn"> Help & Feedback </a>
<a href="https://github.com/hybrid-cloud-patterns/multicloud-gitops/issues" class="btn" style="background-color:red;"> Report Bugs </a>

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background
Organizations are looking for a way to develop and deploy applications on open hybrid cloud in a stable, simple, and secure way. This hybrid approach includes multi-cloud deployments where workloads may be running on different clusters on different clouds - private or public. This also requires an infrastructutre-as-code approach that manages versions and being able to deploy based on specific deloyment configurations. 

The pattern is derived from work done by the [Red Hat Portfolio Architecture team](https://gitlab.com/redhatdemocentral/portfolio-architecture-examples/-/blob/main/spi-multi-cloud-gitops.adoc)

### Solution elements

- How to use a GitOps approach to manage multiple cloud dpeloyments in both public and private clouds.
- How to centrally manage multiple clusters, including workloads.
- How to securely manage secrets across multi-cloud deployments.

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes++)
- Red Hat Advanced Cluster Management (Open Clutser Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Hasicorp Vault
- [TBD]

## Architecture
At a high level this requires a management hub, for DevOps and GitOps, and and infrastructure that extends to more than one managed clusters running on private or public clouds.

[![Multi-Cloud Architecture](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)

For additional logical, physical and dataflow diagrams, please see excellent work done by the [Red Hat Portfolio Architecture team](https://gitlab.com/redhatdemocentral/portfolio-architecture-examples/-/blob/main/spi-multi-cloud-gitops.adoc)

## Recorded Demo

## What Next
- [Deploy the management hub](getting-started)  using Helm 
- Add a managed cluster to [deploy the  managed cluster piece using ACM](managed-cluster) 
