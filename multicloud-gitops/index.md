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

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background
Organizations are looking for a way to develop and deploy applications on open hybrid cloud in a stable, simple, and secure way. This hybrid approach includes multi-cloud delpoyments where workloads may be running on different clusters on different clouds - private or public. This also requires an infrastructutre-as-code approach that manages versions and being able to deploy based on specific deloyment configurations. 

## Architecture
At a high level this requires a management hub, for DevOps and GitOps, and and infrastructure that extends to more than one managed clusters running on private or public clouds.

[![Multi-Cloud Architecture](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)

### Logical Diagram

In the Multicloud Gitops architecture there are two logical sites.

- The Management Hub. This is where the multiple managed clusters deployed on clouds (public or private) are managed. Application and configuration code is workied on here and deployed to the other managed clusters. There is one management hub.
- The Managed Cluster. This is where new applications, updates and operational changes are deployed for the business. There are more than one managed clusters.

[![Multi-Cloud Logical Architecture](/images/multicloud-gitops/logical-diagram.png)](/images/multicloud-gitops/logical-diagram.png)

### Physical Schema 

The diagram below shows the components that are deployed in the management hub and the managed cluster for monitoring and logging.

[![Monitoring and Logging Architecture](/images/multicloud-gitops/schema-monitoring.png)](/images/multicloud-gitops/schema-monitoring.png)

## Recorded Demo

## Prerequisties
1. An OpenShift cluster ( Go to [https://console.redhat.com/openshift/create](https://console.redhat.com/openshift/create) )
1. (Optional) One or more extra OpenShift clusters for the managed clusters (edge).
1. A [GitHub](https://github.com) account

## Initial Deployment

## Validating the Environment

## What Next
- Getting started [deploy the management hub using Helm and GitOps](getting-started) 
- Add a managed cluster to [deploy the  managed cluster piece using ACM](managed cluster) 