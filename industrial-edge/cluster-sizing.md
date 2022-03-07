---
layout: default
title: Cluster Sizing
grand_parent: Patterns
parent: Industrial Edge
nav_order: 5
---
# OpenShift Cluster Sizing for the Industrial Edge Pattern

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Tested Platforms

The **Medical Diagnosis** pattern has been tested in the following Certified Cloud Providers.

| **Certified Cloud Providers** | 4.8 | 4.9 |
| :---- | :---- | :----
| Amazon Web Services | Tested | Not Supported
| Google Compute |   |
| Microsoft Azure |   |

## General OpenShift Minimum Requirements

OpenShift 4 has the following minimum requirements for sizing of nodes:

* **Minimum 4 vCPU** (additional are strongly recommended).
* **Minimum 16 GB RAM** (additional memory is strongly recommended, especially if etcd is co-located on masters).
* **Minimum 40 GB** hard disk space for the file system containing /var/.
* **Minimum 1 GB** hard disk space for the file system containing /usr/local/bin/.

There are several applications that comprise the **industrial-edge** pattern.  In addition, the **industrial-edge** pattern also includes a number of supporting operators that are installed by **OpenShift GitOps** using ArgoCD.

### Tested Platforms

The **Industrial-Edge** pattern has been tested in the following Certified Cloud Providers.

### **Industrial-Edge** Pattern Components

Here's an inventory of what gets deployed by the **Industrial-Edge** pattern on the Datacenter/Hub OpenShift cluster:

| Name | Kind | Namespace | Description
| :---- | :---- | :---- | :----
| line-dashboard | Application | manuela-tst-all | Front end application
| machine-sensor-1 | Application | manuela-tst-all | Data publisher
| machine-sensor-2 | Application | manuela-tst-all | Data publisher
| messaging | Application | manuela-tst-all | Data subscriber
| mqtt2kafka-integration | Application | manuela-tst-all | Kafka Integration
| anomaly-detection-predictor-0-anomaly-detection | Application | manuela-tst-all | Anomaly detection application
| manuela-kafka-cluster-entity-operator | Operator | manuela-tst-all | Kafka
| Red Hat Advanced Cluster Management | Operator | open-cluster-management | Advance Cluster Management
| Red Hat Integration - AMQ Broker | Operator | manuela-tst-all | AMQ Broker
| Red Hat Integration - AMQ Streams | Operator | manuela-tst-all | AMQ Streams
| Open Data Hub | Operator | openshift-operators | Open Data Hub
| Red Hat OpenShift GitOps | Operator | openshift-operators | OpenShift GitOps
| Red Hat Integration - Camel K | Operator | manuela-tst-all | Integration Platform, Kamelet Binding, Kamelet
| Red Hat OpenShift Pipelines | Operator | All Namespaces | Tekton Config, Pipelines, Triggers, Addons
| Seldon Operator | Operator | manuela-tst-all | Seldon Deployment

### Industrial-Edge Pattern OpenShift Datacenter HUB Cluster Size

The Industrial-Edge pattern has been tested with a defined set of specifically tested configurations that represent the most common combinations that Red Hat OpenShift Container Platform (OCP) customers are using or deploying for the x86_64 architecture.

The Datacenter HUB OpenShift Cluster is made up of the the following on the AWS deployment tested:

| Node Type | Number of nodes | Cloud Provider | Instance Type
| :---- | :----: | :---- | :----
| Master | 4 | Amazon Web Services | m5.xlarge
| Worker | 3 | Amazon Web Services | m5.xlarge

The Datacenter HUB OpenShift cluster needs to be a bit bigger than the Factory/Edge clusters because this is where the developers will be running pipelines to build and deploy the **Industrial Edge** pattern on the cluster.  The above cluster sizing is close to a **minimum** size for a Datacenter HUB cluster.  In the next few sections we take some snapshots of the cluster utilization while the **Industrial Edge** pattern is running.  Keep in mind that resources will have to be added as more developers are working building their applications.

#### Datacenter Cluster utilization

Below is a snapshot of the OpenShift cluster utilization while running the **Industrial-Edge** pattern:

| CPU | Memory |  File System |  Network | Pod Count
| :----: | :-----: | :----: | :----: | :----:
| `13.84` **Used 42.16 available of 56** | `73.5 GiB` **146.3 GiB available of 219.8 GiB** | `106 GiB` **732.9 GiB available of 838.9 GiB** | `20.65` **MBps in** `22.84` **MBps out** | `354` **pods**

### Industrial-Edge Pattern OpenShift Factory Edge Cluster Size

The OpenShift cluster is made of 3 Nodes combining Master/Workers for the Edge/Factory cluster.

| Node Type | Number of nodes | Cloud Provider | Instance Type
| :----: | :----: | :----: | :----:
| Master/Worker | 3 | Google Cloud | n1-standard-8
| Master/Worker | 3 | Amazon Cloud Services | m5.2xlarge
| Master/Worker | 3 | Microsoft Azure | Standard_D8s_v3

#### Factory/Edge Cluster Utilization

**GCP**

This is a snapshot of a Google Cloud Factory Edge cluster running the production **Industrial-Edge** pattern.

| CPU | Memory |  File System |  Network | Pod Count
| :----: | :-----: | :----: | :----: | :----:
| `6.55` **17.45 available of 24** | `43.19 GiB` usage **45.09 GiB available of 88.28 GiB** | 48.45 GiB usage **334 GiB available of 382.5 GiB** | 9.64 **MBps in15.79 MBps out** | 187 **pods**

**AWS**

This is a snapshot of a Amazon Web Services Factory Edge cluster running the production **Industrial-Edge** pattern.

| CPU | Memory |  File System |  Network | Pod Count
| :----: | :-----: | :----: | :----: | :----:
| `5.1` **18.9 available of 24** |`42.91` **GiB 49.27 GiB available of 92.18 GiB** | `51.54` **GiB 308 GiB available of 359.5 GiB** | `9.41` **MBps in** `10.38` **MBps out** | 194 **pods**

**Azure**

This is a snapshot of an Azure Factory Edge cluster running the production **Industrial-Edge** pattern.

| CPU | Memory |  File System |  Network | Pod Count
| :----: | :-----: | :----: | :----: | :----:
| `7.86` **15.65 available of 24** | `42.76` **Gib used 51.15 GiB available of 94.2 GiB** | `71.29` **GiB used 2.93 TiB available of 3 TiB** | `8.98` **MBps in** `9.64` **MBps out** | 192 **pods*

### AWS Instance Types

The **industrial-edge** pattern was tested with the highlighted AWS instances in **bold**.   The OpenShift installer will let you know if the instance type meets the minimum requirements for a cluster.

The message that the openshift installer will give you will be similar to this message

```text
INFO Credentials loaded from default AWS environment variables
FATAL failed to fetch Metadata: failed to load asset "Install Config": [controlPlane.platform.aws.type: Invalid value: "m4.large": instance type does not meet minimum resource requirements of 4 vCPUs, controlPlane.platform.aws.type: Invalid value: "m4.large": instance type does not meet minimum resource requirements of 16384 MiB Memory]
```

Below you can find a list of the AWS instance types that can be used to deploy the **industrial-edge** pattern.

| Instance type | Default vCPUs | Memory (GiB) | Datacenter | Factory/Edge
| :------: | :-----: | :-----: | :----: | :----:
| | | | 3x3 OCP Cluster | 3 Node OCP Cluster
| m4.xlarge   | 4  | 16 | N | N
| **m4.2xlarge**  | 8  | 32 | Y | Y
| m4.4xlarge  | 16 | 64 | Y | Y
| m4.10xlarge | 40 | 160 | Y | Y
| m4.16xlarge | 64 | 256 | Y | Y
| **m5.xlarge**   | 4  | 16 | Y | N
| **m5.2xlarge**  | 8  | 32 | Y | Y
| m5.4xlarge  | 16 | 64 | Y | Y
| m5.8xlarge  | 32 | 128 | Y | Y
| m5.12xlarge | 48 | 192 | Y | Y
| m5.16xlarge | 64 | 256 | Y | Y
| m5.24xlarge | 96 | 384 | Y | Y

The OpenShift cluster is made of 4 Masters and 3 Workers for the Datacenter and the Edge/Factory cluster are made of 3 Master/Worker nodes.  For the node sizes we used the **m5.xlarge** on AWS and this instance type met the minimum requirements to deploy the **industrial-edge** pattern successfully on the Datacenter hub.  On the Factory/Edge cluster we used the **m5.2xlarge** since the minimum cluster was comprised of 3 nodes.  .

To understand better what types of nodes you can use on other Cloud Providers we provide some of the details below.

### Azure Instance Types

The **industrial-edge** pattern was also deployed on Azure using the **Standard_D8s_v3** VM size.  Below is a table of different VM sizes available for Azure.  Keep in mind that due to limited access to Azure we only used the **Standard_D8s_v3** VM size.

The OpenShift cluster is made of 3 Master and 3 Workers for the Datacenter cluster.

The OpenShift cluster is made of 3 Nodes combining Master/Workers for the Edge/Factory cluster.

| Type |  Sizes | Description
| :---- | :---- | :----
| [General purpose](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-general) |B, Dsv3, Dv3, Dasv4, Dav4, DSv2, Dv2, Av2, DC, DCv2, Dv4, Dsv4, Ddv4, Ddsv4 | Balanced CPU-to-memory ratio. Ideal for testing and development, small to medium databases, and low to medium traffic web servers.
| [Compute optimized](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-compute) | F, Fs, Fsv2, FX | High CPU-to-memory ratio. Good for medium traffic web servers, network appliances, batch processes, and application servers.
| [Memory optimized](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-memory) | Esv3, Ev3, Easv4, Eav4, Ev4, Esv4, Edv4, Edsv4, Mv2, M, DSv2, Dv2 | High memory-to-CPU ratio. Great for relational database servers, medium to large caches, and in-memory analytics.
| [Storage optimized](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-storage) | Lsv2 | High disk throughput and IO ideal for Big Data, SQL, NoSQL databases, data warehousing and large transactional databases.
| [GPU](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-gpu) | NC, NCv2, NCv3, NCasT4_v3, ND, NDv2, NV, NVv3, NVv4 | Specialized virtual machines targeted for heavy graphic rendering and video editing, as well as model training and inferencing (ND) with deep learning. Available with single or multiple GPUs.
| [High performance compute](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes-hpc) | HB, HBv2, HBv3, HC, H | Our fastest and most powerful CPU virtual machines with optional high-throughput network interfaces (RDMA).

For more information please refer to the [Azure VM Size Page](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes).

### Google Cloud (GCP) Instance Types

The **industrial-edge** pattern was also deployed on GCP using the **n1-standard-8** VM size.  Below is a table of different VM sizes available for GCP.  Keep in mind that due to limited access to GCP we only used the **n1-standard-8** VM size.

The OpenShift cluster is made of 3 Master and 3 Workers for the Datacenter cluster.

The OpenShift cluster is made of 3 Nodes combining Master/Workers for the Edge/Factory cluster.

The following table provides VM recommendations for different workloads.

| **General purpose** | **Workload optimized**
| Cost-optimized | Balanced | Scale-out optimized |  Memory-optimized  |Compute-optimized |  Accelerator-optimized
| :---- | :---- | :---- |  :---- | :---- | :----
| E2 | N2, N2D, N1 |  T2D |  M2, M1 | C2 |  A2
Day-to-day computing at a lower cost | Balanced price/performance across a wide range of VM shapes | Best performance/cost for scale-out workloads | Ultra high-memory workloads | Ultra high performance for compute-intensive workloads | Optimized for high performance computing workloads

For more information please refer to the [GCP VM Size Page](https://cloud.google.com/compute/docs/machine-types).
