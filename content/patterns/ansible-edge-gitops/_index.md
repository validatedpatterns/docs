---
title: Ansible Edge GitOps
date: 2022-06-08
validated: true
summary: This pattern uses OpenShift Virtualization to simulate an edge environment for VMs.
products:
- Red Hat OpenShift Container Platform
- Red Hat Ansible Automation Platform
- Red Hat OpenShift Virtualization
- Red Hat Enterprise Linux
- Red Hat OpenShift Data Foundation
industries:
- Chemical
aliases: /ansible-edge-gitops/
pattern_logo: ansible-edge.png
links:
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/ansible-edge-gitops/issues
ci: aegitops
---

# Ansible Edge GitOps

## Background

Organizations are interested in accelerating their deployment speeds and improving delivery quality in their Edge environments, where many devices may not fully or even partially embrace the GitOps philosophy. Further, there are VMs and other devices that can and should be managed with Ansible. This pattern explores some of the possibilities of using an OpenShift-based Ansible Automated Platform deployment and managing Edge devices, based on work done with a partner in the Chemical space.

This pattern uses OpenShift Virtualization (the productization of Kubevirt) to simulate the Edge environment for VMs.

### Solution elements

- How to use a GitOps approach to manage virtual machines, either in public clouds (limited to AWS for technical reasons) or on-prem OpenShift installations
- How to integrate AAP into OpenShift
- How to manage Edge devices using AAP hosted in OpenShift

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Ansible Automation Platform (formerly known as "Ansible Tower")
- Red Hat OpenShift GitOps (ArgoCD)
- OpenShift Virtualization (Kubevirt)
- Red Hat Enterprise Linux 8

### Other Technologies this Pattern Uses

- Hashicorp Vault
- External Secrets Operator
- Inductive Automation Ignition

## Architecture

Similar to other patterns, this pattern starts with a central management hub, which hosts the AAP and Vault components.

### Logical architecture

![Ansible-Edge-Gitops-Architecture](/images/ansible-edge-gitops/ansible-edge-gitops-arch.png)

### Physical Architecture

TBD

## Recorded Demo

TBD

## Other Presentations Featuring this Pattern

### Registration Required

[![Ansible-Automates-June-2022-Deck](/images/ansible-edge-gitops/automates-june-2022-deck-thumb.png)](https://tracks.redhat.com/c/validated-patterns_i?x=5wCWYS&lx=lT1ZfK)

[![Ansible-Automates-June-2022-Video](/images/ansible-edge-gitops/automates-june-2022-video-thumb.png)](https://tracks.redhat.com/c/preview-42?x=5wCWYS&lx=lT1ZfK)

## What Next

- [Getting Started: Deploying and Validating the Pattern](getting-started)
