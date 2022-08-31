---
layout: default
title: Managed Cluster Sites
grand_parent: Patterns
parent: Multicloud GitOps
nav_order: 2
---

# Having a managed cluster (edge) join the management hub

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Allow ACM to deploy the managed cluster application to a subset of clusters

By default the `clusterGroup` applications are deployed on all clusters that ACM knows about. In your `value-hub.yaml` file add a `managedClusterCgroup` for each cluster or group of clusters that you want to manage as one.

```yaml
  managedClusterGroups:
  - name: region-one
    helmOverrides:
    - name: clusterGroup.isHubCluster
      value: false
    clusterSelector:
      matchLabels:
        clusterGroup: region-one
```

The above yaml segment will deploy the `clusterGroup` applications on managed clusters with the label
`clusterGroup=region-one`.  Specific subscriptions and Operators, applications and projects for that `clusterGroup` are then managed in a `value-region-one.yaml` file. E.g.

```yaml
  namespaces:
    - config-demo

  projects:
    - config-demo

  applications:
    config-demo:
      name: config-demo
      namespace: config-demo
      project: config-demo
      path: charts/all/config-demo

  #Subscriptions can be added too - multicloud-gitops at present does not require subscriptions on its managed clusters
  #subscriptions:
  #  example-subscription:
  #    name: example-operator
  #    namespace: example-namespace
  #    channel: example-channel
  #    csv: example-operator.v1.0.0

  subscriptions:

```

Remember to commit the changes and push to GitHub so that GitOps can see
your changes and apply them.

## Deploy a managed cluster

Rather than provide instructions on creating a managed cluster it is assumed
that an OpenShift cluster has already been created. Use the `openshift-install` program provided at [cloud.redhat.com](https://console.redhat.com/openshift/create "Create an OpenShift cluster")

There are a three ways to join the managed cluster to the management hub.

* Using the ACM user interface
* Using the `cm` tool
* Using the `clusteradm` tool

## Managed cluster setup using the ACM UI

After ACM is installed a message regarding a "Web console update is available" may be displayed.
Click on the "Refresh web console" link.

![update-web-console](/images/web-console-update-message.png "Update web console")

On the upper-left side you'll see a pull down labeled "local-cluster". Select "All Clusters" from this pull down.
This will navigate to the ACM console and to its "Clusters" section

![launch-acm-console](/images/local-all-cluster-pulldown.png "Launch ACM console")

Select the "Import cluster" option beside the highlighted Create Cluster button.

![import-cluster](/images/import-cluster.png "Select Import cluster")

On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `clusterGroup=region-one`. Press import. Done.

![import-with-kubeconfig](/images/import-with-kubeconfig.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Managed cluster is joined](#managed-cluster-is-joined) but ignore the part about adding the site tag.

## Managed cluster setup using `cm` tool

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the managed-cluster cluster.

1. On the command-line login into the management hub cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:

```sh
cm attach cluster --cluster <cluster-name> --cluster-kubeconfig <path-to-KUBECONFIG>
```

Skip to the section [Managed cluster is joined](#managed-cluster-is-joined)

## Managed cluster setup using `clusteradm` tool

You can also use `clusteradm` to join a cluster. The following instructions explain what needs to be done. `clusteradm` is still in testing.

1. To deploy a edge cluster you will need to get the management hub cluster's token. You will need to install `clusteradm`.  On the existing *management hub cluster*:

   `clusteradm get token`

1. When you run the `clusteradm` command above it replies with the token and also shows you the command to use on the managed cluster. So first you must login to the managed cluster

   `oc login`
   or

   `export KUBECONFIG=~/my-ocp-env/managed-cluster`

1. Then request to that the managed cluster join the management hub

   `clusteradm join --hub-token <token from clusteradm get token command > <managed cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <managed-cluster-name>`

Skip to the section [Managed cluster is joined](#managed-cluster-is-joined)

## Managed cluster is joined

### Designate the new cluster as a managed cluster site

Now that ACM is no longer deploying the managed cluster applications everywhere, we need
to explicitly indicate that the new cluster has the managed cluster role. **If you haven't tagged the cluster** as `clusterGroup=region-one` then we can that here.

We do this by adding the label referenced in the managedSite's `clusterSelector`.

1. Find the new cluster

   `oc get region-one.cluster.open-cluster-management.io`

1. Apply the label

   `oc label region-one.cluster.open-cluster-management.io/YOURCLUSTER site=managed-cluster`

### You're done

That's it! Go to your managed cluster (edge) OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.
