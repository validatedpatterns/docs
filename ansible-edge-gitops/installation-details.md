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

## [load-secrets](https://github.com/hybrid-cloud-patterns/common/blob/main/ansible/roles/vault_utils/tasks/push_secrets.yaml)

This script is actually an Ansible playbook that reads the values-secret.yaml file and stores the data it finds there in vault as keypairs. These values are then usable in the kubernetes cluster. This pattern uses the ssh pubkey for the kiosk VMs via the external secrets operator.

The script will update secrets in vault if re-run; it is safe to re-run if the secret values have not changed as well.

## [deploy-kubevirt-worker.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/deploy_kubevirt_worker.sh)

The real code for this playbook (outside of a shell wrapper) is [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/ansible/deploy_kubevirt_worker.yml).

This script is another Ansible playbook that deploys a node to run the Virtual Machines for the demo. The playbook uses the OpenShift machineset API to provision the node in the first availability zone it finds. Currently, AWS is the only major public cloud provider that offers the deployment of a metal node through the normal provisioning process. We hope that Azure and GCP will support this functionality soon as well.

Please be aware that the metal node is rather more expensive in compute costs than most other AWS machine types. The trade-off is that running the demo without hardware acceleration would take ~4x as long.

It takes about 20-30 minutes for the metal node to become available to run VMs. If you would like to see the current status of the metal node, you can check it this way (assuming your kubeconfig is currently set up to point to your cluster):

```shell
oc get -A machineset
```

You will be looking for a machineset with `metal-worker` in its name:

```text
NAMESPACE               NAME                                        DESIRED   CURRENT   READY   AVAILABLE   AGE
openshift-machine-api   mhjacks-aeg-qx25w-metal-worker-us-west-2a   1         1         1       1           19m
openshift-machine-api   mhjacks-aeg-qx25w-worker-us-west-2a         1         1         1       1           47m
openshift-machine-api   mhjacks-aeg-qx25w-worker-us-west-2b         1         1         1       1           47m
openshift-machine-api   mhjacks-aeg-qx25w-worker-us-west-2c         1         1         1       1           47m
openshift-machine-api   mhjacks-aeg-qx25w-worker-us-west-2d         0         0                             47m
```

When the `metal-worker` is showing "READY" and "AVAILABLE", the virtual machines will begin provisioning on it.

The metal node will be destroyed when the cluster is destroyed. The script is idempotent and will create at most one metal node per cluster.

## [ansible-load-controller.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/ansible_load_controller.sh)

There are two parts to this script - the first part, with the code [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/ansible/ansible_get_credentials.yml), retrieves the admin credentials from OpenShift to enable login to the AAP Controller.

The second part, which is the bulk of the ansible-load-controller process is [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/ansible/ansible_configure_controller.yml) and uses the [controller configuration](https://github.com/redhat-cop/controller_configuration) framework to configure the Ansible Automation Platform instance that is installed by the helm chart.

This division is so that users can adapt this pattern more easily if they're running AAP, but not on OpenShift.

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

*Note:* This script has defaults that it overrides when run as part of `make install` that it derives from the environment (the repo that it is attached to and the branch that it is on). So if you need to re-run it, the most straightforward way to do this is to run `make upgrade` when using the make-based installation process.

# OpenShift GitOps (ArgoCD)

OpenShift GitOps is central to this pattern as it is responsible for installing all of the other components. The installation process is driven through the installation of the [clustergroup](https://github.com/hybrid-cloud-patterns/common/tree/main/clustergroup) chart. This in turn reads the repo's [global values file](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/values-global.yaml), which instructs it to read the [hub values file](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/values-hub.yaml). This is how the pattern knows to apply the Subscriptions and Applications listed further in the pattern.

# ODF (OpenShift Data Foundations)

ODF is the storage framework that is needed to provide resilient storage for OpenShift Virtualization.  It is managed via the helm chart [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/tree/main/charts/hub/odf). This is basically the same chart that our Medical Diagnosis pattern uses (see [here](/medical-diagnosis/getting-started/#setting-up-the-storage-for-openshift-data-foundation) for details).

Please note that this chart will create a Noobaa S3 bucket named nb.epoch_timestamp.cluster-domain which will not be destroyed when the cluster is destroyed.

# OpenShift Virtualization (KubeVirt)

OpenShift Virtualization is a framework for running virtual machines as native Kubernetes resources. While it can run without hardware acceleration, the performance of virtual machines will suffer terribly; some testing on a similar workload indicated a 4-6x delay running without hardware acceleration, so at present this pattern requires hardware acceleration. The pattern provides a script [deploy-kubevirt-worker.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/deploy_kubevirt_worker.sh) which will provision a metal worker to run virtual machines for the pattern.

OpenShift Virtualization currently supports only AWS and on-prem clusters; this is because of the way that baremetal resources are provisioned in GCP and Azure. We hope that OpenShift Virtualization can support GCP and Azure soon.

The installation of the OpenShift Virtualization HyperConverged deployment is controlled by the chart [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/tree/main/charts/hub/cnv).

OpenShift Virtualization was chosen in this pattern to avoid dealing with the differences in galleries and templates of images between the different public cloud providers. The important thing from this pattern's standpoint is the availability of machine instances to manage (since we are simulating an Edge deployment scenario, which could either be bare metal instances or virtual machines); OpenShift Virtualization was the easiest and most portable way to spin up machine instances. It also provides mechanisms for defining the desired machine set declaratively.

The creation of virtual machines is controlled by the chart [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/tree/main/charts/hub/edge-gitops-vms).

More details about the way we use OpenShift Virtualization are available [here](/ansible-edge-gitops/openshift-virtualization).

# Ansible Automation Platform (AAP, formerly known as Ansible Tower)

The use of Ansible Automation Platform is really the centerpiece of this pattern. We have recognized for some time that the notion and design principles of GitOps should apply to things outside of Kubernetes, and we believe this pattern
gives us a way to do that.

All of the Ansible interactions are defined in a Git Repository; the Ansible jobs that configure the VMs are designed
to be idempotent (and are scheduled to run every 10 minutes on those VMs).

The installation of AAP itself is governed by the chart [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/tree/main/charts/hub/ansible-automation-platform).  The post-installation configuration of AAP is done via the [ansible-load-controller.sh](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/blob/main/scripts/ansible_load_controller.sh) script.

It is very much the intention of this pattern to make it easy to replace the specific Edge management use case with another one. Some ideas on how to do that can be found [here](/ansible-edge-gitops/ideas-for-customization/).

Specifics of the Ansible content for this pattern can be seen [here](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/tree/main/ansible).

More details of the specifics of how AAP is configured are available [here](/ansible-edge-gitops/ansible-automation-platform/).

# Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
