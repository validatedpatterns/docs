---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Industrial Edge
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
1. (Optional) A second OpenShift cluster for edge/factory
1. A github account (and a token for it with repos permissions, to read from and write to your forks)
1. A quay account with the following repos set as public:
- http-ionic
- httpd-ionic
- iot-anomaly-detection
- iot-consumer
- iot-frontend
- iot-software-sensor
5. The helm binary, see https://helm.sh/docs/intro/install/

The use of this blueprint depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the data
center assets and a seperate cluster(s) for the factory assets.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

# How to deploy

1. Fork the [manuela-dev](https://github.com/hybrid-cloud-patterns/manuela-dev) repo on GitHub.  It is necessary to fork this repo because the GitOps framework will push tags to this repo that match the versions of software that it will deploy.
1. Fork this repo on GitHub. It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Clone the forked copy of this repo.

   ```sh
   git clone --recurse-submodules git@github.com:your-username/industrial-edge.git
   ```

1. Create a local copy of the Helm values file that can safely include credentials

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

   or

   ```sh
   export KUBECONFIG=~/my-ocp-env/datacenter
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


1. Check all applications are synchronised

# Deploying the factory applications

Once the data center has been setup correctly and confirmed to be working, it is time to attach one or more factories to the architecture (see diagrams below).

For instructions on deploying the factory please read the following [document](http://hybrid-cloud-patterns.io/industrial-edge/factory/).

# Pattern Layout and Structure

https://slides.com/beekhof/hybrid-cloud-patterns

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

# More reading

## General Hybrid Cloud Patterns reading

For more general patterns documentation please refer to the hybrid cloud patterns docs [here](http://hybrid-cloud-patterns.io/).

## Industrial Edge application demos

Once the data center and the factory have been deployed you will want to check out and test the Industrial Edge 2.0 demo code. You can find that [here](http://hybrid-cloud-patterns.io/industrial-edge/application/) 

# Diagrams

The following diagrams show the different components deployed on the datacenter and the factory.

## Logical

![Logical](docs/images/manufacturing-logical.png)

## Schematic with Networks

![Schema - Networks](docs/images/manufacturing-schema-netw.png)

## Schematic with Dataflows

![Schema - Dataflow](docs/images/manufacturing-schema-df.png)

## Editing the diagrams.

To edit the diagrams in Draw.io you can load them [here](https://redhatdemocentral.gitlab.io/portfolio-architecture-tooling/index.html?#/portfolio-architecture-examples/projects/Mfg-AI-ML-0928.drawio) and save a local copy
