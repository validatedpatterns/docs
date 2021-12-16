---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Multicloud GitOps
nav_order: 3
---

# Demonstrating Industrial Edge example applications  
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to https://console.redhat.com/openshift/create )
1. (Optional) A second OpenShift cluster for mulitcloud demonstration or testing
1. A github account (and a token for it with repos permissions, to read from and write to your forks)
1. The helm binary, see https://helm.sh/docs/intro/install/

The use of this blueprint depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the GitOps 
management hub assets and a seperate cluster(s) for the managed cluster(s).

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# How to deploy

1. Fork this repo on GitHub. It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Clone the forked copy of this repo.

   ```sh
   git clone --recurse-submodules git@github.com:your-username/industrial-edge.git
   ```

1. (TBD UPDATE WITH VAULT OR CONJUR INFO) Create a local copy of the Helm values file that can safely include credentials

  DO NOT COMMIT THIS FILE

  You do not want to push personal credentials to GitHub.
   ```sh
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```

1. Customize the deployment for your cluster

   ```sh
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push
   ```

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

   ```
   UI -> Installed Operators
   ```

1. Obtain the ArgoCD urls and passwords

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

   ```sh
   NAME                       HOST/PORT                                                                                         PATH      SERVICES                   PORT    TERMINATION            WILDCARD
   hub-gitops-server          hub-gitops-server-industrial-edge-hub.apps.mycluster.mydomain.com          hub-gitops-server   https   passthrough/Redirect   None
   # admin.password
   2F6kgITU3DsparWyC

   NAME                    HOST/PORT                                                                                   PATH   SERVICES                PORT    TERMINATION            WILDCARD
   region-one-gitops-server      region-one-gitops-server-industrial-edge-region-one.apps.mycluster.mydomain.com          region-one-gitops-server   https   passthrough/Redirect   None
   # admin.password
   K4ctDIm3fH7ldhs8p

   NAME                      HOST/PORT                                                                              PATH   SERVICES                  PORT    TERMINATION            WILDCARD
   cluster                   cluster-openshift-gitops.apps.mycluster.mydomain.com                          cluster                   8080    reencrypt/Allow        None
   kam                       kam-openshift-gitops.apps.mycluster.mydomain.com                              kam                       8443    passthrough/None       None
   openshift-gitops-server   openshift-gitops-server-openshift-gitops.apps.mycluster.mydomain.com          openshift-gitops-server   https   passthrough/Redirect   None
   # admin.password
   WNklRCD8EFg2zK034
   ```

   The most important ArgoCD instance to examine at this point is `multicloud-gitops-hub`. This is where all the applications for the hub can be tracked.


1. Check all applications are synchronised

# Deploying the managed cluster applications

Once the management hub has been setup correctly and confirmed to be working, it is time to attach one or more managed clusters to the architecture (see diagrams below).

For instructions on deploying the edge please read the following [document](http://hybrid-cloud-patterns.io/industrial-edge/managed-cluster/).

# Pattern Layout and Structure


# Uninstalling

**Probably wont work**


# More reading

## General Hybrid Cloud Patterns reading

For more general patterns documentation please refer to the hybrid cloud patterns docs [here](http://hybrid-cloud-patterns.io/).

## Multicloud GitOps application demos

# Diagrams

The following diagrams show the different components deployed on the management hub and the managed cluster (edge).

## Logical

![Logical](docs/images/)

## Schematic with Networks

## Schematic with Dataflows

## Editing the diagrams.

To edit the diagrams in Draw.io you can load them [here](https://redhatdemocentral.gitlab.io/portfolio-architecture-tooling/index.html?#/portfolio-architecture-examples/projects/spi-multi-cloud-gitops.drawio) and save a local copy
