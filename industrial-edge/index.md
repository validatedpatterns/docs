---
layout: default
title: Industrial Edge
parent: Patterns
has_children: true
nav_order: 2
---

<div class="pattern_logo">
  <img src="/images/logos/industrial-edge.png" class="pattern_logo" alt="Points">
</div>

# Industrial Edge Pattern

{: .no_toc }

[Install](getting-started){: .btn .btn-green .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/industrial-edge/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

With this Pattern, we demonstrate a horizontal solution for Industrial Edge use cases.

It is derived from the [MANUela work](https://github.com/sa-mw-dach/manuela) done by Red
Hat Middleware Solution Architects in Germany in 2019/20. The name MANUela stands for MANUfacturing Edge Lightweight Accelerator, you will see this acronym in a lot of artifacts. It was developed on a platform called [stormshift](https://github.com/stormshift/documentation) - another name you will see here and there.

The demo has been updated 2021 with an advanced GitOps framework.

The specific example is machine condition monitoring based on sensor data in an
industrial setting, using AI/ML. It could be easily extended to other use cases, e.g. predictive maintenance, or other verticals.

### Solution elements

- How to use a GitOps approach to keep in control of configuration and operations
- How to centrally manage multiple clusters, including workloads
- How to build and deploy workloads across clusters using modern CI/CD
- How to train AI/ML models in the public cloud with data from the private cloud, and bring the executable model back to on prem.
- IoT Edge

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Advanced Cluster Management (Open Cluster Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat OpenShift Pipelines (Tekton)
- Red Hat Quay (Container image registry)
- Red Hat AMQ (Apache ActiveMQ)
- Red Hat AMQ Streams (Apache Kafka Event Broker)
- Red Hat Integration (Apache Camel-K)
- Open Data Hub
- Seldon Core

### Context on Industrial Edge Computing

With Industrial Edge computing, it’s all about two major streams:
[![Industrial Edge Computing](/images/industrial-edge/manufacturing-edge-computing.png)](/images/industrial-edge/manufacturing-edge-computing.png)

1. Moving sensor data, events etc. from the operational/shopfloor edge level towards the core. The idea is to centralize as much as possible, but keep decentralized as needed. For example, sensitive production data  might not be allowed to leave premises. Think of a temperature curve of an industrial oven which reflects crucial intellection property of the customer. Or the sheer amount of raw data (10k events per second) is too expensive to move to a cloud datacenter. In the above diagram, this is from left to right. In other diagrams the edge / operational level is usually at the bottom and the enterprise/cloud level at the top. Thus, this is also referred to as northbound traffic.
1. Push code, configuration, master data, machine learning models from the core (where development / testing is happening) towards the edge / shop floors. As there might be 100 of plants with 1000s of lines, automation and consistency is key.  In the above diagram, this is from right to left, in a top/down view, it is call southbound traffic.

### Demo Scenario

The Industrial Edge Validated Pattern / Demo Scenario reflects this by having 3 layers:

- Line Data Server - the far edge, at the shop floor level
- Factory Data Center - the near edge, at the plant, but in a more controlled environment.
- Central Data Center - the cloud/core, where ML Model Training, AppDev, Testing etc. is happening (and ERP systems of course, not part of the demo).
[![Demo Scenario](/images/industrial-edge/highleveldemodiagram.png)](/images/industrial-edge/highleveldemodiagram.png)

The northbound traffic of sensor data is clearly visible in this diagram: from the Sensor at the bottom via MQTT to the Factory, where it is split into two streams: one to be fed into a ML Model for anomaly detection, an another one to be streamed up to the central data center via event streaming (Kafka) to be stored for model training.

The southbound traffic is abstracted avoid in the App-Dev / Pipeline box at the top - that is where e.g. gitops kick in, to push config or version changes down into the factories.

## Architecture

The following diagram explains how different roles have different concerns and focus when working with this distributed AL/ML architecture.

[![Industrial Edge Architecture](/images/ai-ml-architecture.png)](/images/ai-ml-architecture.png)

In the Industrial Edge architecture there are two logical types of sites.

- The datacenter. This is where the data scientist, developers and operations personnel apply the changes to their models, application code and configurations.
- The factories. This is where new applications, updates and operational changes are deployed to improve quality and efficiency in the factory.

For logical, physical and dataflow diagrams, please see excellent work done by the [Red Hat Portfolio Architecture team](https://gitlab.com/redhatdemocentral/portfolio-architecture-examples/-/blob/main/manufacturing.adoc)

### Pattern Structure

<iframe src="https://slides.com/beekhof/hybrid-cloud-patterns/embed" width="800" height="600" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
