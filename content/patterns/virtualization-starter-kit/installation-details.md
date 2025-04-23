---
title: Installation Details
weight: 20
aliases: /ansible-edge-gitops/installation-details/
---

# Installation Details

# Installation Steps

These are the steps run by [make install](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/Makefile) and what each one does:

## [operator-deploy](https://github.com/validatedpatterns/common/blob/main/Makefile)

The operator-deploy task installs the Validated Patterns Operator, which in turn creates a subscription for the OpenShift GitOps operator and installs both the cluster and hub instances of it. The clustergroup application will then read the values-global.yaml and values-hub.yaml files for other subscriptions and applications to install.

The [legacy-install](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/Makefile) is still provided for users that cannot or do not want to use the Validated Patterns operator. Instead of installing the operator, it installs a helm chart that does the same thing - installs a subscription for OpenShift GitOps and installs a cluster-wide and hub instance of that operator. It then proceeds with installing the clustergroup application.

Note that both the [upgrade](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/Makefile)  and [legacy-upgrade](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/Makefile) targets are now equivalent and interchangeable with `install` and `legacy-install` (respectively - `legacy-install/legacy-upgrade` are not compatible with standard `install/upgrade`. This was not always the case, so both install/upgrade targets are still provided).

### Imperative section

Part of the operator-deploy process is creating and running the [imperative](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/values-hub.yaml) tools as defined in the hub values file. In this pattern, that includes running the playbook to deploy the metal worker.

The real code for this playbook (outside of a shell wrapper) is [here](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/ansible/deploy_kubevirt_worker.yml).

This script is another Ansible playbook that deploys a node to run the Virtual Machines for the demo. The playbook uses the OpenShift machineset API to provision the node in the first availability zone it finds. Currently, AWS is the only major public cloud provider that offers the deployment of a metal node through the normal provisioning process. We hope that Azure and GCP will support this functionality soon as well.

Please be aware that the metal node is rather more expensive in compute costs than most other AWS machine types. The trade-off is that running the demo without hardware acceleration would take ~4x as long.

It takes about 20-30 minutes for the metal node to become available to run VMs. If you would like to see the current status of the metal node, you can check it this way (assuming your kubeconfig is currently set up to point to your cluster):

```shell
oc get -A machineset
```

You will be looking for the machinesets with `metal-worker` in their names:

```text
NAMESPACE               NAME                                        DESIRED   CURRENT   READY   AVAILABLE   AGE
openshift-machine-api   mhjacks-vsk-z52vt-metal-worker-us-west-1b   1         1         1       1           5h37m
openshift-machine-api   mhjacks-vsk-z52vt-metal-worker-us-west-1c   1         1         1       1           5h37m
openshift-machine-api   mhjacks-vsk-z52vt-worker-us-west-1b         2         2         2       2           6h31m
openshift-machine-api   mhjacks-vsk-z52vt-worker-us-west-1c         1         1         1       1           6h31m
```

When the `metal-worker`'s are showing "READY" and "AVAILABLE", the virtual machines will begin provisioning on it.

The metal nodes will be destroyed when the cluster is destroyed. The script is idempotent and will create at most one metal node per availability zone in the cluster.

## [post-install](https://github.com/validatedpatterns/common/blob/main/Makefile)

Note that all the steps of `post-install` are idempotent.

Specific processes that are called by post-install include:

### [vault-init](https://github.com/validatedpatterns/common/blob/main/scripts/vault-utils.sh)

Vault requires extra setup in the form of unseal keys and configuration of secrets. The vault-init task does this. Note that it is safe to run vault-init as it will exit successfully if it can connect to a cluster with a running, unsealed vault.

### [load-secrets](https://github.com/validatedpatterns/common/blob/main/scripts/vault-utils.sh)

This process (which calls push_secrets) calls an Ansible playbook that reads the values-secret.yaml file and stores the data it finds there in vault as keypairs. These values are then usable in the kubernetes cluster. This pattern uses the ssh pubkey for the kiosk VMs via the external secrets operator.

This script will update secrets in vault if re-run; it is safe to re-run if the secret values have not changed as well.

# OpenShift GitOps (ArgoCD)

OpenShift GitOps is central to this pattern as it is responsible for installing all of the other components. The installation process is driven through the installation of the [clustergroup](https://github.com/validatedpatterns/common/tree/main/clustergroup) chart. This in turn reads the repo's [global values file](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/values-global.yaml), which instructs it to read the [hub values file](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/values-hub.yaml). This is how the pattern knows to apply the Subscriptions and Applications listed further in the pattern.

# ODF (OpenShift Data Foundations)

ODF is the storage framework that is needed to provide resilient storage for OpenShift Virtualization.  It is managed via the helm chart [here](https://github.com/validatedpatterns/ansible-edge-gitops/tree/main/charts/hub/openshift-data-foundations). This is basically the same chart that our Medical Diagnosis pattern uses (see [here](/patterns/medical-diagnosis/getting-started/) for details on the Medical Edge pattern's use of storage).

Please note that this chart will create a Noobaa S3 bucket named nb.epoch_timestamp.cluster-domain which will not be destroyed when the cluster is destroyed.

# OpenShift Virtualization (KubeVirt)

OpenShift Virtualization is a framework for running virtual machines as native Kubernetes resources. While it can run without hardware acceleration, the performance of virtual machines will suffer terribly; some testing on a similar workload indicated a 4-6x delay running without hardware acceleration, so at present this pattern requires hardware acceleration. The pattern provides a script [deploy-kubevirt-worker.sh](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/scripts/deploy_kubevirt_worker.sh) which will provision a metal worker to run virtual machines for the pattern.

OpenShift Virtualization currently supports only AWS and on-prem clusters; this is because of the way that baremetal resources are provisioned in GCP and Azure. We hope that OpenShift Virtualization can support GCP and Azure soon.

The installation of the OpenShift Virtualization HyperConverged deployment is controlled by the chart [here](https://github.com/validatedpatterns/ansible-edge-gitops/tree/main/charts/hub/cnv).

OpenShift Virtualization was chosen in this pattern to avoid dealing with the differences in galleries and templates of images between the different public cloud providers. The important thing from this pattern's standpoint is the availability of machine instances to manage (since we are simulating an Edge deployment scenario, which could either be bare metal instances or virtual machines); OpenShift Virtualization was the easiest and most portable way to spin up machine instances. It also provides mechanisms for defining the desired machine set declaratively.

The creation of virtual machines is controlled by the chart [here](https://github.com/validatedpatterns/ansible-edge-gitops/tree/main/charts/hub/edge-gitops-vms).

More details about the way we use OpenShift Virtualization are available [here](/ansible-edge-gitops/openshift-virtualization).

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns/ansible-edge-gitops/issues)
