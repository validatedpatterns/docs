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

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

With this Pattern, we demonstrate a horizontal solution for Industrial Edge use cases.

It is derived from the [MANUela work](https://github.com/sa-mw-dach/manuela) done by Red
Hat Middleware Solution Architects in Germany in 2019/20. The name MANUela stands for MANUfacturing Edge Lightweight Accelerator, you will see this acronym in a lot of artefacts. It was developed on a platform called [stormshift](https://github.com/stormshift/documentation) - another name you will see here and there.

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

- Red Hat OpenShift Container Platform (Kubernetes++)
- Red Hat Advanced Cluster Management (Open Clutser Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat OpenShift Pipelines (Tekton)
- Red Hat Quay (Container image registry)
- Red Hat AMQ (Apache ActiveMQ)
- Red Hat AMQ Streams (Apache Kafka Event Broker)
- Red Hat Integration (Apache Camel-K)
- Open Data Hub

### Context on Industrial Edge Computing
With Industrial Edge computing, it’s all about two major streams:
[![Industrial Edge Computing](/images/industrial-edge/manufacturing-edge-computing.png)](/images/industrial-edge/manufacturing-edge-computing.png)

1. Moving sensor data, events etc. from the operational/shopfloor edge level towards the core. The idea is to centralize as much as possible, but keep decentralized as needed. For example, sensitive production data  might not be allowed to leave premises. Think of a temperature curve of an industrial oven which reflects crucial intellection property of the customer. Or the sheer amount of raw data (10k events per second) is too expensive to move to a cloud datacenter. In the above diagram, this is from left to right. In other diagrams the edge / operational level is usually at the bottom and the enterprise/cloud level at the top. Thus, this is also referred to as northbound traffic.
1. Push code, configuration, master data, machine learning models from the core (where development / testing is happening) towards the edge / shop floors. As there might be 100 of plants with 1000s of lines, automation and consistency is key.  In the above diagram, this is from right to left, in a top/down view, it is call southbound traffic.

### Demo Scenario
The Industrial Edge Validated Pattern / Demo Scenario reflects this by having 3 layers:
- Line Data Server - the far edge, at the shop floor level
- Factory Data Center - the near edge, at the plant, but in a more controlled environment.
- Central Data Ceneter - the cloud/core, where ML Model Training, AppDev, Testing etc. is happening (and ERP systems of course, not part of the demo).
[![Demo Scenario](/images/industrial-edge/highleveldemodiagram.png)](/images/industrial-edge/highleveldemodiagram.png)

The northbound traffic of sensor data is clearly visible in this diagram: from the Sensor at the bottom via MQTT to the Factory, where it is split into two streams: one to be fed into a ML Model for anomaly detection, an another one to be streamed up to the central data center via event streaming (Kafka) to be stored for model training.

The southbound traffic is abstracted avoid in the App-Dev / Pipeline box at the top - that is where e.g. gitops kick in, to push config or version changes down into the factories.

## Architecture

The following diagram explains how different roles have different concerns and focus when working with this distributed AL/ML architecture.

[![Industrial Edge Architecture](/images/ai-ml-architecture.png)](/images/ai-ml-architecture.png)


### Logical Architecture

In the Industrial Edge architecture there are two logical sites.

- The datacenter. This is where the data scientist, developers and operations personnel apply the changes to their models, application code and configurations.
- The factory. This is where new applications, updates and operational changes are deployed to improve quality and efficency in the factory.

[![Industrial Edge Logical Architecture](/images/industrial-edge/manufacturing-logical.png)](/images/industrial-edge/manufacturing-logical.png)

### Physical Schema

The diagram below shows the components that are deployed in the datacenter and the factory and the networking between those components.

[![Industrial Edge Physical Network Architecture](/images/industrial-edge/manufacturing-schema-netw.png)](/images/industrial-edge/manufacturing-schema-netw.png)

The diagram below shows the components are are deployed in the datacenter and the factory and the dataflows between those components across the various networks.

[![Industrial Edge Physical Dataflow Architecture](/images/industrial-edge/manufacturing-schema-df.png)](/images/industrial-edge/manufacturing-schema-df.png)

While the above diagrams show the components involved on the DevOps side dealing with the application and the AI/ML models, there are other components to conside when dealing with operational side using GitOps.

[![Industrial Edge Physical GitOps Architecture](/images/industrial-edge/manufacturing-schema-gitops.png)](/images/industrial-edge/manufacturing-schema-gitops.png)

## Editing the diagrams.

To edit the diagrams in `Draw.io` you can load them [here](https://redhatdemocentral.gitlab.io/portfolio-architecture-tooling/index.html?#/portfolio-architecture-examples/projects/industrial-edge-v2.drawio) and save a local copy. You can then edit the diagram to better reflect the spoecific implementation you are working on.


## Recorded Demo

## Prerequisties

1. An OpenShift cluster ( Go to [https://console.redhat.com/openshift/create](https://console.redhat.com/openshift/create) )
1. (Optional) A second OpenShift cluster for the factory (edge).
1. A [GitHub](https://github.com) account
1. A [quay.io](https://quay.io) account

## Initial Deployment

Follow the instructions in the [Git
repo](https://github.com/hybrid-cloud-patterns/industrial-edge/#how-to-use)
containing the complete configuration.

### Pattern Structure

<iframe src="https://slides.com/beekhof/hybrid-cloud-patterns/embed" width="800" height="600" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## Validating the Environment

Check to see that all Operators have been deployed

  ```
  OpenShift UI -> Installed Operators
  ```
The entire deployment involves several OpenShift GitOps applications. It takes time to deploy everything. You may have to go back and forth between this step and the next step to make sure
that all the operators are deployed.

Check all OpenShift GitOps applications are synchronised

  a. Obtain the ArgoCD console urls and passwords

  ```sh
   ARGO_CMD=`oc get secrets -A -o jsonpath='{range .items[*]}{"oc get -n "}{.metadata.namespace}{" routes; oc -n "}{.metadata.namespace}{" extract secrets/"}{.metadata.name}{" --to=-\\n"}{end}' | grep gitops-cluster`
   CMD=`echo $ARGO_CMD | sed 's|- oc|-;oc|g'`
   eval $CMD
  ```

  a. Log in using the userid `admin` and the provided generated passowrd. There will be a number and check for green applications

## What's Next

- Add a dedicated cluster to [deploy the factory pieces using ACM](factory)
- Making [configuration changes](http://hybrid-cloud-patterns.io/industrial-edge/application/#configuration-changes-with-gitops) with GitOps
- Making [application changes](http://hybrid-cloud-patterns.io/industrial-edge/application/#application-changes-using-devops) using DevOps
- Making [AI/ML model changes](http://hybrid-cloud-patterns.io/industrial-edge/application/#application-ai-model-changes-with-devops) with DevOps

### Other links for more information

- Code change [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-code-change.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-code-change.md#demo-execution)
-  CI/CD pipeline & GitOps staging [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-ci-cd-pipeline.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-ci-cd-pipeline.md#Demo-execution)
- Event streaming from edge to core & filling the data lake [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-event-streaming.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-event-streaming.md#Demo-execution)
- Machine learning [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-machine-learning.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-machine-learning.md#Demo-execution)
- Infrastructure operator development [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-infrastructure-operator-development.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-infrastructure-operator-development.md#Demo-execution)
- Enterprise Container [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-enterprise-container.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-enterprise-container.md#Demo-execution)
- Multi Cluster Management [preparation](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-multicluster.md#Demo-preparation) - [demo execution](https://github.com/sa-mw-dach/manuela/blob/master/docs/module-multicluster.md#Demo-execution)

## Uninstalling

Follow the instructions in the [Gitrepo](https://github.com/hybrid-cloud-patterns/industrial-edge#uninstalling)
containing the complete configuration.
