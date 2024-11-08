---
title: HyperShift
date: 2024-11-08
tier: maintained
summary: This pattern is for deploying the Hosted Control Planes (HyperShift) clusters using different providers.
rh_products:
  - Red Hat OpenShift Container Platform
  - Red Hat MultiCluster Engine
  - Red Hat OpenShift Virtualization
other_products:
  - MetalLB
industries:
  - Infrastructure
aliases: /hypershift/
pattern_logo: medical-diagnosis.png
links:
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns-sandbox/hypershift/issues
ci: hypershift
---

# Hosted Control Planes

## Background

HyperShift is middleware for hosting OpenShift control planes at scale that solves for cost and time to provision, as well as portability cross cloud with strong separation of concerns between management and workloads. Clusters are fully compliant OpenShift Container Platform (OCP) clusters and are compatible with standard OCP and Kubernetes toolchains.

![Hypershift High-Level Architecture](/images/hypershift/hypershift-high-level-architecture.png "source: https://hypershift-docs.netlify.app/")

> **Note**
> If you have any questions or concerns, contact [Jonny Rickard](mailto:jrickard@redhat.com) or [Juan Manuel Parrilla](mailto:jparrill@redhat.com).

## Benefits

The solution enables:

- A rapid provisioning of Hosted Clusters.
- A big save on the money side for resource consumption in the Cloud or on-premise.
- To make a better use of the BareMetal servers in the data center.

...and [some more reasons](https://hypershift-docs.netlify.app/reference/goals-and-design-invariants/) that could help different customers with different scenarios.

The hosted control plane pattern uses the following products and technologies:

- Red Hat OpenShift Container Platform (OCP) for container orchestration.
- Red Hat GitOps, a GitOps continuous delivery (CD) solution.
- The Red Hat MultiCluster Engine (MCE) Operator.
- Red Hat Openshift Virtualization


## Demos

- How to deploy a HostedControlPlane using Agent provider in DualStack/Connected using the CLI

[![alt text](https://img.youtube.com/vi/fgiu_Rz_lvc/0.jpg)](https://www.youtube.com/watch?v=fgiu_Rz_lvc)

- How to deploy a HostedControlPlane using Agent provider in DualStack/Disconnected using the CLI

[![alt text](https://img.youtube.com/vi/xdcl_Q3LTtw/0.jpg)](https://www.youtube.com/watch?v=xdcl_Q3LTtw)

- How to deploy a HostedControlPlane using Kubevirt provider in IPv4/Connected using the WebUI

[![alt text](https://img.youtube.com/vi/ABpeVd093LI/0.jpg)](https://www.youtube.com/watch?v=ABpeVd093LI)

## Next Steps

- [Getting started](getting-started) with HCP.

