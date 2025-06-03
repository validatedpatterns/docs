---
title: OpenShift Virtualization Data Protection with Veeam Kasten
date: 2024-11-06
tier: sandbox
summary: This pattern uses OpenShift Virtualization to simulate an edge environment for VMs, protected by Veeam Kasten.
rh_products:
- Red Hat OpenShift Container Platform
- Red Hat Ansible Automation Platform
- Red Hat OpenShift Virtualization
- Red Hat Enterprise Linux
- Red Hat OpenShift Data Foundation
partners:
- Veeam Kasten
industries:
- Chemical
aliases: /ansible-edge-gitops-kasten/
pattern_logo: veeam-kasten.png
links:
  github: https://github.com/validatedpatterns/ansible-edge-gitops
  install: getting-started
  bugs: https://github.com/validatedpatterns/ansible-edge-gitops/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
# ci: aegitops
---

# OpenShift Virtualization Data Protection with Veeam Kasten

## Background

This example extends the standard [Ansible Edge GitOps pattern](https://validatedpatterns.io/patterns/ansible-edge-gitops/) to include automated deployment and configuration of [Veeam Kasten](https://www.veeam.com/products/cloud/kubernetes-data-protection.html), the #1 Kubernetes data protection and mobility solution.

This pattern uses **Red Hat OpenShift Virtualization** (the productization of KubeVirt) to provision VMs alongside Kubernetes-native workloads on the cluster. As VMs are inherently stateful workloads, a GitOps approach alone is not sufficient to recover an environment in the event of accidental data loss, malware attack, or infrastructure failure - especially in edge environments where infrastructure may be less resilient or subject to harsh environments. This example extends the standard [Ansible Edge GitOps pattern](https://validatedpatterns.io/patterns/ansible-edge-gitops/) to include automated deployment and configuration of [Veeam Kasten](https://www.veeam.com/products/cloud/kubernetes-data-protection.html), the #1 Kubernetes data protection and mobility solution.

### Solution elements

- How to use a GitOps approach to manage virtual machines, either in public clouds (limited to AWS for technical reasons) or on-prem OpenShift installations
- How to integrate AAP into OpenShift
- How to manage Edge devices using AAP hosted in OpenShift
- How to protect OpenShift Virtualzation VMs

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Ansible Automation Platform (formerly known as "Ansible Tower")
- Red Hat OpenShift GitOps (ArgoCD)
- OpenShift Virtualization (KubeVirt)
- Red Hat Enterprise Linux 8

### Other Technologies this Pattern Uses

- Veeam Kasten
- Hashicorp Vault
- External Secrets Operator
- Inductive Automation Ignition

## Architecture

Similar to other patterns, this pattern starts with a central management hub, which hosts the AAP and Vault components. Veeam Kasten is deployed on each cluster it protects, providing a self-contained solution ideal for edge deployments without dependencies on external infrastructure or SaaS management plane.

### Logical architecture

![Ansible-Edge-Gitops-Architecture](/images/ansible-edge-gitops/ansible-edge-gitops-arch.png)

### Physical Architecture

![Ansible-Edge-GitOps-Physical-Architecture](/images/ansible-edge-gitops-kasten/aeg-arch-schematic.png)

## Other Presentations Featuring this Pattern

### Registration Required

[![Ansible-Automates-June-2022-Deck](/images/ansible-edge-gitops/automates-june-2022-deck-thumb.png)](https://tracks.redhat.com/c/validated-patterns_i?x=5wCWYS&lx=lT1ZfK)

[![Ansible-Automates-June-2022-Video](/images/ansible-edge-gitops/automates-june-2022-video-thumb.png)](https://tracks.redhat.com/c/preview-42?x=5wCWYS&lx=lT1ZfK)

## What's Next

- [Getting Started: Deploying and Validating the Pattern](getting-started)
