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

As more and more institution and mission critical organizations are moving 
in the cloud, the possible impact of having a provider failure, might this be
only related to only one region, is very high.

This pattern is designed to prove the resiliency capabilities of Red Hat Openshift 
in such scenario. 

The Regional Disaster Recovery Pattern, is designed to setup an multiple instances 
of Openshift Container Platform cluster connectedbetween them to prove multi-region 
resiliency by maintaing the application running in the event of a regional failure. 

Openshift Data Foundation, which is based on CEPH, can be setup to work in two ways: 
MetroDR and RegionalDR. 
As their name suggests, MetroDR is designed to recover from an Availability Zone Failure
(one area of the region) and can be performed synchronously, while the RegionalDR is 
best used when the entire region fails, and due to the higher latencies caused by the 
physical distance, can only be used asynchronously. 

In this scenario we will be working in a  Regional Disaster Recovery setup, and the 
synchronization parameters can be specified in the value file. 

NOTE: please consider using longer times if you have a large dataset or very long 
distances between the clusters

### Prerequisites
Before installing this pattern, ensure yourself you have the following
requirements already prepared before continuing:
* One Openshift cluster ready-to-use with internet access to become the "Manager" cluster.
* Connection to a Cloud Provider (AWS/Azure/GCP) configured in the Manager cluster.

### Solution elements

- The pattern is kick-started by ansible and uses ACM to overlook and orchestrate the process 
- The demo application uses MongoDB writing its data on a Persistent Volume Claim backe by ODF
- We have developed a DR trigger which will be used to start the DR process 
- The end user needs to configure which PV's need synchronization and the latencies 
- ACS Can be used for eventual policies 
- The clusters are connected by submariner and, to have a faster recovery time, we suggest having 
  hybernated clusters ready to be used 

### Red Hat Technologies

- Red Hat Openshift Container Platform
- Red Hat Enterprise Linux
- Red Hat Openshift Advanced Cluster Management
- Red Hat Openshift Advanced Cluster Security
- Red Hat Openshift Data Foundation


## Operators and Technologies this Pattern Uses

- Red Hat Openshift DR Operator
- Red Hat Openshift GitOps
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
work as the orchestrator for the other clusters involved. The Adanced Cluster Manager 
installed will neither run the applications nor store any data from them, but it
will take care of the plumbing of the various clusters involved, 
coordinating their communication and orchestrating when and where an application is 
going to be deployed.

As part of the pattern configuration, the administrator needs to define both
clusters installation details as would be done using the Openshift-installer
binary.

For more detailed info about how to install this pattern, please follow this
[link](https://github.com/validatedpatterns/regional-resiliency-pattern?tab=readme-ov-file#installation).

### Pattern Configuration
For obtainning more information about how to configure and deploy the pattern,
please follow this [link](https://github.com/validatedpatterns/regional-resiliency-pattern).
