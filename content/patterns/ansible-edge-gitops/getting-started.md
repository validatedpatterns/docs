---
title: Getting Started
weight: 10
aliases: /ansible-edge-gitops/getting-started/
---

# Deploying the Ansible Edge GitOps Pattern

# General Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). See also [sizing your cluster](../../ansible-edge-gitops/cluster-sizing). Currently this pattern only supports AWS. It could also run on a baremetal OpenShift cluster, because OpenShift Virtualization supports that; there would need to be some customizations made to support it as the default is AWS. We hope that GCP and Azure will support provisioning metal workers in due course so this can be a more clearly multicloud pattern.
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)
1. Ansible, which is used in the bootstrap and provisioning phases of the pattern install (and to configure Ansible Automation Platform).
1. Please note that when run on AWS, this pattern will provision an additional worker node, which will be a metal instance (c5n.metal) to run the Edge Virtual Machines. This worker is provisioned through the OpenShift MachineAPI and will be automatically cleaned up when the cluster is destroyed.

The use of this pattern depends on having a running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# Credentials Required in Pattern

In addition to the openshift cluster, you will need to prepare a number of secrets, or credentials, which will be used
in the pattern in various ways. To do this, copy the [values-secret.yaml template](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/values-secret.yaml.template) to your home directory as `values-secret.yaml` and replace the explanatory text as follows:

* A username and  SSH Keypair (private key and public key). These will be used to provide access to the Kiosk VMs in the demo.

```yaml
---
# NEVER COMMIT THESE VALUES TO GIT
version: "2.0"
secrets:
  - name: kiosk-ssh
    fields:
    - name: username
      value: 'Username of user to attach privatekey and publickey to - cloud-user is a typical value'

    - name: privatekey
      value: 'Private ssh key of the user who will be able to elevate to root to provision kiosks'

    - name: publickey
      value: 'Public ssh key of the user who will be able to elevate to root to provision kiosks'
```

* A Red Hat Subscription Management username and password. These will be used to register Kiosk VM templates to the Red Hat Content Delivery Network and install content on the Kiosk VMs to run the demo.

```yaml
  - name: rhsm
    fields:
    - name: username
      value: 'username of user to register RHEL VMs'
    - name: password
      value: 'password of rhsm user in plaintext'
```

* Container "extra" arguments which will set the admin password for the ignition application when it's running.

```yaml
  - name: kiosk-extra
    fields:
    # Default: '--privileged -e GATEWAY_ADMIN_PASSWORD=redhat'
    - name: container_extra_params
      value: "Optional extra params to pass to kiosk ignition container, including admin password"
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

* A manifest file with an entitlement to run Ansible Automation Platform. This file (which will be a .zip file) will be posted to to Ansible Automation Platform instance to enable its use.  Instructions for creating a manifest file can be found [here](https://www.redhat.com/en/blog/how-create-and-use-red-hat-satellite-manifest)

```yaml
  - name: aap-manifest
    fields:
    - name: b64content
      path: 'full pathname of file containing Satellite Manifest for entitling Ansible Automation Platform'
      base64: true
```

# Prerequisites for deployment via `make install`

If you are going to install via `make install` from your workstation, you will need the following tools and packages:

{% include prerequisite-tools.md %}

And additionally, the following ansible collections:

* community.okd
* redhat_cop.controller_configuration
* awx.awx

To see what collections are installed:

`ansible-galaxy collection list`

To install a collection that is not currently installed:

`ansible-galaxy collection install <collection>`

# How to deploy

1. Login to your cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubeconfig
    ```

1. Fork the [ansible-edge-gitops](https://github.com/validatedpatterns/ansible-edge-gitops) repo on GitHub.  It is necessary to fork to preserve customizations you make to the default configuration files.

1. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/ansible-edge-gitops.git
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

The installation process will take between 45-60 minutes to complete. If you want to know the details of what is happening during that time, the entire process is documented [here](/ansible-edge-gitops/installation-details/).

# Installation Validation

* Check the operators have been installed using the OpenShift console

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

The screen should like this when installed via `make install`:

![ansible-edge-gitops-operators](/images/ansible-edge-gitops/aeg-new-operators.png "Ansible Edge GitOps Operators")

* Check all applications are synchronised

Under the project `ansible-edge-gitops-hub` click on the URL for the `hub`gitops`server`. All applications will sync, but this takes time as ODF has to completely install, and OpenShift Virtualization cannot provision VMs until the metal node has been fully provisioned and ready. Additionally, the Dynamic Provision Kiosk Template in AAP must complete; it can only start once the VMs have provisioned and are running:

![ansible-edge-gitops-applications](/images/ansible-edge-gitops/aeg-applications.png "Ansible Edge GitOps Applications")

* While the metal node is building, the VMs in OpenShift console will show as "Unschedulable." This is normal and expected, as the VMs themselves cannot run until the metal node completes provisioning and is ready.

![ansible-edge-vms-unschedulable](/images/ansible-edge-gitops/aeg-vm-unschedulable.png "Ansible Edge GitOps Unschedulable VMs")

* Under Virtualization > Virtual Machines, the virtual machines will eventually show as "Running." Once they are in "Running" state the Provisioning workflow will run on them, and install Firefox, Kiosk mode, and the Ignition application on them:

![ansible-edge-gitops-vmlist](/images/ansible-edge-gitops/aeg-openshift-vm-screen.png "Ansible Edge GitOps VM List")

* Finally, the VM Consoles will show the Ignition introduction screen. You can choose any of these options; this tutorial assumes you chose "Ignition":

![ansible-edge-gitops-ignition-options](/images/ansible-edge-gitops/aeg-vm-ignition-intro.png "Ansible Edge GitOps Ignition Options")

* You should be able to login to the application with the userid "admin" and the password you specified as the GATEWAY_ADMIN_PASSWORD in `container_extra_params` in your values-secret.yaml file.

![ansible-edge-gitops-vmconsole](/images/ansible-edge-gitops/aeg-openshift-vm-console.png "Ansible Edge GitOps VM Console")

Please see [Installation Details](/ansible-edge-gitops/installation-details/) for more information on the steps of installation.

Please see [Ansible Automation Platform](/ansible-edge-gitops/ansible-automation-platform/) for more information on how this pattern uses the Ansible Automation Platform Operator for OpenShift.

Please see [OpenShift Virtualization](/ansible-edge-gitops/openshift-virtualization/) for more information on how this pattern uses OpenShift Virtualization.

# Infrastructure Elements of this Pattern

## [Ansible Automation Platform](https://www.redhat.com/en/technologies/management/ansible)

A fully functional installation of the Ansible Automation Platform operator is installed on your OpenShift cluster to configure and maintain the VMs for this demo. AAP maintains a dynamic inventory of kiosk machines and can configure a VM from template to fully functional kiosk in about 10 minutes.

## OpenShift [Virtualization](https://docs.openshift.com/container-platform/4.10/virt/about-virt.html)

OpenShift Virtualization is a Kubernetes-native way to run virtual machine workloads. It is used in this pattern to host VMs simulating an Edge environment; the chart that configures the VMs is designed to be flexible to allow easy customization to model different VM sizes, mixes, versions and profiles for future pattern development.

## Inductive Automation [Ignition](https://inductiveautomation.com/)

The goal of this pattern is to configure 2 VMs running Firefox in Kiosk mode displaying the demo version of the Ignition application running in a podman container. Ignition is a popular tool in use with Oil and Gas companies; it is included as a real-world example and as an item to spark imagination about what other applications could be installed and managed this way.

The container used for this pattern is the container [image](https://hub.docker.com/r/inductiveautomation/ignition) published by Inductive Automation.

## HashiCorp [Vault](https://www.vaultproject.io/)

Vault is used as the authoritative source for the Kiosk ssh pubkey via the External Secrets Operator.
As part of this pattern HashiCorp Vault has been installed. Refer to the section on [Vault](https://validatedpatterns.io/secrets/vault/).

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns/ansible-edge-gitops/issues)
