---
title: Regional Disaster Recovery
date: 2024-09-20
tier: sandbox
summary: This variant of the Validated Patterns framework deploys a Regional Disaster Recovery Setup across multiple different regions
rh_products:
- Red Hat OpenShift Container Platform
industries:
aliases: /agof/
pattern_logo: regional-dr.png
links:
  install: https://github.com/validatedpatterns/regional-resiliency-pattern
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/regional-resiliency-pattern/issues
---

# OpenShift Regional DR

The _Regional DR Validated Pattern for [Red Hat OpenShift][ocp]_ increases the resiliency
of your applications by connecting multiple clusters across different regions. This pattern
uses [Red Hat Advanced Cluster Management][acm] to offer a
[Red Hat OpenShift Data Foundation][odf]-based multi-region disaster recovery plan if an
entire region fails.

## Background

[Red Hat OpenShift Data Foundation][odf] offers two solutions for disaster
recovery: [Metro DR][mdr] and [Regional DR][rdr]. As their name suggests, _Metro
DR_ refers to a metropolitan area disasters, which occur when the disaster
covers only a single area in a region (availability zone), and _Regional DR_
refers to when the entire region fails.  Currently, only active-passive mode is
supported.

A word on synchronization. A metropolitan network generally offers less latency;
data can be written to multiple targets simultaneously, a feature required for
active-active DR designs. On the other hand, writing to multiple targets in a
cross-regional network might introduce unbearable latency to data
synchronization and our applications. Therefore, _Regional DR_ can only work
with active-passive DR designs, where the targets are replicated
asynchronously.

The synchronization between Availability Zones is faster and can be performed
synchronous. However, in order don't include a lot of latency on the data
synchronization process, when data is replicated across regions, it necessary
includes latencies based on the distance between both regions (e.g. The latency
between two regions on Europe, will always be less than between Europe and Asia,
so consider this when designing your infrastructure deployment on the values
files of the pattern). This is the main reason because this RegionalDR is
configured in an Active-Passive mode.

It requires an already existing Openshift cluster, which will be used for installing the
pattern, deploying active and passive clusters manage the application
scheduling.

### Prerequisites

Installing this pattern requires:
* One online [Red Hat OpenShift][ocp] cluster to become the "Manager" cluster.
This cluster will orchestrate application deployments and data synchronizations.
* Connection to a Cloud Provider (AWS/Azure/GCP) configured in the Manager
cluster. This is required for deploying the active and passive [OCP][ocp]
clusters.
* [Red Hat OpenShift CLI][cli] installed

### Solution elements

The _Regional DR Pattern_ leverages [Red Hat OpenShift Data Foundation][odf]'s
[Regional DR][rdr] solution, automating applications failover between
[Red Had Advanced Cluster Management][acm] managed clusters in different regions.

### Red Hat Technologies
- [Red Hat Openshift Container Platform][ocp]
- [Red Hat Openshift Data Foundation][odf]
- [Red Hat Openshift GitOps][ops]
- [Red Hat Openshift Advanced Cluster Management][acm]
- [Red Hat Openshift Advanced Cluster Security][acs]

## Operators and Technologies this Pattern Uses
- [Regional DR Trigger Operator][opr]
- [Submariner][sub]

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
work as the control plane for the rest of Openshift clusters. The controller
cluster will not execute the applications or store any data from them, but it
will work as the control panel for the interconnection of active-passive
clusters, coordinating their communication and orchestrating when and where an
application is going to be deployed.

As part of the pattern configuration, the administrator needs to define both
clusters installation details as would be done using the Openshift-installer
binary.

For installing the pattern, follow the next steps:
1. Fork the _Pattern_.
2. Describe the instructions for creating the clusters and syncing data between them.
3. Commit and push your changes (to your fork).
4. Set your **secret** cloud provider credentials.
5. Connect to your target _Hub_ cluster.
6. Install the _Pattern_.
7. Start deploying [resilient applications][rdr].


### Pattern Configuration

For a full example, check the _Pattern_'s [values.yaml][yml]. The install-config
specifications are detailed [here][cfg].

Detailed configuration instructions can be found [here][rrp].


## Owners

For any request, bug report or comment about this pattern, please forward it to:
* Alejandro Villegas (avillega@rehat.com)
* Tomer Figenblat (tfigenbl@redhat.com)

<!-- LINKS -->
[acm]: https://www.redhat.com/en/technologies/management/advanced-cluster-management
[acs]: https://www.redhat.com/en/technologies/cloud-computing/openshift/advanced-cluster-security-kubernetes
[aws]: https://www.redhat.com/en/technologies/cloud-computing/openshift/aws
[azr]: https://www.redhat.com/en/technologies/cloud-computing/openshift/azure
[cfg]: https://docs.openshift.com/container-platform/4.17/installing/installing_bare_metal_ipi/ipi-install-installation-workflow.html#additional-resources_config
[cli]: https://docs.openshift.com/container-platform/4.14/cli_reference/openshift_cli/getting-started-cli.html
[gcp]: https://www.redhat.com/en/blog/red-hat-openshift-is-now-available-on-google-cloud-marketplace
[mdr]: https://docs.redhat.com/en/documentation/red_hat_openshift_data_foundation/4.16/html/configuring_openshift_data_foundation_disaster_recovery_for_openshift_workloads/metro-dr-solution
[ocp]: https://www.redhat.com/en/technologies/cloud-computing/openshift
[odf]: https://www.redhat.com/en/technologies/cloud-computing/openshift-data-foundation
[ops]: https://www.redhat.com/en/technologies/cloud-computing/openshift/gitops
[opr]: https://github.com/RHEcosystemAppEng/regional-dr-trigger-operator
[sub]: https://submariner.io/
[rdr]: https://docs.redhat.com/en/documentation/red_hat_openshift_data_foundation/4.16/html/configuring_openshift_data_foundation_disaster_recovery_for_openshift_workloads/rdr-solution
[rrp]: https://github.com/validatedpatterns/regional-resiliency-pattern?tab=readme-ov-file#installation
[yml]: https://github.com/validatedpatterns/regional-resiliency-pattern/blob/main/charts/hub/rdr/values.yaml
