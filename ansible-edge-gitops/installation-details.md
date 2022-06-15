---
layout: default
title: Installation Details
grand_parent: Patterns
parent: Ansible Edge GitOps
nav_order: 1
---

# Installation Details

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Installation Steps

These are the steps run by [make install](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/Makefile) and what each one does:

## [deploy](https://github.com/hybrid-cloud-patterns/common/blob/main/Makefile)

The deploy task installs the basic Validated Patterns framework elements, which includes adding a subscription for the OpenShift GitOps operator and installing both the cluster and hub instances of it. The clustergroup application will then read the values-global.yaml and values-hub.yaml files for other subscriptions and applications to install.

## [vault-init](https://github.com/hybrid-cloud-patterns/common/blob/main/scripts/vault-utils.sh)

Vault requires extra setup in the form of unseal keys and configuration of secrets. The vault-init task does this. Note that it is safe to run vault-init as it will exit successfully if it can connect to a cluster with a running, unsealed vault.

## [ansible-push-vault-secrets.sh](https://github.com/hybrid-cloud-patterns/common/blob/main/scripts/ansible-push-vault-secrets.sh)

This script is actually an Ansible playbook that reads the values-secret.yaml file and stores the data it finds there in vault as keypairs. These values are then usable in the kubernetes cluster. This pattern uses the ssh pubkey for the kiosk VMs via the external secrets operator.

The script will update secrets in vault if re-run.

## [deploy-kubevirt-worker.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/deploy_kubevirt_worker.sh)

This script is another Ansible playbook that deploys a node to run the Virtual Machines for the demo. The playbook uses the OpenShift machineset API to provision the node in the first availability zone it finds. Currently, AWS is the only major public cloud provider that offers the deployment of a metal node through the normal provisioning process. We hope that Azure and GCP will support this functionality soon as well.

Please be aware that the metal node is rather more expensive in compute costs than most other AWS machine types. The trafeoff is that running the demo without hardware acceleration would take ~4x as long.

It takes about 30 minutes for the metal node to become available to run VMs.

The metal node will be destroyed when the cluster is destroyed. The script is idempotent and will create at most one metal node per cluster.

## [ansible-load-controller.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/ansible_load_controller.sh)

The ansible-load-controller script uses the [controller configuration](https://github.com/redhat-cop/controller_configuration) framework to configure the Ansible Automation Platform instance that is installed by the helm chart.

The script waits until AAP is ready, and then proceeds to:
1. Install the manifest to entitle AAP
1. Configure the custom Credential Types the demo needs
1. Define an Organization for the Demo
1. Add a Project for the Demo
1. Add the Credentials for jobs to use
1. Configure Host inventory and inventory sources, and smart inventories to define target hosts
1. Configure an Execution environment for the Demo
1. Configure Job Templates for the Demo
1. Configure Schedules for the jobs that need to repeat

# OpenShift GitOps (ArgoCD)

# ODF (OpenShift Data Foundations)

# OpenShift Virtualization (KubeVirt)

# Ansible Automation Platform (AAP, formerly known as Ansible Tower)

# Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
