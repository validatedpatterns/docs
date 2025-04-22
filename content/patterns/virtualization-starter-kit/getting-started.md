---
title: Getting Started
weight: 10
aliases: /virtualization-starter-kit/getting-started/
---

# Deploying the Virtualization Starter Kit Pattern

# General Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). Currently this pattern only supports AWS. It could also run on a baremetal OpenShift cluster, because OpenShift Virtualization supports that; there would need to be some customizations made to support it as the default is AWS. We hope that GCP and Azure will support provisioning metal workers in due course so this can be a more clearly multicloud pattern.
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)
1. Ansible, which is used in the bootstrap and provisioning phases of the pattern install (and to configure Ansible Automation Platform).
1. Please note that when run on AWS, this pattern will provision an additional worker node per availability zone (AZ) that the pattern is deployed in, which will be a metal instance (c5.metal) to run the Virtual Machines. These workers are provisioned through the OpenShift MachineAPI and will be automatically cleaned up when the cluster is destroyed.

The use of this pattern depends on having a running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# Credentials Required in Pattern

In addition to the openshift cluster, you will need to prepare a number of secrets, or credentials, which will be used
in the pattern in various ways. To do this, copy the [values-secret.yaml template](https://github.com/validatedpatterns-sandbox/virtualization-starter-kit/blob/main/values-secret.yaml.template) to your home directory as `values-secret.yaml` and replace the explanatory text as follows:

* A username and  SSH Keypair (private key and public key). These will be used to provide access to the VMs in the demo.

```yaml
# NEVER COMMIT THESE VALUES TO GIT
version: "2.0"
secrets:
  - name: vm-ssh
    fields:
    - name: username
      value: 'Username of user to attach privatekey and publickey to - cloud-user is a typical value'

    - name: privatekey
      value: 'Private ssh key of the user who will be able to elevate to root on VMs'

    - name: publickey
      value: 'Public ssh key of the user who will be able to elevate to root on VMs'
```

* A userData block to use with cloud-init. This will allow console login as the user you specify (traditionally cloud-user) with the password you specify. The value in cloud-init is used as the default; roles in the edge-gitops-vms chart can also specify other secrets to use by referencing them in the role block.

```yaml
  - name: cloud-init
    fields:
    - name: userData
      value: |-
        #cloud-config
        user: 'username of user for console, probably cloud-user'
        password: 'a suitable password to use on the console'
        chpasswd: { expire: False }
```

# Prerequisites for deployment via `make install`

There are no special prerequisites to install this pattern.

# How to deploy

1. Login to your cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubeconfig
    ```

1. Fork the [virtualization-starter-kit](https://github.com/validatedpatterns-sandbox/virtualization-starter-kit) repo on GitHub.  It is necessary to fork to preserve customizations you make to the default configuration files.

1. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/virtualization-starter-kit.git
    ```

1. Create a local copy of the Helm values file that can safely include credentials

    WARNING: DO NOT COMMIT THIS FILE

    You do not want to push personal credentials to GitHub.

    ```sh
    cp values-secret.yaml.template ~/values-secret.yaml
    vi ~/values-secret.yaml
    ```

1. Customize the deployment for your cluster (Optional - the defaults in values-global.yaml are designed to work in AWS):

   ```sh
   git checkout -b my-branch
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

Please review the [Patterns quick start](/learn/quickstart/) page. This section describes deploying the pattern using `pattern.sh`. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

1. (Optional) Preview the changes. If you'd like to review what is been deployed with the pattern, `pattern.sh` provides a way to show what will be deployed.

    ```sh
    ./pattern.sh make show
    ```

1. Apply the changes to your cluster. This will install the pattern via the Validated Patterns Operator, and then run any necessary follow-up steps.

    ```sh
    ./pattern.sh make install
    ```

The installation process will take between 45-60 minutes to complete. If you want to know the details of what is happening during that time, the entire process is documented [here](/virtualization-starter-kit/installation-details/).

# Installation Validation

* Check the operators have been installed using the OpenShift console

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

The screen should like this when installed via `make install`:

![virtualization-starter-kit-operators](/images/virtualization-starter-kit/vsk-new-operators.png "Virtualization Starter Kit Operators")

* Check all applications are synchronised

Open the Hub ArgoCD instance from the nine-grid links menu. All applications will sync, but this takes time as ODF has to completely install, and OpenShift Virtualization cannot provision VMs until at least one metal node has been fully provisioned and ready.

![virtualization-starter-kit-applications](/images/virtualization-starter-kit/vsk-applications.png "Virtualization Starter Kit Applications")

* While the metal node is building, the VMs in OpenShift console may not show up, or may show as "Unschedulable." This is normal and expected, as the VMs themselves cannot run until the metal node completes provisioning and is ready.

* Under Virtualization > Virtual Machines, the virtual machines will eventually show as "Running." No additional configuration is done to the VMs beyond instantiating them; they are provided so you can do things like LiveMigrate them or do other virtualization "day 2" activities.

![virtualization-starter-kit-vmlist](/images/virtualization-starter-kit/vsk-openshift-vm-screen.png "Virtualization Starter Kit VM List")

Please see [Installation Details](/virtualization-starter-kit/installation-details/) for more information on the steps of installation.

Please see [OpenShift Virtualization](/virtualization-starter-kit/openshift-virtualization/) for more information on how this pattern uses OpenShift Virtualization.

# Infrastructure Elements of this Pattern

## OpenShift [Virtualization](https://docs.openshift.com/container-platform/4.18/virt/about-virt.html)

OpenShift Virtualization is a Kubernetes-native way to run virtual machine workloads. It is used in this pattern to host VMs simulating an Edge environment; the chart that configures the VMs is designed to be flexible to allow easy customization to model different VM sizes, mixes, versions and profiles for future pattern development.

## HashiCorp [Vault](https://www.vaultproject.io/)

Vault is used as the authoritative source for the Kiosk ssh pubkey via the External Secrets Operator.
As part of this pattern HashiCorp Vault has been installed. Refer to the section on [Vault](https://validatedpatterns.io/secrets/vault/).

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns-sandbox/virtualization-starter-kit/issues)
