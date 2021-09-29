---
layout: default
title: Industrial Edge
parent: Patterns
has_children: true
nav_order: 2
---

# Industrial Edge Pattern
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

With this Pattern, we demonstrate a horizontal solution for IoT Edge use cases.

It is derived from the [work](https://github.com/sa-mw-dach/manuela) done by Red
Hat Middleware Solution Architects in Germany in 2019/20.

The specific example is live defect detection based on sensor data in an
industrial setting, but it could easily be applicable to other verticals.

### Solution elements

- How to use a GitOps approach to keep in control of configuration and operations
- How to centrally manage multiple clusters, including workloads
- How to build and deploy workloads across clusters using modern CI/CD
- How to train AI/ML models in the public cloud with data from the private cloud, and bring the executable model back to on prem.
- IoT Edge

### Red Hat Technologies

- OpenShift
- OpenShift GitOps (ArgoCD)
- OpenShift Pipelines (Tekton)
- OpenShift Container Storage
- Advanced Cluster Management
- Open Data Hub
- AMQ (MQTT Message broker)
- AMQ Streams (Kafka Event Broker)
- Camel-K Integrations

## Architecture

The following diagram explains how different roles have different concerns and focus when working with this distributed AL/ML architecture. 

![Industrial Edge Architecture](images/Architecture.png)


### Logical Architecture

In the Industrial Edge architecture there are two logical sites.

- The datacenter. This is where the data scientist, developers and operations personnel apply the changes to their models, application code and configurations.
- The factory. This is where new applications, updates and operational changes are deployed to improve quality and efficency in the factory.

![Industrial Edge Logical Architecture](images/manufacturing-logical.png)

### Physical Schema 

The diagram below shows the components that are deployed in the datacenter and the factory and the networking between those components.

![Industrial Edge Physical Network Architecture](images/manufacturing-schema-netw.png)

The diagram below shows the components are are deployed in the datacenter and the factory and the dataflows between those components across the various networks.

![Industrial Edge Physical Dataflow Architecture](images/manufacturing-schema-df.png)

## Recorded Demo

## Prerequisties

1. An OpenShift cluster ( Go to https://console.redhat.com/openshift/create )
1. (Optional) A second OpenShift cluster
1. A github account
1. A quay account

## Initial Deployment

Follow the instructions in the [Git
repo](https://github.com/hybrid-cloud-patterns/manufacturing-edge-ai-ml/#how-to-use)
containing the complete configuration.

### Pattern Structure

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSfbN_TbjfYnw-B6hHs-uUQ-8rRzUX27AW4eSxT7dVmBERiBgHS_FWWkgyg5fTsEWL2hj6RYyJqYi7_/embed?start=false&loop=false&delayms=3000" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Validating the Environment

1. Check to see that all Operators have been deployed

  `UI -> Installed Operators`

1. Check all ArgoCD applications are synchronised

  a. Obtain the ArgoCD url

  `oc get -n openshift-gitops routes/openshift-gitops-server`

  a. Obtain the ArgoCD admin password

  `oc -n openshift-gitops extract secrets/openshift-gitops-cluster --to=-`

  a. Log in, and check for green applications

## What Next

- Code change [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-code-change.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-code-change.md#demo-execution)
-  CI/CD pipeline & GitOps staging [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-ci-cd-pipeline.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-ci-cd-pipeline.md#Demo-execution)
- Event streaming from edge to core & filling the data lake [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-event-streaming.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-event-streaming.md#Demo-execution)
- Machine learning [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-machine-learning.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-machine-learning.md#Demo-execution)
- Infrastructure operator development [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-infrastructure-operator-development.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-infrastructure-operator-development.md#Demo-execution)
- Enterprise Container [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-enterprise-container.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-enterprise-container.md#Demo-execution)
- Multi Cluster Management [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-multicluster.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-multicluster.md#Demo-execution)


## Uninstalling

Follow the instructions in the [Git
repo](https://github.com/hybrid-cloud-patterns/manufacturing-edge-ai-ml#uninstalling)
containing the complete configuration.
