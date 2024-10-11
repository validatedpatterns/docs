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

The _Regional DR Validated Pattern for [Red Hat OpenShift][ocp]_ can increase the resiliency
of your applications by connecting multiple clusters across various regions. This pattern
uses [Red Hat Advanced Cluster Management][acm] to offer a
[Red Hat OpenShift Data Foundation][odf]-based multi-region disaster recovery plan if an
entire region fails.

## Background

[Red Hat OpenShift Data Foundation][odf] offers two solutions for disaster recovery:
[Metro DR][mdr] and [Regional DR][rdr]. As their name suggests, _Metro DR_ refers to
a metropolitan area disasters, which occur when the disaster covers only a single area
in a region (availability zone), and _Regional DR_ refers to when the entire region fails.

A word on synchronization. A metropolitan network is generally much faster and offers less
latency; data can be written to multiple targets simultaneously, a feature required for
active-active DR designs. On the other hand, writing to multiple targets in a cross-regional
network might introduce unbearable latency to our applications. Therefore, _Regional DR_
can only work with active-passive DR designs, where the targets are replicated asynchronously.

### Prerequisites

Installing this pattern requires:
* One online [Red Hat OpenShift][ocp] cluster
* Cloud credentials for either [AWS][aws], [Azure][azr], or [GCP][gcp]
* [Red Hat OpenShift CLI][cli] installed

### Solution elements

The _Regional DR Pattern_ leverages _[Red Hat OpenShift Data Foundation][odf]'s
[Regional DR][rdr] solution, automating applications failover between
[Red Had Advanced Cluster Management][acm] managed clusters in different regions.

### Red Hat Technologies
-
- [Red Hat Openshift Container Platform][ocp]
- [Red Hat Openshift Data Foundation][odf]
- [Red Hat Openshift GitOps][ops]
- [Red Hat Openshift Advanced Cluster Management][acm]
- [Red Hat Openshift Advanced Cluster Security][acs]

## Operators and Technologies this Pattern Uses

- [Regional DR Trigger Operator][opr]

## Tested on

- Red Hat Openshift Container Platform v4.13
- Red Hat Openshift Container Platform v4.14
- Red Hat Openshift Container Platform v4.15

## Architecture

![Regional-Resiliency-Pattern-Logical-Architecture](/images/regional-resiliency-pattern/architecture-diagram-vp-regional-dr-v6.png)

## Logical architecture

![Regional-Resiliency-Pattern-Logical-Architecture](/images/regional-resiliency-pattern/logical-architecture-diagram-vp-regional-dr-v6.png)


## Installation

* Fork the _Pattern_.
* Describe the instructions for creating the clusters and syncing data between them.
* Commit and push your changes (to your fork).
* Set your **secret** cloud provider credentials.
* Connect to your target _Hub_ cluster.
* Install the _Pattern_.
* Start deploying [resilient applications][rdr].

Detailed installation instructions can be found [here][rrp].

### Pattern Configuration

For a full example, check the _Pattern_'s [values.yaml][yml]. The install-config
specifications are detailed [here][cfg].

Detailed configuration instructions can be found [here][rrp].

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
[rdr]: https://docs.redhat.com/en/documentation/red_hat_openshift_data_foundation/4.16/html/configuring_openshift_data_foundation_disaster_recovery_for_openshift_workloads/rdr-solution
[rrp]: https://github.com/validatedpatterns/regional-resiliency-pattern
[yml]: https://github.com/validatedpatterns/regional-resiliency-pattern/blob/main/charts/hub/rdr/values.yaml
