---
layout: default
title: Secured Production Sites
grand_parent: Patterns
parent: Secure Supply Chain (DevSecOps)
nav_order: 3
---

# Having a production cluster join the hub

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Introduction

Production clusters need to be secured and so one part of the deployment is Advanced Cluster Security with a secured configuration. This allows ACS to monitor and report on security issues on the cluster. ACS secured sites report to an ACS Central application that is deployed on the hub.

## Allow ACM to deploy the production application to a subset of secured clusters

By default the production applications are deployed on all `secured` clusters that ACM knows about.

```json
  - name: secured
    helmOverrides:
    - name: clusterGroup.isHubCluster
      value: "false"
    clusterSelector:
      matchLabels:
        clustergroup: secured
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

## production setup using the ACM UI

1. From the datacenter openshift console select ACM from the top right

![launch-acm-console](/images/launch-acm-console.png "Launch ACM console")

2. Select the "Import cluster" option beside the highlighted Create Cluster button.

![import-cluster](/images/import-cluster.png "Select Import cluster")

3. On the "Import an existing cluster" page, enter the cluster name and choose Kubeconfig as the "import mode". Add the tag `clustergroup=secured` Press import. Done.

![import-with-kubeconfig](/images/import-with-kubeconfig.png "Import using kubeconfig")

Using this method, you are done. Skip to the section [Production is joined](#production-is-joined) but ignore the part about adding the site tag.

## Production setup using `cm` tool

1. Install the `cm` (cluster management) command-line tool. See details [here](https://github.com/open-cluster-management/cm-cli/#installation)

1. Obtain the KUBECONFIG file from the edge/secured cluster.

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

   `export KUBECONFIG=~/my-ocp-env/secured`

1. Then request to that the production join the datacenter hub

   `clusteradm join --hub-token <token from clusteradm get token command > <production cluster name>`

1. Back on the hub cluster accept the join request

   `clusteradm accept --clusters <production-cluster-name>`

Skip to the next section, [Production is joined](#production-is-joined)

## Production is joined

### Designate the new cluster as a production site

Now that ACM is no longer deploying the production applications everywhere, we need
to explicitly indicate that the new cluster has the production role. If you haven't tagged the cluster as `clustergroup=secured` then we can that here.

We do this by adding the label referenced in the managedSite's `clusterSelector`.

1. Find the new cluster

   `oc get managedclusters.cluster.open-cluster-management.io`

1. Apply the label

   `oc label managedclusters.cluster.open-cluster-management.io/YOURCLUSTER clustergroup=secured`

### You're done

That's it! Go to your production OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.

## Next up

Work your way through the Multicluster DevSecOps [GitOps/DevOps demos](/devsecops/) TBD
