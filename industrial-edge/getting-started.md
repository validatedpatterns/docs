---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Industrial Edge
nav_order: 1
---

# Deploying the Industrial Edge Pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). See also [sizing your cluster](../cluster-sizing).
1. (Optional) A second OpenShift cluster for edge/factory
1. A GitHub account (and a token for it with repositories permissions, to read from and write to your forks)
1. A quay account with the following repositories set as public:

    - http-ionic
    - httpd-ionic
    - iot-anomaly-detection
    - iot-consumer
    - iot-frontend
    - iot-software-sensor

1. The helm binary, see [here](https://helm.sh/docs/intro/install/)

The use of this blueprint depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the data
center assets and a separate cluster(s) for the factory assets.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# How to deploy

1. Install the installation tooling dependencies.  You will need:

<<<<<<< HEAD
1. Clone the forked copy of the `industrial-edge` repo. Use branch `v2.1.1`. 
=======
    - `make` - the well-known software build tool
    - `sh` - a POSIX-compatible shell
    - `sed` - the "stream editor", commonly used in shell scripting
    - `oc` - the OpenShift client
    - `jq` - The swiss army knife for JSON
    - `git` - The well known version control utility
    - `ansible` - The well-known automation tool
    - The `kubernetes.core` collection for ansible

1. Fork the [industrial-edge](https://github.com/hybrid-cloud-patterns/industrial-edge) repository on GitHub.  It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.
1. Fork the [manuela-dev](https://github.com/hybrid-cloud-patterns/manuela-dev) repository on GitHub.  It is necessary to fork this repository because the GitOps framework will push tags to this repository that match the versions of software that it will deploy.

1. Clone the forked copy of the `industrial-edge` repository. Use branch `v2.1.1`.

   ```sh
   git clone git@github.com:{your-username}/industrial-edge.git
   cd industrial-edge
   git checkout v2.1.1
   ```
1. You could create your own branch where you specific values will be pushed to:
   ```sh
   git checkout -b my-branch
   ``` 
1. There are a number of common  components used in validated patterns. These are kept in a common sub-directory. In order to use them we need to use the subtree feature of git.

   ```
   scripts/make_common_subtree.sh  
   ```

1. A `values-secret.yaml` file is used to automate setup of secrets needed for:

   - A Git repository (E.g. Github, GitLab etc.)
   - A container image registry (E.g. Quay)
   - S3 storage (E.g. AWS)

   DO NOT COMMIT THIS FILE. You do not want to push personal credentials to GitHub.

   ```sh
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```

1. Customize the deployment for your cluster. Change the appropriate values in `values-global.yaml`

   ```sh
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

1. You can deploy the pattern using the [validated pattern operator](https://hybrid-cloud-patterns.io/patterns/infrastructure/using-the-validated-pattern-operator.md). If you do use the operator then skip to Validating the Environment below.

1. Preview the changes

   ```sh
   make show
   ```

1. Login to your cluster using oc login or exporting the KUBECONFIG

   ```sh
   oc login
   ```

   or

   ```sh
   export KUBECONFIG=~/my-ocp-env/datacenter
   ```

1. Apply the changes to your cluster

   ```sh
   make install
   ```

# Validating the Environment

1. Check the operators have been installed

   ```text
   UI -> Installed Operators
   ```

1. Obtain the ArgoCD URLs and passwords

   The URLs and login credentials for ArgoCD change depending on the pattern
   name and the site names they control.  Follow the instructions below to find
   them, however you choose to deploy the pattern.

   Display the fully qualified domain names, and matching login credentials, for
   all ArgoCD instances:

   ```sh
   ARGO_CMD=`oc get secrets -A -o jsonpath='{range .items[*]}{"oc get -n "}{.metadata.namespace}{" routes; oc -n "}{.metadata.namespace}{" extract secrets/"}{.metadata.name}{" --to=-\\n"}{end}' | grep gitops-cluster`
   CMD=`echo $ARGO_CMD | sed 's|- oc|-;oc|g'`
   eval $CMD
   ```

   The result should look something like:

   ```text
   NAME                       HOST/PORT                                                                                         PATH      SERVICES                   PORT    TERMINATION            WILDCARD
   datacenter-gitops-server   datacenter-gitops-server-industrial-edge-datacenter.apps.mycluster.mydomain.com          datacenter-gitops-server   https   passthrough/Redirect   None
   # admin.password
   2F6kgITU3DsparWyC

   NAME                    HOST/PORT                                                                                   PATH   SERVICES                PORT    TERMINATION            WILDCARD
   factory-gitops-server   factory-gitops-server-industrial-edge-factory.apps.mycluster.mydomain.com          factory-gitops-server   https   passthrough/Redirect   None
   # admin.password
   K4ctDIm3fH7ldhs8p

   NAME                      HOST/PORT                                                                              PATH   SERVICES                  PORT    TERMINATION            WILDCARD
   cluster                   cluster-openshift-gitops.apps.mycluster.mydomain.com                          cluster                   8080    reencrypt/Allow        None
   kam                       kam-openshift-gitops.apps.mycluster.mydomain.com                              kam                       8443    passthrough/None       None
   openshift-gitops-server   openshift-gitops-server-openshift-gitops.apps.mycluster.mydomain.com          openshift-gitops-server   https   passthrough/Redirect   None
   # admin.password
   WNklRCD8EFg2zK034
   ```

   The most important ArgoCD instance to examine at this point is `data-center-gitops-server`. This is where all the applications for the datacenter, including the test environment, can be tracked.

1. Apply the secrets from the `values-secret.yaml` to the secrets management Vault. This can be done through Vault's UI - manually without the file. The required secrets and scopes are:

   - **secret/hub/git** git *username* & *password* (GitHub token)
   - **secret/hub/imageregistry** Quay or DockerHub *username* & *password*
   - **secret/hub/aws** - base64 encoded value (see below)

   For AWS S3 secret, create a file, say, s3-secrets, with two lines:

   ```text
   s3.accessKey: <accessKey>
   s3.secretKey: <secret key>
   ```

   Then encode this with base64 using

   ```sh
   cat s3-secrets | base64 -w 0
   ```

   Or you can set up the secrets using the command-line by running the following (Ansible) playbook.

   ```sh
   scripts/setup-secrets.yaml
   ```

   Using the Vault UI check that the secrets have been setup.

   For more information on secrets management see [here](/secrets). For information on Hashicorp's Vault see [here](/secrets/vault)

1. Check all applications are synchronised

## Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/industrial-edge/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }

Once the data center has been setup correctly and confirmed to be working, you can:

1. Add a dedicated cluster to [deploy the factory pieces using ACM](/industrial-edge/factory)
2. Once the data center and the factory have been deployed you will want to check out and test the Industrial Edge 2.0 demo code. You can find that [here](../application/)

   a. Making [configuration changes](https://hybrid-cloud-patterns.io/industrial-edge/application/#configuration-changes-with-gitops) with GitOps
   a. Making [application changes](https://hybrid-cloud-patterns.io/industrial-edge/application/#application-changes-using-devops) using DevOps
   a. Making [AI/ML model changes](https://hybrid-cloud-patterns.io/industrial-edge/application/#application-ai-model-changes-with-devops) with DevOps

# Uninstalling

**Probably wont work**

1. Turn off auto-sync

   `helm upgrade manuela . --values ~/values-secret.yaml --set global.options.syncPolicy=Manual`

1. Remove the ArgoCD applications (except for manuela-datacenter)

   a. Browse to ArgoCD
   a. Go to Applications
   a. Click delete
   a. Type the application name to confirm
   a. Chose "Foreground" as the propagation policy
   a. Repeat

1. Wait until the deletions succeed

   `manuela-datacenter` should be the only remaining application

1. Complete the uninstall

   `helm delete manuela`

1. Check all namespaces and operators have been removed
