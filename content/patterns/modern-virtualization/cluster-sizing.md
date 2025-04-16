---
title: Cluster Sizing
weight: 30
aliases: /ansible-edge-gitops/cluster-sizing/
---
# OpenShift Cluster Sizing for the Ansible Edge GitOps Pattern

## Tested Platforms

The **Ansible Edge GitOps** pattern has been tested on AWS:

| **Certified Cloud Providers** | 4.9 | 4.10 |
| :---- | :---- | :----
| Amazon Web Services | | Tested

The pattern is adaptable to running on bare metal/on-prem clusters but has not yet been tested there.

## General OpenShift Minimum Requirements

OpenShift 4 has the following minimum requirements for sizing of nodes:

* **Minimum 4 vCPU** (additional are strongly recommended).
* **Minimum 16 GB RAM** (additional memory is strongly recommended, especially if etcd is colocated on Control Planes).
* **Minimum 40 GB** hard disk space for the file system containing /var/.
* **Minimum 1 GB** hard disk space for the file system containing /usr/local/bin/.

There is one application that comprises the **Ansible Edge GitOps** pattern.  In addition, the **Ansible Edge GitOps** pattern also includes the Advanced Cluster Management (ACM) supporting operator that is installed by **OpenShift GitOps** using ArgoCD.

### **Ansible Edge GitOps** Pattern Components

Here's an inventory of what gets deployed by the **Ansible Edge GitOps** pattern on the Datacenter/Hub OpenShift cluster:

| Name | Kind | Namespace | Description
| :---- | :---- | :---- | :----
| Ansible Edge GitOps-hub | Application | Ansible Edge GitOps-hub | Hub GitOps management
| Red Hat OpenShift GitOps | Operator | openshift-operators | OpenShift GitOps
| Red Hat Ansible Automation Platform | Operator | ansible-automation-platform | Ansible Automation
| Red Hat OpenShift Data Foundations | Operator | openshift-storage | OpenShift Storage solution
| Red Hat OpenShift Virtualization | Operator | openshift-cnv | Virtualization software to run VMs
| Edge GitOps VMs | VMs | edge-gitops-vms | Simulated Edge environment with VMs to manage
| Hashicorp Vault | Operator | vault | Secrets Storage
| External Secrets Operator (ESO) | Operator | golang-external-secrets | Abstraction for secrets storage

### Ansible Edge GitOps Pattern OpenShift Datacenter HUB Cluster Size

The Ansible Edge GitOps pattern has been tested with a defined set of specifically tested configurations that represent the most common combinations that Red Hat OpenShift Container Platform (OCP) customers are using or deploying for the x86_64 architecture.

The Hub OpenShift Cluster is made up of the the following on the AWS deployment tested:

| Node Type | Number of nodes | Cloud Provider | Instance Type
| :---- | :----: | :---- | :----
| Control Plane | 3 | Amazon Web Services | m5.xlarge
| Worker | 3 | Amazon Web Services | m5.4xlarge
| Worker | 1 | Amazon Web Services | c5n.metal

The metal node is added to the cluster by the installation process after initial provisioning. The pattern on the hub requires OpenShift Data Fabric to support Virtual Machine storage and is a **minimum** size for a Hub cluster.  In the next few sections we take some snapshots of the cluster utilization while the **Ansible Edge GitOps** pattern is running.  Keep in mind that resources will have to be added as more developers are working building their applications.

#### Datacenter Cluster utilization

Below is a snapshot of the OpenShift cluster utilization while running the **Ansible Edge GitOps** pattern:

| CPU    | CPU%    | Memory | Memory%
| :----: | :-----: | :----: | :----:
321m |   0%  |   12511Mi  |       6%
736m |       21%  |  7533Mi  |        51%
673m |       4%   |  9298Mi  |        14%
920m |       26%  |  8635Mi  |        59%
673m |       4%   |  9258Mi  |        14%
921m |       26%  |  9407Mi  |        65%
395m |        2%  |   5149Mi |         8%

### AWS Instance Types

The **Ansible Edge GitOps** pattern was tested with the highlighted AWS instances in **bold**.   The OpenShift installer will let you know if the instance type meets the minimum requirements for a cluster.

The message that the openshift installer will give you will be similar to this message

```text
INFO Credentials loaded from default AWS environment variables
FATAL failed to fetch Metadata: failed to load asset "Install Config": [controlPlane.platform.aws.type: Invalid value: "m4.large": instance type does not meet minimum resource requirements of 4 vCPUs, controlPlane.platform.aws.type: Invalid value: "m4.large": instance type does not meet minimum resource requirements of 16384 MiB Memory]
```

Below you can find a list of the AWS instance types that can be used to deploy the **Ansible Edge GitOps** pattern.

| Instance type | Default vCPUs | Memory (GiB) | Datacenter | Factory/Edge
| :------: | :-----: | :-----: | :----: | :----:
| | | | 3x3 OCP Cluster | 3 Node OCP Cluster
| m4.xlarge   | 4  | 16 | N | N
| m4.2xlarge  | 8  | 32 | Y | Y
| m4.4xlarge  | 16 | 64 | Y | Y
| m4.10xlarge | 40 | 160 | Y | Y
| m4.16xlarge | 64 | 256 | Y | Y
| m5.xlarge   | 4  | 16 | Y | N
| m5.2xlarge  | 8  | 32 | Y | Y
| **m5.4xlarge**  | 16 | 64 | Y | Y
| m5.8xlarge  | 32 | 128 | Y | Y
| m5.12xlarge | 48 | 192 | Y | Y
| m5.16xlarge | 64 | 256 | Y | Y
| m5.24xlarge | 96 | 384 | Y | Y

The OpenShift cluster is made of 3 Control Plane nodes and 4 Workers for the Hub cluster; 3 workers are standard compute nodes and one is c5n.metal.  For the node sizes we used the **m5.4xlarge** on AWS and this instance type met the minimum requirements to deploy the **Ansible Edge GitOps** pattern successfully on the Hub cluster.

This pattern is currently only usable on AWS because of the integration of OpenShift Virtualization; it would be straightforward to adapt this pattern also to run on bare metal/on-prem clusters. If and when other public cloud providers support metal node provisioning in OpenShift Virtualization, we will document that here.
