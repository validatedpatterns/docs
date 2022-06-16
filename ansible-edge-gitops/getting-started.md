---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Ansible Edge GitOps
nav_order: 1
---

# Deploying the Ansible Edge GitOps Pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). See also [sizing your cluster](../cluster-sizing). Currently this pattern only supports AWS. It could also run on a baremetal OpenShift cluster, because OpenShift Virtualization supports that; there would need to be some customizations made to support it as the default is AWS. We hope that GCP and Azure will support provisioning metal workers in due course so this can be a more clearly multicloud pattern.
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)
1. Ansible, which is used in the bootstrap and provisioning phases of the pattern install (and to configure Ansible Automation Platform).
1. Please note that when run on AWS, this pattern will provision an additional worker node, which will be a metal instance (c5n.metal) to run the Edge Virtual Machines. This worker is provisioned through the OpenShift MachineAPI and will be automatically cleaned up when the cluster is destroyed.

The use of this pattern depends on having a running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

In addition to the openshift cluster, you will need to prepare a number of secrets, or credentials, which will be used
in the pattern in various ways:

1. An SSH Keypair (private key and public key).  These will be used to provide access to the Kiosk VMs in the demo.
1. A Red Hat Subscription Management username and password. These will be used to register Kiosk VM templates to the Red Hat Content Delivery Network and install content on the Kiosk VMs to run the demo.
1. Container "extra" arguments which will set the admin password for the ignition application when it's running.
1. A manifest file with an entitlement to run Ansible Automation Platform. This file (which will be a .zip file) will be posted to to Ansible Automation Platform instance to enable its use.  Instructions for creating a manifest file can be found [here](https://www.redhat.com/en/blog/how-create-and-use-red-hat-satellite-manifest)

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# How to deploy

1. Fork the [ansible-edge-gitops](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops) repo on GitHub.  It is necessary to fork to preserve customizations you make to the default configuration files.

1. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/ansible-edge-gitops.git
    ```

1. Create a local copy of the Helm values file that can safely include credentials

    DO NOT COMMIT THIS FILE

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

1. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

1. Preview the changes

    ```sh
    make show
    ```

1. Login to your cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubconfig
    ```

1. Apply the changes to your cluster

    ```sh
    make install
    ```

1. Check the operators have been installed

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

![ansible-edge-gitops-operators](/images/ansible-edge-gitops/aeg-operators.png "Ansible Edge GitOps Operators")

1. Check all applications are synchronised
    Under the project `ansible-edge-gitops-hub` click on the URL for the `hub`gitops`server`. All applications will sync, but this takes time as ODF has to completely install, and OpenShift Virtualization cannot provision VMs until the metal node has been fully provisioned and ready.

![ansible-edge-gitops-applications](/images/ansible-edge-gitops/aeg-applications.png "Ansible Edge GitOps Operators")

1. The VM Consoles will show the Ignition application running:

![ansible-edge-gitops-vmlist](/images/ansible-edge-gitops/aeg-openshift-vm-screen.png "Ansible Edge GitOps VM List")

![ansible-edge-gitops-vmconsole](/images/ansible-edge-gitops/aeg-openshift-vm-console.png "Ansible Edge GitOps VM Console")

You should be able to login to the application with the userid "admin" and the password you specified as the GATEWAY_ADMIN_PASSWORD in `container_extra_params` in your values-secret.yaml file.

Please see [Installation Details](/ansible-edge-gitops/installation-details/) for more information on the steps of installation.

Please see [Ansible Automation Platform](/ansible-edge-gitops/ansible-automation-platform/) for more information on how this pattern uses the Ansible Automation Platform Operator for OpenShift.

Please see [OpenShift Virtualization](/ansible-edge-gitops/openshift-virtualization/) for more information on how this pattern uses OpenShift Virtualization.

## GitOps application demos

# Vault

Vault is used as the authoritative source for the Kiosk ssh pubkey via the External Secrets Operator.
As part of this pattern HashiCorp Vault has been installed. Refer to the section on [Vault](https://hybrid-cloud-patterns.io/secrets/vault/).

# Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
