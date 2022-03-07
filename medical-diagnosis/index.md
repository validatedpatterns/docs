---
layout: default
title: Medical Diagnosis
parent: Patterns
has_children: true
nav_order: 3
---

<div class="pattern_logo">
  <img src="/images/logos/medical-diagnosis.png" class="pattern_logo" alt="Points">
</div>

# Medical Diagnosis

{: .no_toc }

[Install](getting-started){: .btn .btn-green .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/medical-diagnosis/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

This Validated Pattern is based on a demo implementation of an automated data pipeline for chest Xray
analysis previously developed by Red Hat.  The original demo can be found [here](https://github.com/red-hat-data-services/jumpstart-library). It was developed for the US Department of Veteran Affairs.

This validated pattern includes the same functionality as the original demonstration. The difference is
that we use the *GitOps* to deploy most of the components which includes operators, creation of namespaces,
and cluster configuration. Using GitOps provides a much more efficient means of doing continuous deployment.

The Validated Pattern includes:

* Ingest chest Xrays into an object store based on Ceph.
* The Object store sends notifications to a Kafka topic.
* A KNative Eventing Listener to the topic triggers a KNative Serving function.
* An ML-trained model running in a container makes a risk of Pneumonia assessment for incoming images.
* A Grafana dashboard displays the pipeline in real time, along with images incoming, processed and anonymized, as well as full metrics.

This pipeline is showcased [in this video](https://www.youtube.com/watch?v=zja83FVsm14).

[![Pipeline dashboard](/images/medical-edge/dashboard.png)](/images/medical-edge/dashboard.png)


This validated pattern is still being developed.  More to come in the next few weeks. Any questions or concerns
please contact [Jonny Rickard](jrickard@redhat.com) or [Lester Claudio](claudiol@redhat.com).

### Solution elements

- How to use a GitOps approach to keep in control of configuration and operations
- How to centrally manage multiple medical diagnosis facilities using GitOps.
- How to deploy AI/ML technologies for medical diagnosis using GitOps from data center to the edge.

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Advanced Cluster Management (Open Cluster Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat Quay (Container image registry)
- Red Hat AMQ Streams (Apache Kafka Event Broker)
- Grafana dashboard (OpenShift Grafana Operator)
- Open Data Hub
- S3 storage

## Architecture

At a high level this requires a management hub, for the applications and GitOps management, and infrastructure that extends to more than one managed clusters running for medical facilities on private or public clouds.

[![Multi-Cloud Architecture](/images/medical-edge/edge-medical-diagnosis-marketing-slide.png)](/images/medical-edge/edge-medical-diagnosis-marketing-slide.png)

Components are running on OpenShift either at the data center or at the medical facility (or public cloud running OpenShift).

### Logical Diagram

In the Medical Diagnosis architecture there are two logical sites.

- The Management Hub. This is where the multiple managed clusters deployed on clouds (public or private) are managed. Application and configuration code is worked on here and deployed to the other managed clusters. There is one management hub.
- The Managed Cluster. This is where new applications, updates and operational changes are deployed for the business. There are more than one managed clusters.

[![Multi-Cloud Logical Architecture](/images/medical-edge/logical-diagram.png)](/images/medical-edge/logical-diagram.png)

### Physical Schema 

The diagram below shows the components that are deployed with the various networks that connect them.

[![Network architecture](/images/medical-edge/physical-network.png)](/images/medical-edge/physical-network.png)

The diagram below shows the components that are deployed with the the data flows and API calls between them.

[![Data flow and API call architecture](/images/medical-edge/physical-dataflow.png)](/images/medical-edge/physical-dataflow.png)

## Recorded Demo

[![Demo](/videos/xray-deployment.svg)](/videos/xray-deployment.svg)

## What Next

- Getting started [deploy the management hub using Helm and GitOps](getting-started) 
- Add a managed cluster to [deploy the  managed cluster piece using ACM](managed cluster)
- Visit the [repo](https://github.com/hybrid-cloud-patterns/medical-diagnosis)  
