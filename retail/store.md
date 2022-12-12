---
layout: default
title: Store Sites
grand_parent: Patterns
parent: Retail
nav_order: 2
---

# Having a store (edge) cluster join the datacenter (hub)

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Allow ACM to deploy the store application to a subset of clusters

A store ("ATLANTA") is installed on the hub cluster by default. This feature is interesting if you want to see how ACM can manage a remote cluster to install the same application on a different cluster.

The way we apply this is through the managedClusterGroups block in `values-hub.yaml`:

```json
  managedClusterGroups:
  - name: store
    clusterSelector:
      matchLabels:
        clusterGroup: raleigh
      matchExpressions:
      - key: vendor
        operator: In
        values:
          - OpenShift
```

Any cluster joined with the label `clusterGroup=raleigh` will be assigned the policies that deploy the store app to them.

## Deploy a store cluster

Rather than provide instructions on creating a store cluster it is assumed
that an OpenShift cluster has already been created. Use the `openshift-install` program provided at [cloud.redhat.com](https://console.redhat.com/openshift/create "Create an OpenShift cluster")

There are a three ways to join the store to the datacenter.

* Using the ACM user interface
* Using the `cm` tool
* Using the `clusteradm` tool

## Store setup using the ACM UI

After ACM is installed a message regarding a "Web console update is available" may be displayed.
Click on the "Refresh web console" link.

![update-web-console](/images/web-console-update-message.png "Update web console")

On the upper-left side you'll see a pull down labeled "local-cluster". Select "All Clusters" from this pull down.
This will navigate to the ACM console and to its "Clusters" section

![launch-acm-console](/images/local-all-cluster-pulldown.png "Launch ACM console")

Select the "Import cluster" option beside the highlighted Create Cluster button.

![import-cluster](/images/import-cluster.png "Select Import cluster")

On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `site=store` Press import. Done.

![import-with-kubeconfig](/images/import-with-kubeconfig.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Store is joined](#store-is-joined) but ignore the part about adding the site tag.

## Store setup using `cm` tool

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the edge/store cluster.

1. On the command-line login into the hub/datacenter cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:

```sh
cm attach cluster --cluster <cluster-name> --cluster-kubeconfig <path-to-KUBECONFIG>
```

Skip to the section [Store is joined](#store-is-joined)

## Store setup using `clusteradm` tool

You can also use `clusteradm` to join a cluster. The following instructions explain what needs to be done. `clusteradm` is still in testing.

1. To deploy a edge cluster you will need to get the datacenter (or hub) cluster's token. You will need to install `clusteradm`.  On the existing *datacenter cluster*:

   `clusteradm get token`

1. When you run the `clusteradm` command above it replies with the token and also shows you the command to use on the store. So first you must login to the store cluster

   `oc login`
   or

   `export KUBECONFIG=~/my-ocp-env/store`

1. Then request to that the store join the datacenter hub

   `clusteradm join --hub-token <token from clusteradm get token command > <store cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <store-cluster-name>`

Skip to the next section, [Store is joined](#store-is-joined)

## Store is joined

### You're done

That's it! Go to your store (edge) OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.
