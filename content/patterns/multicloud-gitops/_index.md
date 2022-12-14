---
title: Multicloud GitOps
date: 2021-12-11
validated: true
summary: This pattern helps you develop and deploy applications on an open hybrid cloud in a stable, simple, and secure way.
products:
- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
industries:
- General
aliases: /multicloud-gitops/
---

<div class="pattern_logo">
  <img src="/images/logos/multicloud-gitops.png" class="pattern_logo" alt="Points">
</div>

# Multicloud GitOps

{{% button text="Install" url="getting-started" color-class="btn-green" %}}
{{% button text="Portfolio Architecture" url="https://www.redhat.com/architect/portfolio/architecturedetail?ppid=8" color-class="btn-blue" %}}
{{% button text="Help & Feedback" url="https://groups.google.com/g/hybrid-cloud-patterns" %}}
{{% button text="Report Bugs" url="https://github.com/hybrid-cloud-patterns/multicloud-gitops/issues" color-class="btn-red" %}}

## Introducing the Multicloud GitOps pattern

Organizations are aiming to develop and deploy applications on an open hybrid cloud in a stable, simple, and secure way. This hybrid strategy includes multicloud deployments where workloads might be running on different clusters and on different clouds - private or public. This strategy also requires an infrastructure-as-code approach that manages versions and deployments based on specific configurations.

<!--to-doNeeds a better transition
Do we need to call out this team? if not, remove it-->

The Multicloud GitOps pattern addresses these requirements. With the Multicloud GitOps pattern, you can determine:

The pattern is derived from work done by the [Red Hat Portfolio Architecture team](https://gitlab.com/redhatdemocentral/portfolio-architecture-examples/-/blob/main/spi-multi-cloud-gitops.adoc)

- How to use a GitOps approach to manage multiple cloud deployments in both public and private clouds.
- How to centrally manage multiple clusters, including workloads.
- How to securely manage secrets across multicloud deployments.

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Advanced Cluster Management (Open Cluster Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Hashicorp Vault

## Architecture

At a high level this requires a management hub, for DevOps and GitOps, and infrastructure that extends to more than one managed clusters running on private or public clouds.

[![Multi-Cloud Architecture](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)

### Logical architecture

[![Logical Architecture](/images/multicloud-gitops/logical-diagram.png)](/images/multicloud-gitops/logical-diagram.png)

### Physical Architecture

[![Physical Architecture](/images/multicloud-gitops/schema-gitops.png)](/images/multicloud-gitops/schema-gitops.png)

For additional logical, physical and dataflow diagrams, please see the work done by the [Red Hat Portfolio Architecture team](https://gitlab.com/redhatdemocentral/portfolio-architecture-examples/-/blob/main/spi-multi-cloud-gitops.adoc)

## Recorded Demo

## What Next

- [Deploy the management hub](getting-started)  using Helm
- Add a managed cluster to [deploy the  managed cluster piece using ACM](managed-cluster)
