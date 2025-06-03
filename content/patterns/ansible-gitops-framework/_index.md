---
title: Ansible GitOps Framework
date: 2024-06-13
tier: sandbox
summary: This variant of the Validated Patterns framework exists to support GitOps outside of Kubernetes.
rh_products:
- Red Hat Ansible Automation Platform
- Red Hat Enterprise Linux
industries:
aliases: /agof/
pattern_logo: ansible-edge.png
links:
  github: https://github.com/validatedpatterns/agof/
  install: https://github.com/validatedpatterns/agof/?tab=readme-ov-file#11-installation
  bugs: https://github.com/validatedpatterns/agof/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
---

# Ansible GitOps Framework

## Background

Ansible GitOps Framework (AGOF) is an alternative to the OpenShift-based Validated Patterns framework, designed to provide a framework for GitOps without Kubernetes. AGOF is not a pattern itself; it is a framework for installing Ansible Automation Platform (AAP), and then using that as the GitOps engine to drive other pattern work. AGOF comes with code to install VMs in AWS, if desired, or else it can work with previously provisioned VMs, or a functional AAP Controller endpoint.

The Pattern is then expressed as an Infrastructure as Code repository, which will be loaded into AAP.

### Solution elements

- How to use a GitOps approach to manage non-Kubernetes workloads

### Red Hat Technologies

- Red Hat Ansible Automation Platform (formerly known as "Ansible Tower")
- Red Hat Enterprise Linux

For more information and guidance on how to use the AGOF framework, see [About the Ansible GitOps framework (AGOF) for validated patterns](https://validatedpatterns.io/learn/vp_agof/).
