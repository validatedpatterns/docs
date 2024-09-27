---
title: Regional Disaster Recovery
date: 2024-09-20
tier: sandbox
summary: This variant of the Validated Patterns framework deploys a Regional Disaster Recovery Setup across multiple different regions
rh_products:
- Red Hat Openshift Container Platform
industries:
aliases: /agof/
pattern_logo: regional-dr.png
links:
  install: https://github.com/validatedpatterns/regional-resiliency-pattern
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/regional-resiliency-pattern/issues
---

# Openshift Regional DR

## Background

Regional DR architecture is designed for configuring an infrastructure
architecture with multiple Openshift Container Platform cluster connected
between them for offering a disaster recovery setup between regions. Currently,
only active-passive mode is supported. This architecture increases the
resiliency and maintains the applications running in the supposed case of an
entire region fails.

There are two kinds of disaster recovery depending on their scope: Metro DR and
RegionalDR. As their own name suggests, MetroDR refers about Metropolitan Areas
disasters, in other words, when the disaster covers only a single area of a
region (Availability Zone), and Regional DR refers to when the entire region
fails.

The synchronization between Availability Zones is faster and can be performed
synchronous. However, in order don't include a lot of latency on the data
synchronization process, when data is replicated across regions, it necessary
includes latencies based on the distance between both regions (e.g. The latency
between two regions on Europe, will always be less than between Europe and Asia,
so consider this when designing your infrastructure deployment on the values
files of the pattern). This is the main reason because this RegionalDR is
configured in an Active-Passive mode.

It requires an already existing Openshift cluster, which will be used for installing the
pattern, deploying active and passive clusters manage the application
scheduling.

### Prerequisites
Before installing this pattern, ensure yourself you have the following
requirements already prepared before continuing:
* One Openshift cluster ready-to-use with internet access to become the "Manager" cluster.
* Connection to a Cloud Provider (AWS/Azure/GCP) configured in the Manager cluster.

### Solution elements

- Deploying a regional fail resilient architecture for testing, demoing and as an architecture reference

### Red Hat Technologies

- Red Hat Openshift Container Platform
- Red Hat Enterprise Linux


## Operators and Technologies this Pattern Uses

- Red Hat Openshift Container Platform
- Red Hat Openshift Data Foundation
- Red Hat Openshift DR Operator
- Red Hat Openshift GitOps
- Red Hat Openshift Advanced Cluster Management
- Red Hat Openshift Advanced Cluster Security
- Submariner

## Tested on

- Red Hat Openshift Container Platform v4.13
- Red Hat Openshift Container Platform v4.14
- Red Hat Openshift Container Platform v4.15

## Architecture
This section explains the architecture deployed by this Pattern and its Logical
and Physical perspectives.
![Regional-Resiliency-Pattern-Logical-Architecture](/images/regional-resiliency-pattern/architecture-diagram-vp-regional-dr-v6.png)

## Logical architecture

![Regional-Resiliency-Pattern-Logical-Architecture](/images/regional-resiliency-pattern/logical-architecture-diagram-vp-regional-dr-v6.png)


## Installation
This patterns is designed to be installed in an Openshift cluster which will
work as the control plane for the rest of Openshift clusters. The controller
cluster will not execute the applications or store any data from them, but it
will work as the control panel for the interconnection of active-passive
clusters, coordinating their communication and orchestrating when and where an
application is going to be deployed.

As part of the pattern configuration, the administrator needs to define both
clusters installation details as would be done using the Openshift-installer
binary.

For more detailed info about how to install this pattern, please follow this
[link](https://github.com/validatedpatterns/regional-resiliency-pattern?tab=readme-ov-file#installation).

### Pattern Configuration
For obtainning more information about how to configure and deploy the pattern,
please follow this [link](https://github.com/validatedpatterns/regional-resiliency-pattern).
