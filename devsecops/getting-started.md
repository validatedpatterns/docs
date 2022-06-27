---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Secure Supply Chain
nav_order: 1
---

# Deploying the Multicluster DevSecOps Pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to [the OpenShift console](https://console.redhat.com/openshift/create)). See also [sizing your cluster](../../multicloud-gitops/cluster-sizing).
1. A second OpenShift cluster for production (optional but desirable)
1. A third OpenShift cluster for secure CI pipelines (optional but desirable)
1. A GitHub account (and a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)

If you do not have running Red Hat OpenShift clusters you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# Credentials Required in Pattern

In addition to the openshift cluster, you will need to prepare a number of secrets, or credentials, which will be used
in the pattern in various ways. To do this, copy the [values-secret.yaml template](https://github.com/hybrid-cloud-patterns/multicluster-devsecops/blob/main/values-secret.yaml.template) to your home directory as `values-secret.yaml` and replace the explanatory text as follows:

* Your git repository username and password. The password must be base64 encoded.

```yaml
---
secrets:
  # NEVER COMMIT THESE VALUES TO GIT
  git:
    # Go to: https://github.com/settings/tokens
    # Then: echo -n 'your string value' | base64
    username: USERNAME
    password: 'encoded password in single quotes'
```

* You application secret.  TBD This may change when the application is changed.

```yaml
---
secrets:
  # NEVER COMMIT THESE VALUES TO GIT
  config-demo:
    # Secret used for demonstrating vault storage, external secrets, and ACM distribution
    secret: PLAINTEXT
```

# How to deploy

1. Install the installation tooling dependencies.  You will need:

    * `make` - the well-known software build tool
    * `sh` - a POSIX-compatible shell
    * `sed` - the "stream editor", commonly used in shell scripting
    * `oc` - the OpenShift client
    * `jq` - The swiss army knife for JSON
    * `git` - The well known version control utility
    * `ansible` - The well-known automation tool
    * The `kubernetes.core` collection for ansible

1. Fork the [Multi-Cluster DevSecOps](https://github.com/hybrid-cloud-patterns/multicluster-devsecops) repository on GitHub.  It is necessary to fork because your fork will be updated as part of the GitOps and DevSecOps processes.

1. Clone the forked copy of the `multicluster-devsecops` repository. Use branch `v1.0`.

   ```sh
   git clone git@github.com:{your-username}/multicluster-devsecops.git
   cd multicluster-devsecops
   git checkout v1.0
   ```

1. You could create your own branch where your specific values will be pushed to:

   ```sh
   git checkout -b my-branch
   ```

1. A `values-secret.yaml` file is used to automate setup of secrets needed for:

   * A Git repository (E.g. Github, GitLab etc.)
   * Any application secrets that are needed.

   DO NOT COMMIT THIS FILE. You do not want to push personal credentials to GitHub. Instead copy the template file `values-secret.yaml.template` to your home directory.

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

1. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

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
   export KUBECONFIG=~/my-ocp-env/hub
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

1. Navigate to the OpenShift GitOps instances using the links on the top right hand side of the screen.

   The most important ArgoCD instance to examine at this point is `hub-gitops-server`. This is where all the applications for the hub (datacenter), including the test environment, can be tracked.

1. Apply the secrets from the `values-secret.yaml` to the secrets management Vault. This can be done through Vault's UI - manually without the file. The required secrets and scopes are:

   * **secret/hub/git** git *username* & *password* (GitHub token)
   * **secret/hub/imageregistry** Quay or DockerHub *username* & *password*
   * **secret/hub/aws** - base64 encoded value (see below)

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

1. Check all applications are synchronized in OpenShift GitOps

   [![Multicluster DevSecOps GitOps overview](/images/devsecops/gitops-hub-cluster.png)](/images/devsecops/gitops-hub-cluster.png)

## Check the ACM policy deployment

1. After ACM is installed a message regarding a "Web console update is available" may be displayed.
Click on the "Refresh web console" link.

   ![update-web-console](/images/web-console-update-message.png "Update web console")

1. Navigate to the ACM hub console. On the upper-left side you'll see a pull down labeled "local-cluster". Select "All Clusters" from this pull down.
This will navigate to the ACM console and to its "Clusters" section

   ![launch-acm-console](/images/local-all-cluster-pulldown.png "Launch ACM console")

1. The Governance dashboard shows high level information on Policy set violations and Policy violations.

   ![acm-dashboard](/images/devsecops/acm-governance-dashboard.png "ACM Governance dashboard")

1. Navigate to the Governance page and select the `Policy sets` Governance tab. There are two policy sets deployed, one for the hub and one for managed clusters.

   ![acm-governance](/images/devsecops/acm-governance.png "ACM Governance Policy sets")

1. Explore the Policies tab and select some policies to examine. The image below shows ACM policy status for a three cluster deployment.

   ![acm-policies](/images/devsecops/acm-governance-policies.png "ACM Governance Policies")

## Checking the ACS deployment

1. Select the `stackrox Project` (namespace). Navigate to the OCP Networking->Routes page. Click on the `central` route location URL. It might take a few minutes for this link to be active. When it does it will launch a new tab with the ACS Central login page. 

   [![ACS Central route](/images/devsecops/acs-console-link.png)](/images/devsecops/acs-console-link.png)

1. Return to the OCP console tab and navigate to the Workload->Secrets page. Find the `central-htpasswd` secret and select it.

   [![ACS Central secret](/images/devsecops/acs-secrets.png)](/images/devsecops/acs-secrets.png)

1. On the `central-htpasswd` page, scroll to the Data section and select the copy icon on the right in the `password` field.

   [![ACS Central password](/images/devsecops/acs-central-htpasswd.png)](/images/devsecops/acs-central-htpasswd.png)

1. Return to the ACS Central tab and paste the password into thee password field. Make sure that the Username is `admin`.

   [![ACS Central password](/images/devsecops/acs-login-screen.png)](/images/devsecops/acs-login-screen.png)

1. This will bring you to the ACS Central dashboard page. At first it may not show any clusters showing but as the ACS secured deployment on the hub syncs with ACS central on the hub then information will start to show.  

   [![ACS Central dashboard](/images/devsecops/acs-dashboard.png)](/images/devsecops/acs-dashboard.png)

Return to this dashboard later after deploying the development and production clusters so you can see their information in this dashboard. All clusters in this pattern are ACS secured and therefore ought to show up in this dashboard when those clusters join the hub and are fully deployed.

## Check the Quay deployment

1. Select the `quay-enterprise` project (namespace). Navigate to the OCP Networking->Routes page. Click on the `quay-registry-quay` route location URL (standard Quay naming apparently). It might take a few minutes for this link to be active. When it does it will launch a new tab with the Quay login page.

   [![Quay route](/images/devsecops/quay-enterprise-routes.png)](/images/devsecops/quay-enterprise-routes.png)

1. An initial `quayadmin` account has already been created for you as part of the deployment. The password is `quayadmin123`. If you want to change initial admin user name and password you can do so by editing the `charts/hub/quay/values.yaml` or by adding those entries to the `values-global.yaml` file. Log in using the username and password. 

1. After logging in, the private Quay registry dashboard will be displayed.

   [![Quay dashboard](/images/devsecops/quay-dashboard.png)](/images/devsecops/quay-dashboard.png)

# Next Steps

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/multicluster-devsecops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }

Once the hub has been setup correctly and confirmed to be working, you can:

1. Add a dedicated development cluster to [deploy the CI pipelines using ACM](/devsecops/devel-cluster)
1. Add a dedicated production cluster to [deploy production using ACM](/devsecops/production-cluster)
1. Once the hub, production and devel clusters have been deployed you will want to check out and test the Multi-Cluster DevSecOps demo code. You can find that here TBD

   a. Making [configuration changes](https://hybrid-cloud-patterns.io/devsecops/) with GitOps TBD
   a. Making [application changes](https://hybrid-cloud-patterns.io/devsecops/) using DevOps TBD

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

   `tbd` should be the only remaining application

1. Complete the uninstall

   `helm delete tbd`

1. Check all namespaces and operators have been removed
