---
layout: default
title: Industrial Edge
parent: Atlases
nav_order: 1
---

# Industrial Edge Atlas
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

With this Atlas, we demonstrate a horizontal solution for IoT Edge use cases.

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

![Industrial Edge Architecture](images/Architecture.png)

## Recorded Demo

## Prerequisties

1. An OpenShift cluster ( Go to https://console.redhat.com/openshift/create )
1. (Optional) A second OpenShift cluster
1. A github account
1. A quay account

## Initial Deployment

Follow the instructions at https://github.com/dagger-refuse-cool/blueprints/tree/main/manufacturing-edge-ai-ml

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
