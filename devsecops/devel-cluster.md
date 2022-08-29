---
layout: default
title: Secured Development Cluster
grand_parent: Patterns
parent: Secure Supply Chain
nav_order: 2
---

# Having a development cluster (devel) join the hub

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Introduction

Development clusters are responsible for building applications and delivering the applications to a secured registry. The development cluster defines a secure pipeline that includes code and image scans and image signing before delivering them to the registry. OpenShift Pipelines is used for the continuous integration (CI). The Quay registry is deployed on the hub and therefore integration is required for the development pipeline to push images to the registry.

Development clusters also need to be secured and so one part of the deployment is Advanced Cluster Security with a secured configuration. This allows ACS to monitor and report on security issues on the cluster. ACS secured sites report to an ACS Central application that is deployed on the hub.

## Allow ACM to deploy the devel applications to a subset of clusters

By default the `devel` applications are deployed on any development clusters that ACM knows about.

```json
  managedClusterGroups:
  - name: devel
    helmOverrides:
    - name: clusterGroup.isHubCluster
      value: "false"
    clusterSelector:
      matchLabels:
        clusterGroup: devel
      matchExpressions:
      - key: vendor
        operator: In
        values:
          - OpenShift
```

Remember to commit the changes and push to GitHub so that GitOps can see
your changes and apply them.

## Deploy a devel cluster

Rather than provide instructions on creating a devel cluster it is assumed
that an OpenShift cluster has already been created. Use the `openshift-install` program provided at [cloud.redhat.com](https://console.redhat.com/openshift/create "Create an OpenShift cluster")

There are a three ways to join the devel cluster to the hub.

* Using the ACM user interface
* Using the `cm` tool
* Using the `clusteradm` tool

## Devel setup using the ACM UI

After ACM is installed a message regarding a "Web console update is available" may be displayed.
Click on the "Refresh web console" link.

![update-web-console](/images/web-console-update-message.png "Update web console")

On the upper-left side you'll see a pull down labeled "local-cluster". Select "All Clusters" from this pull down.
This will navigate to the ACM console and to its "Clusters" section

![launch-acm-console](/images/local-all-cluster-pulldown.png "Launch ACM console")

Select the "Import cluster" option beside the highlighted Create Cluster button.

![import-cluster](/images/import-cluster.png "Select Import cluster")

On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `clusterGroup=devel` Press import. Done.

![import-with-kubeconfig](/images/devsecops/import-devel-cluster.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Devel is joined](#devel-is-joined) but ignore the part about adding the site tag.

## Devel setup using `cm` tool

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the devel cluster.

1. On the command-line login into the hub/datacenter cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:

```sh
cm attach cluster --cluster <cluster-name> --cluster-kubeconfig <path-to-KUBECONFIG>
```

Skip to the section [Devel is joined](#devel-is-joined)

## Devel setup using `clusteradm` tool

You can also use `clusteradm` to join a cluster. The following instructions explain what needs to be done. `clusteradm` is still in testing.

1. To deploy a edge cluster you will need to get the datacenter (or hub) cluster's token. You will need to install `clusteradm`.  On the existing *datacenter cluster*:

   `clusteradm get token`

1. When you run the `clusteradm` command above it replies with the token and also shows you the command to use on the devel. So first you must login to the devel cluster

   `oc login`
   or

   `export KUBECONFIG=~/my-ocp-env/devel`

1. Then request to that the devel join the datacenter hub

   `clusteradm join --hub-token <token from clusteradm get token command > <devel cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <devel-cluster-name>`

Skip to the next section, [Devel is joined](#devel-is-joined)

## Devel is joined

### Designate the new cluster as a devel site

Now that ACM is no longer deploying the devel applications everywhere, we need
to explicitly indicate that the new cluster has the devel role. If you haven't tagged the cluster as `clusterGroup=devel` then we can do that here.

We do this by adding the label referenced in the managedSite's `clusterSelector`.

1. Find the new cluster

   `oc get managedclusters.cluster.open-cluster-management.io`

1. Apply the label

   `oc label managedclusters.cluster.open-cluster-management.io/YOURCLUSTER clusterGroup=devel`

### You're done

That's it! Go to your devel (edge) OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished check that all applications have synced in OpenShift GitOps. Select "Devel Argo CD" from the OpenShift Applications menu.

[![GitOps Devel app](/images/devsecops/ocp-devel-argocd-menu.png)](/images/devsecops/ocp-devel-argocd-menu.png)

Then look at the GitOps applications and make sure they have synced completely.

[![GitOps Dashboard Devel](/images/devsecops/gitops-devel-cluster.png)](/images/devsecops/gitops-devel-cluster.png)

## Confirming successful deployment

There are a number of steps you can do to check that the components have deployed:

1. Pipelines should be available in the console on the left hand side.

1. Run a pipeline and check the build and if the image gets updated in the Quay registry on the Hub.

1. You should be able to select the route to the demo application in the test environment.

1. The development cluster name should show up in the ACS Central console.

[![acs-central-with-devel](/images/devsecops/acs-dashboard-2node.png)](/images/devsecops/acs-dashboard-2node.png)

## Next up

Deploy the the Multicluster DevSecOps [secured production cluster](/devsecops/production-cluster)
