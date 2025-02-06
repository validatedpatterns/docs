---
title: Getting Started
weight: 10
aliases: /federated-edge-observability/getting-started/
---

# Deploying the Federated Edge Observability Pattern

# General Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). Currently this pattern only supports AWS. It could also run on a baremetal OpenShift cluster, because OpenShift Virtualization supports that; there would need to be some customizations made to support it as the default is AWS. We hope that GCP and Azure will support provisioning metal workers in due course so this can be a more clearly multicloud pattern.
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)
1. Ansible, which is used in the bootstrap and provisioning phases of the pattern install (and to configure Ansible Automation Platform).
1. Please note that when run on AWS, this pattern will provision an additional worker node, which will be a metal instance (c5n.metal) to run the Edge Virtual Machines. This worker is provisioned through the OpenShift MachineAPI and will be automatically cleaned up when the cluster is destroyed.

The use of this pattern depends on having a running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps
management hub assets and a separate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud service](https://console.redhat.com/openshift/create).

# Credentials Required in Pattern

In addition to the openshift cluster, you will need to prepare a number of secrets, or credentials, which will be used
in the pattern in various ways. To do this, copy the [values-secret.yaml template](https://github.com/validatedpatterns-sandbox/federated-edge-observability/blob/main/values-secret.yaml.template) to your home directory as `values-secret.yaml` and replace the explanatory text as follows:

* AWS Credentials (an access key and a secret key). These are used to provision the metal worker in AWS (which hosts
the VMs). If the portworx variant of the pattern is used, these credentials will be used to modify IAM rules to allow
portworx to run correctly.

```yaml
---
# NEVER COMMIT THESE VALUES TO GIT
version: "2.0"
secrets:
```
* A username and  SSH Keypair (private key and public key). These will be used to provide access to the Kiosk VMs in the demo.

```yaml
  - name: vm-ssh
    fields:
    - name: username
      value: 'Username of user to attach privatekey and publickey to - cloud-user is a typical value'

    - name: privatekey
      value: 'Private ssh key of the user who will be able to elevate to root to provision kiosks'

    - name: publickey
      value: 'Public ssh key of the user who will be able to elevate to root to provision kiosks'
```

* A Red Hat Subscription Management username and password. These will be used to register Kiosk VM templates to the Red Hat Content Delivery Network and install content on the VMs and to install the Otel collector.

```yaml
  - name: rhsm
    fields:
    - name: username
      value: 'username of user to register RHEL VMs'
    - name: password
      value: 'password of rhsm user in plaintext'
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

```yaml
- name: automation-hub-token
    fields:
    - name: token
      value: 'An automation hub token for retrieving Certified and Validated Ansible content'
```

* An automation hub token generated at <https://console.redhat.com/ansible/automation-hub/token>. This is needed for
the Ansible Configuration-as-Code tools.

```yaml
  - name: agof-vault-file
    fields:
    - name: agof-vault-file
      path: 'full pathname of a valid agof_vault file for secrets to overlay the iac config'
      base64: true
```

* An (optional) AGOF vault file. For this pattern, use the following (you do not need additional secrets for this
pattern):

```yaml
- name: agof-vault-file
  fields:
    - name: agof-vault-file
      value: '---'
      base64: true
```

```yaml
  - name: otel-cert
    fields:
    - name: tls.key
      path: 'full pathname to a pre-existing tls key'

    - name: tls.crt
      path: 'full pathname to a pre-existing tls certificate'
```

Certificates for the open telemetry collector infrastructure. "Snakeoil" (that is, self-signed) certs will automatically be generated by the makefile as follows by the `make snakeoil-certs` target, which is automatically run by `make install`:

```yaml
- name: otel-cert
  fields:
    - name: tls.key
      path: ~/federated-edge-observability-otel-collector-edge-observability-stack.key

    - name: tls.crt
      path: ~/federated-edge-observability-otel-collector-edge-observability-stack.crt
```

# How to deploy

1. Login to your cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubeconfig
    ```

1. Fork the [federated-edge-observability](https://github.com/validatedpatterns-sandbox/federated-edge-observability) repo on GitHub.  It is necessary to fork to preserve customizations you make to the default configuration files.

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

The installation process will take between 45-60 minutes to complete.

# Installation Validation

* Check the operators have been installed using the OpenShift console

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

![federated-edge-observability-operators](/images/federated-edge-observability/FEO-operators.png "Federated Edge Observability Operators")

* Check all applications are synchronised

Under the project `federated-edge-observability-hub` click on the URL for the `hub`gitops`server`. All applications will sync, but this takes time as ODF has to completely install, and OpenShift Virtualization cannot provision VMs until the metal node has been fully provisioned and ready.

![federated-edge-observability-applications](/images/federated-edge-observability/FEO-applications.png "Federated Edge Observability Applications")

* Under Virtualization > Virtual Machines, the virtual machines will eventually show as "Running." Once they are in "Running" state the Provisioning workflow will run on them, install the OpenTelemetry collector, and start reporting metrics to the Edge Observability Stack in the hub cluster.

![federated-edge-observability-vms](/images/federated-edge-observability/FEO-vms.png "Federated Edge Observability Virtual Machines")

* The Grafana graphs should be receiving data and drawing graphs for each of the nodes:

![federated-edge-observability-grafana](/images/federated-edge-observability/FEO-grafana.png "Federated Edge Observability Graphs")

Please see [Ansible Automation Platform](/federated-edge-observability/ansible-automation-platform/) for more information on how this pattern uses the Ansible Automation Platform Operator for OpenShift.

# Infrastructure Elements of this Pattern

## [Ansible Automation Platform](https://www.redhat.com/en/technologies/management/ansible)

A fully functional installation of the Ansible Automation Platform operator is installed on your OpenShift cluster to configure and maintain the VMs for this demo. AAP maintains a dynamic inventory of kiosk machines and can configure a VM from template to fully functional kiosk in about 10 minutes.

## OpenShift [Virtualization](https://docs.openshift.com/container-platform/4.16/virt/about_virt/about-virt.html)

OpenShift Virtualization is a Kubernetes-native way to run virtual machine workloads. It is used in this pattern to host VMs simulating an Edge environment; the chart that configures the VMs is designed to be flexible to allow easy customization to model different VM sizes, mixes, versions and profiles for future pattern development.

## HashiCorp [Vault](https://www.vaultproject.io/)

Vault is used as the authoritative source for the Kiosk ssh pubkey via the External Secrets Operator.
As part of this pattern HashiCorp Vault has been installed. Refer to the section on [Vault](https://validatedpatterns.io/secrets/vault/).

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns-sandbox/federated-edge-observability/issues)
