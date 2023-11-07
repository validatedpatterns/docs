---
title: Industrial Edge
date: 2021-10-12
validated: true
summary: This pattern demonstrates a horizontal solution for Industrial Edge use cases.
products:
- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
- Red Hat Quay
- Red Hat AMQ
industries:
- Industrial
- Manufacturing
aliases: /industrial-edge/
pattern_logo: industrial-edge.png
links:
  install: getting-started
  arch: https://www.redhat.com/architect/portfolio/architecturedetail?ppid=26
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/industrial-edge/issues
ci: manuela
---

# Industrial Edge Pattern

_Red Hat  Validated Patterns are detailed deployments created for different use cases. These pre-defined computing configurations bring together the Red Hat portfolio and technology ecosystem to help you stand up your architectures faster. Example application code is provided as a demonstration, along with the various open source projects and Red Hat products required for the deployment to work. Users can then modify the pattern for their own specific application._

**Use Case:** Boosting manufacturing efficiency and product quality with artificial intelligence/machine learning (AI/ML) out to the edge of the network.

**Background:** Microcontrollers and other types of simple computers have long been widely used on factory floors and processing plants to monitor and control the many machines required to implement the many machines required to implement many modern manufacturing workflows.
The manufacturing industry has consistently used technology to fuel innovation, production optimization, and operations. However, historically, control systems were mostly “dumb” in that they mostly took actions in response to pre-programmed triggers and heuristics. For example, predictive maintenance commonly took place on either a set length of time or the number of hours was in service.
Supervisory control and data acquisition (SCADA) has often been used to collectively describe these hardware and software systems, which mostly functioned independently of the company’s information technology (IT) systems. Companies increasingly see the benefit of bridging these operational technology (OT) systems with their IT. Factory systems can be much more flexible as a result. They can also benefit from newer technologies such as AI/ML, thereby allowing for tasks like maintenance to be scheduled based on multiple real-time measurements rather than simple programmed triggers while bringing processing power closer to data.


## Solution Overview


[![High level view of Industrial Edge](/images/industrial-edge/edge-manufacturing-efficiency-marketing-slide.png)](/images/industrial-edge/edge-manufacturing-efficiency-marketing-slide.png)

_Figure 1. Industrial edge solution overview._


Figure 1 provides an overview of the industrial edge solution. It is applicable across a number of verticals including manufacturing.

This solution:
- Provides real-time insights from the edge to the core datacenter
- Secures GitOps and DevOps management across core and factory sites
- Provides AI/ML tools that can reduce maintenance costs

Different roles within an organization have different concerns and areas of focus when working with this distributed AL/ML architecture across two logical types of sites: the core datacenter and the factories. (As shown in Figure 2.)

- **The core datacenter**. This is where data scientists, developers, and operations personnel apply the changes to their models, application code, and configurations.
- **The factories**. This is where new applications, updates and operational changes are deployed to improve quality and efficiency in the factory..


[![Industrial Edge Architecture](/images/ai-ml-architecture.png)](/images/ai-ml-architecture.png)

_Figure 2. Mapping of organizational roles to architectural areas._

[![Industrial Edge Computing](/images/industrial-edge/manufacturing-edge-computing.png)](/images/industrial-edge/manufacturing-edge-computing.png)

_Figure 3. Overall data flows of solution._

Figure 3 provides a different high-level view of the solution with a focus on the two major dataflow streams.

1. Moving sensor data and events from the operational/shop floor edge towards the core. The idea is to centralize as much as possible, but decentralize as needed. For example, sensitive production data might not be allowed to leave the premises. Think of a temperature curve of an industrial oven; it might be considered crucial intellectual property of the customer. Or the sheer amount of raw data (maybe 10,000 events per second) might be too expensive to transfer to a cloud datacenter. In the above diagram, this is from left to right. In other diagrams the edge / operational level is usually at the bottom and the enterprise/cloud level at the top. Thus, this is also referred to as northbound traffic.

2. Push code, configuration, master data, and machine learning models from the core (where development, testing, and training is happening) towards the edge / shop floors. As there might be 100 plants with 1000s of lines, automation and consistency is key. In the above diagram, this is from right to left, in a top/down view, it is called southbound traffic.


## Logical Diagrams

[![Conceptual view of Industrial Edge deployed at various locations](/images/industrial-edge/industrial-edge-ld.png)](/images/industrial-edge/industrial-edge-ld.png)

_Figure 4: Industrial Edge solution as logically and physically distributed across multiple sites._

The following technology was chosen for this solution as depicted logically in Figure 4.

## The Technology

[**Red Hat OpenShift**](https://www.redhat.com/en/technologies/cloud-computing/openshift/try-it?intcmp=7013a00000318EWAAY) is an enterprise-ready Kubernetes container platform built for an open hybrid cloud strategy. It provides a consistent application platform to manage hybrid cloud, public cloud,  and edge deployments. It delivers a complete application platform for both traditional and cloud-native applications, allowing them to run anywhere.

[**Red Hat Application Foundations**](https://www.redhat.com/en/products/application-foundations?intcmp=7013a00000318EWAAY) (also sold as Red Hat Integration) includes frameworks and capabilities for designing, building, deploying, connecting, securing, and scaling cloud-native applications, including foundational patterns like microservices, API-first, and data streaming. When combined with Red Hat OpenShift, Application Foundations creates a hybrid cloud platform for development and operations teams to build and modernize applications efficiently and with attention to security, while balancing developer choice and flexibility with operational control.
It includes, among other components::

[**Red Hat Runtimes**](https://www.redhat.com/en/products/runtimes?intcmp=7013a00000318EWAAY) is a set of products, tools, and components for developing and maintaining cloud-native applications. It offers lightweight runtimes and frameworks for highly distributed cloud architectures, such as microservices. Built on proven open source technologies, it provides development teams with multiple modernization options to enable a smooth transition to the cloud for existing applications.

[**Red Hat AMQ**](https://www.redhat.com/en/technologies/jboss-middleware/amq?intcmp=7013a00000318EWAAY) is a massively scalable, distributed, and high-performance data streaming platform based on the Apache Kafka project. It offers a distributed backbone that allows microservices and other applications to share data with high throughput and low latency.

[**Red Hat Data Foundation**](https://www.redhat.com/en/technologies/cloud-computing/openshift-data-foundation?intcmp=7013a00000318EWAAY) is software-defined storage for containers. Engineered as the data and storage services platform for Red Hat OpenShift, Red Hat Data Foundation helps teams develop and deploy applications quickly and efficiently across clouds. It is based on the open source Ceph, Rook, and Noobaa projects.

[**Red Hat Advanced Cluster Management for Kubernetes (RHACM)**](https://www.redhat.com/en/technologies/management/advanced-cluster-management?intcmp=7013a00000318EWAAY) controls clusters and applications from a single console, with built-in security policies. It extends the value of Red Hat OpenShift by deploying applications, managing multiple clusters, and enforcing policies across multiple clusters at scale.

[**Red Hat Enterprise Linux**](https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux?intcmp=7013a00000318EWAAY) is the world’s leading enterprise Linux platform. It’s an open source operating system (OS). It’s the foundation from which you can scale existing apps—and roll out emerging technologies—across bare-metal, virtual, container, and all types of cloud environments.

## Architectures

### Edge manufacturing with messaging and ML

[![Data interaction of various Industrial Edge components](/images/industrial-edge/edge-mfg-devops-data-sd.png)](/images/industrial-edge/edge-mfg-devops-data-sd.png)

_Figure 5: Industrial Edge solution showing messaging and ML components schematically._

As shown in Figure 5, data coming from sensors is transmitted over MQTT (Message Queuing Telemetry Transport) to Red Hat AMQ, which routes sensor data for two purposes: model development in the core data center and live inference in the factory data centers. The data is then relayed on to Red Hat AMQ for further distribution within the factory datacenter and out to the core datacenter. MQTT is the most commonly used messaging protocol for Internet of Things (IoT) applications.

The lightweight Apache Camel K, a lightweight integration framework built on Apache Camel that runs natively on Kubernetes, provides MQTT (Message Queuing Telemetry Transport) integration that normalizes and routes sensor data to the other components.

That sensor data is mirrored into a data lake that is provided by Red Hat OpenShift Data Foundation. Data scientists then use various tools from the open source Open Data Hub project to perform model development and training, pulling and analyzing content from the data lake into notebooks where they can apply ML frameworks.

Once the models have been tuned and are deemed ready for production, the artifacts are committed to git which kicks off an image build of the model using OpenShift Pipelines (based on the upstream Tekton), a serverless CI/CD system that runs pipelines with all the required dependencies in isolated containers.

The model image is pushed into OpenShift’s  integrated registry running in the core datacenter which is then pushed back down to the factory datacenter for use in inference.

[![Using network segragation to protect factories and operations infrastructure from cyber attacks](/images/industrial-edge/edge-mfg-devops-network-sd.png)](/images/industrial-edge/edge-mfg-devops-network-sd.png)

_Figure 6: Industrial Edge solution showing network flows schematically._

As shown in Figure 6, in order to protect the factories and operations infrastructure from cyber attacks, the operations network needs to be segregated from the enterprise IT network and the public internet. The factory machinery, controllers, and devices need to be further segregated from the factory data center and need to be protected behind a firewall.

### Edge manufacturing with GitOps

[![Using GitOps for managing any changes to clusters and applications](/images/industrial-edge/edge-mfg-gitops-sd.png)](/images/industrial-edge/edge-mfg-gitops-sd.png)

_Figure 7: Industrial Edge solution showing a schematic view of the GitOps workflows._

GitOps is an operational framework that takes DevOps best practices used for application development such as version control, collaboration, compliance, and CI/CD, and applies them to infrastructure automation. Figure 6 shows how, for these industrial edge manufacturing environments, GitOps provides a consistent, declarative approach to managing individual cluster changes and upgrades across the centralized and edge sites. Any changes to configuration and applications can be automatically pushed into operational systems at the factory.

### Secrets exchange and management

[![Secret exchange and management](/images/industrial-edge/edge-mfg-security-sd.png)](/images/industrial-edge/edge-mfg-security-sd.png)

_Figure 8: Schematic view of secrets exchange and management in an Industrial Edge solution._

Authentication is used to securely deploy and update components across multiple locations. The credentials are stored using a secrets management solution like Hashicorp Vault. The external secrets component is used to integrate various secrets management tools (AWS Secrets Manager, Google Secrets Manager, Azure Key Vault). As shown in Figure 7, these secrets are then passed to Red Hat Advanced Cluster Management for Kubernetes (RHACM) which pushes the secrets to the RHACM agent at the edge clusters based on policy. RHACM is also responsible for providing secrets to OpenShift for GitOps workflows( using Tekton and Argo CD).

For logical, physical and dataflow diagrams, please see excellent work done by the [Red Hat Portfolio Architecture team](https://www.redhat.com/architect/portfolio/detail/26)

## Demo Scenario

This scenario is derived from the [MANUela work](https://github.com/sa-mw-dach/manuela) done by Red Hat Middleware Solution Architects in Germany in 2019/20. The name MANUela stands for MANUfacturing Edge Lightweight Accelerator, you will see this acronym in a lot of artifacts. It was developed on a platform called [stormshift](https://github.com/stormshift/documentation).

The demo has been updated 2021 with an advanced GitOps framework.

[![Demo Scenario](/images/industrial-edge/highleveldemodiagram.png)](/images/industrial-edge/highleveldemodiagram.png)

_Figure 9. High-level demo summary. The specific example is machine condition monitoring based on sensor data in an industrial setting, using AI/ML. It could be easily extended to other use cases such as predictive maintenance, or other verticals._

The demo scenario reflects the data flows described earlier and shown in Figure 3 by having three layers.

**Line Data Server:** the far edge, at the shop floor level.

**Factory Data Center:** the near edge, at the plant, but in a more controlled environment.

**Central Data Center:** the cloud/core, where ML model training, application development, testing, and related work happens. (Along with ERP systems and other centralized functions that are not part of this demo.)

The northbound traffic of sensor data is visible in Figure 9. It flows from the sensor at the bottom via MQTT to the factory, where it is split into two streams: one to be fed into an ML model for anomaly detection and another one to be streamed up to the central data center via event streaming (using Kafka) to be stored for model training.

The southbound traffic is abstracted  in the App-Dev / Pipeline box at the top. This is where GitOps kicks in to push config or version changes down into the factories.


## Download diagrams

View and download all of the diagrams above in our open source tooling site.

[[Open Diagrams]](https://www.redhat.com/architect/portfolio/tool/index.html?#gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/diagrams/edge-manufacturing-efficiency.drawio)



## Pattern Structure

<iframe src="https://slides.com/beekhof/hybrid-cloud-patterns/embed" width="800" height="600" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
