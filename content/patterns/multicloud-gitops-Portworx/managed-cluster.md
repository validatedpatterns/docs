---
title: Managed cluster sites
weight: 20
aliases: /multicloud-gitops/managed-cluster/
---

# Attach a managed cluster (edge) to the management hub

## Understanding Red Hat Advanced Cluster Management requirements

Allow Red Hat Advanced Cluster Management (RHACM) to deploy the managed cluster application to a subset of clusters.

By default the `clusterGroup` applications are deployed on all clusters that RHACM manages. In the  `value-hub.yaml`, file add a `managedClusterCgroup` for each cluster or group of clusters that you want to manage as one.

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

The above YAML file segment deploys the `clusterGroup` applications on managed clusters with the label
`clusterGroup=region-one`. Specific subscriptions and Operators, applications and projects for that `clusterGroup` are then managed in a `value-region-one.yaml` file. For example:

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

**Important:**
Ensure that you commit the changes and push them to GitHub so that GitOps can fetch your changes and apply them.

## Deploying a managed cluster

### Prerequisites

* An OpenShift cluster
  * To create an OpenShift cluster, go to the [Red Hat Hybrid Cloud console](https://console.redhat.com/).
  * Select **Services -> Containers -> Create cluster**.

To join the managed cluster to the management hub, you can:

* Use the Red Hat Advanced Cluster Management (RHACM) web console
* Use the `cm` tool
* Use the `clusteradm` tool

## Using Red Hat Advanced Cluster Management web console to set up managed cluster

After RHACM is installed, a message regarding a "Web console update is available" might be displayed.
Click the "Refresh web console" link.

1. In the left navigation panel of web console, click  **local-cluster**. Select **All Clusters**. The RHACM web console is displayed with **Cluster*** on the left navigation panel.

2. On the **Managed clusters** tab, click **Import cluster**.

![import-cluster](/images/import-cluster.png "Select Import cluster")

3. On the **Import an existing cluster** page, enter the cluster name and choose **Kubeconfig** as the "import mode". Add the tag `clusterGroup=region-one`. Click **Import**.

![import-with-kubeconfig](/images/import-with-kubeconfig.png "Import using kubeconfig")

You can now skip to the section [Managed cluster is joined](#managed-cluster-is-joined) but ignore the part about adding the site tag.

## Using the `cm` tool to set up a managed cluster

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the managed-cluster cluster.

1. On the command-line login into the management hub cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:

   ```sh
   cm attach cluster --cluster <cluster-name>  --cluster-kubeconfig <path-to-KUBECONFIG>
   ```

Skip to the section [Managed cluster is joined](#managed-cluster-is-joined)

## Using the `clusteradm` tool to set up a managed cluster

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

   `oc get managedcluster.cluster.open-cluster-management.io`

1. Apply the label

   `oc label managedcluster.cluster.open-cluster-management.io/YOURCLUSTER site=managed-cluster`

### Verification

Go to your managed cluster (edge) OpenShift console and check for the `open-cluster-management-agent` pod being launched. Be patient, it will take a while for the RHACM agent and `agent-addons` to launch. After that, the OpenShift GitOps Operator is installed. On successful installation, launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.
