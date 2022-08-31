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

[Install](/medical-diagnosis/getting-started){: .btn .btn-green .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Portfolio Architecture](https://www.redhat.com/architect/portfolio/architecturedetail?ppid=6){: .btn .btn-blue .fs-5 .mb-4 .mb-md-0 .mr-2 }
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
that we use the *GitOps* framework to deploy the pattern including operators, creation of namespaces,
and cluster configuration. Using GitOps provides a much more efficient means of doing continuous deployment.

What does this pattern do?:

- Ingest chest Xrays from a simulated Xray machine and puts them into an objectStore based on Ceph.
- The objectStore sends a notification to a Kafka topic.
- A KNative Eventing Listener to the topic triggers a KNative Serving function.
- An ML-trained model running in a container makes a risk assessment of Pneumonia for incoming images.
- A Grafana dashboard displays the pipeline in real time, along with images incoming, processed and anonymized, as well as full metrics collected from Prometheus.

This pipeline is showcased [in this video](https://www.youtube.com/watch?v=zja83FVsm14).

[![Pipeline dashboard](/images/medical-edge/dashboard.png)](/images/medical-edge/dashboard.png)

This validated pattern is still under development. Any questions or concerns
please contact [Jonny Rickard](mailto:jrickard@redhat.com) or [Lester Claudio](mailto:claudiol@redhat.com).

### Solution elements

- How to use a GitOps approach to keep in control of configuration and operations
- How to deploy AI/ML technologies for medical diagnosis using GitOps.

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat AMQ Streams (Apache Kafka Event Broker)
- Red Hat OpenShift Serverless (Knative Eventing, Knative Serving)
- Red Hat OpenShift Data Foundations (Cloud Native storage)
- Grafana dashboard (OpenShift Grafana Operator)
- Open Data Hub
- S3 storage

## Architecture

In this iteration of the pattern **there is no edge component** . Future releases have planned Edge deployment capabilities as part of the pattern architecture.

[![Multi-Cloud Architecture](/images/medical-edge/edge-medical-diagnosis-marketing-slide.png)](/images/medical-edge/edge-medical-diagnosis-marketing-slide.png)

Components are running on OpenShift either at the data center or at the medical facility (or public cloud running OpenShift).

### Physical Schema

The diagram below shows the components that are deployed with the various networks that connect them.

[![Network architecture](/images/medical-edge/physical-network.png)](/images/medical-edge/physical-network.png)

The diagram below shows the components that are deployed with the the data flows and API calls between them.

[![Data flow and API call architecture](/images/medical-edge/physical-dataflow.png)](/images/medical-edge/physical-dataflow.png)

## Recorded Demo

[![Demo](/videos/xray-deployment.svg)](/videos/xray-deployment.svg)

## What Next

- Getting started [Deploy the Pattern](getting-started)
- Visit the [repository](https://github.com/hybrid-cloud-patterns/medical-diagnosis)
