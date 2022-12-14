---
title: Secured Production Clusters
weight: 30
aliases: /devsecops/production-cluster/
---

# Having a production cluster join the hub

## Introduction

Production clusters need to be secured and so one part of the deployment is to install the Advanced Cluster Security operator with a secured configuration. This allows ACS central to monitor and report on security issues on the cluster. ACS secured sites report to an ACS Central application that is deployed on the hub.

## Allow ACM to deploy the production application to a subset of secured clusters

By default the production applications are deployed on all `prod` clusters that ACM knows about.

```json
  - name: secured
    helmOverrides:
    - name: clusterGroup.isHubCluster
      value: "false"
    clusterSelector:
      matchLabels:
        clusterGroup: prod
      matchExpressions:
      - key: vendor
        operator: In
        values:
          - OpenShift
```

Remember to commit the changes and push to GitHub so that GitOps can see
your changes and apply them.

## Deploy a production cluster

Rather than provide instructions on creating a production cluster it is assumed
that an OpenShift cluster has already been created. Use the `openshift-install` program provided at [cloud.redhat.com](https://console.redhat.com/openshift/create "Create an OpenShift cluster")

There are a three ways to join the production to the datacenter.

* Using the ACM user interface
* Using the `cm` tool
* Using the `clusteradm` tool

## Production cluster setup using the ACM UI

After ACM is installed a message regarding a "Web console update is available" may be displayed.
Click on the "Refresh web console" link.

![update-web-console](/images/web-console-update-message.png "Update web console")

On the upper-left side you'll see a pull down labeled "local-cluster". Select "All Clusters" from this pull down.
This will navigate to the ACM console and to its "Clusters" section

![launch-acm-console](/images/local-all-cluster-pulldown.png "Launch ACM console")

Select the "Import cluster" option beside the highlighted Create Cluster button.

![import-cluster](/images/import-cluster.png "Select Import cluster")

On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `clusterGroup=prod` Press import. Done.

![import-with-kubeconfig](/images/import-with-kubeconfig.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Production is joined](#production-is-joined) but ignore the part about adding the site tag.

## Production setup using `cm` tool

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the managed production (prod) cluster.

1. On the command-line login into the hub/datacenter cluster (use `oc login` or export the KUBECONFIG).

1. Run the following command:

```sh
cm attach cluster --cluster <cluster-name> --cluster-kubeconfig <path-to-KUBECONFIG>
```

Skip to the section [Production is joined](#production-is-joined)

## Production setup using `clusteradm` tool

You can also use `clusteradm` to join a cluster. The following instructions explain what needs to be done. `clusteradm` is still in testing.

1. To deploy a edge cluster you will need to get the datacenter (or hub) cluster's token. You will need to install `clusteradm`.  On the existing *datacenter cluster*:

   `clusteradm get token`

1. When you run the `clusteradm` command above it replies with the token and also shows you the command to use in production. So first you must login to the production cluster

   `oc login`
   or

   `export KUBECONFIG=~/my-ocp-env/prod`

1. Then request to that the production join the datacenter hub

   `clusteradm join --hub-token <token from clusteradm get token command > <production cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <production-cluster-name>`

Skip to the next section, [Production is joined](#production-is-joined)

## Production is joined

### Designate the new cluster as a production site

Now that ACM is no longer deploying the production applications everywhere, we need
to explicitly indicate that the new cluster has the production role. If you haven't tagged the cluster as `clusterGroup=prod` then we can that here.

We do this by adding the label referenced in the managedSite's `clusterSelector`.

1. Find the new cluster

   `oc get managedclusters.cluster.open-cluster-management.io`

1. Apply the label

   `oc label managedclusters.cluster.open-cluster-management.io/YOURCLUSTER clusterGroup=prod`

### You're done

That's it! Go to your production OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.

[![GitOps Dashboard prod](/images/devsecops/gitops-secured-cluster.png)](/images/devsecops/gitops-secured-cluster.png)

## Next up

Work your way through the Multicluster DevSecOps GitOps/DevOps demos (TBD)
