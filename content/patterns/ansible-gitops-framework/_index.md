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
  install: https://github.com/validatedpatterns/agof/
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/agof/issues
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
