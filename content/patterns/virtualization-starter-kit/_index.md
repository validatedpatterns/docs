---
title: Virtualization Starter Kit
date: 2025-04-21
tier: sandbox
summary: This pattern uses OpenShift Virtualization to host VMs.
rh_products:
- Red Hat OpenShift Container Platform
- Red Hat OpenShift Virtualization
- Red Hat Enterprise Linux
- Red Hat OpenShift Data Foundation
industries:
- Any
aliases: /virtualization-starter-kit/
pattern_logo: ansible-edge.png
links:
  github: https://github.com/validatedpatterns-sandbox/virtualization-starter-kit
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns-sandbox/virtualization-starter-kit
ci: vsk
---

# Virtualization Starter Kit

## Background

Organizations are interested in accelerating their deployment speeds and improving delivery quality in their Edge environments, where many devices may not fully or even partially embrace the GitOps philosophy.

This pattern uses OpenShift Virtualization (the productization of Kubevirt) to host the VMs.

### Solution elements

- How to use a GitOps approach to manage virtual machines, either in public clouds (limited to AWS for technical reasons) or on-prem OpenShift installations
- A standardized environment with two running VMs to start exploring Virtualization on OpenShift with High Availability
features

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat OpenShift GitOps (ArgoCD)
- OpenShift Virtualization (Kubevirt)
- Red Hat Enterprise Linux 9
- Red Hat OpenShift Node Health Check Operator
- Red Hat OpenShift Self Node Remediation Operator
- Red Hat Migration Toolkit for Virtualization

### Other Technologies this Pattern Uses

- Hashicorp Vault
- External Secrets Operator

## Architecture

Similar to other patterns, this pattern starts with a central management hub, which hosts OCP-Virt and ODF and
hosts the VMs.

## What Next

- [Getting Started: Deploying and Validating the Pattern](getting-started)
