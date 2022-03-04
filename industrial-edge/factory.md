---
layout: default
title: Factory Sites
grand_parent: Patterns
parent: Industrial Edge
nav_order: 2
---

# Having a factory (edge) cluster join the datacenter (hub)
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Allow ACM to deploy the factory application to a subset of clusters

By default the `factory` applications are deployed on all clusters that ACM knows about.

```json
  managedSites:
  - name: factory
    clusterSelector:
      matchExpressions:
      - key: vendor
        operator: In
        values:
          - OpenShift
```

This is useful for cost-effective demos, but is hardly realistic.

To deploy the `factory` applications only on managed clusters with the label
`site=factory`, change the site definition in `values-datacenter.yaml` to:

```json
  managedSites:
  - name: factory
    clusterSelector:
      matchLabels:
        site: factory
```

Remember to commit the changes and push to GitHub so that GitOps can see
your changes and apply them.

## Deploy a factory cluster

Rather than provide instructions on creating a factory cluster it is assumed
that an OpenShift cluster has already been created. Use the `openshift-install` program provided at [cloud.redhat.com](https://console.redhat.com/openshift/create "Create an OpenShift cluster")

There are a three ways to join the factory to the datacenter.

* Using the ACM user interface
* Using the `cm` tool
* Using the `clusteradm` tool

## Factory setup using the ACM UI

1. From the datacenter openshift console select ACM from the top right

![](/images/launch-acm-console.png "Launch ACM console")

2. Select the "Import cluster" option beside the highlighted Create Cluster button.

![](/images/import-cluster.png "Select Import cluster")

3. On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `site=factory` Press import. Done.

![](/images/import-with-kubeconfig.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Factory is joined](#factory-is-joined) but ignore the part about adding the site tag.

## Factory setup using `cm` tool

1. Install the `cm` (cluster management) CLI tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the edge/factory cluster.

1. On the command line login into the hub/datacenter cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:
```sh
cm attach cluster --cluster <cluster-name> --cluster-kubeconfig <path-to-KUBECONFIG>
```

Skip to the section [Factory is joined](#factory-is-joined)

## Factory setup using `clusteradm` tool

You can also use `clusteradm` to join a cluster. The following instructions explain what needs to be done. `clusteradm` is still in testing.

1. To deploy a edge cluster you will need to get the datacenter (or hub) cluster's token. You will need to install `clusteradm`.  On the existing *datacenter cluster*:

   `clusteradm get token`

1. When you run the `clusteradm` command above it replies with the token and also shows you the command to use on the factory. So first you must login to the factory cluster

   `oc login`
   or

   `export KUBECONFIG=~/my-ocp-env/factory`

1. Then request to that the factory join the datacenter hub

   `clusteradm join --hub-token <token from clusteradm get token command > <factory cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <factory-cluster-name>`

Skip to the next section, [Factory is joined](#factory-is-joined)

## Factory is joined

### Designate the new cluster as a factory site

Now that ACM is no longer deploying the factory applications everywhere, we need
to explicitly indicate that the new cluster has the factory role. If you haven't tagged the cluster as `site=managed-cluster` then we can that here.

We do this by adding the label referenced in the managedSite's `clusterSelector`.

1. Find the new cluster

   `oc get managedclusters.cluster.open-cluster-management.io`

1. Apply the label

   `oc label managedclusters.cluster.open-cluster-management.io/YOURCLUSTER site=factory`

### You're done
That's it! Go to your factory (edge) OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.

## Next up

Work your way through the Industrial Edge 2.0 [GitOps/DevOps demos](application)
