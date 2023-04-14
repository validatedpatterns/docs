---
title: Secured Development Cluster
weight: 20
aliases: /devsecops/devel-cluster/
---

# Having a development cluster (devel) join the hub

## Introduction

Development clusters are responsible for building applications and delivering the applications to a secured registry. The development cluster defines a secure pipeline that includes code and image scans and image signing before delivering them to the registry. OpenShift Pipelines is used for the continuous integration (CI). The Quay registry is deployed on the hub and therefore integration is required for the development pipeline to push images to the registry.

Development clusters also need to be secured and so one part of the deployment is Advanced Cluster Security with a secured configuration. This allows ACS to monitor and report on security issues on the cluster. ACS secured sites report to an ACS Central application that is deployed on the hub.

## Allow ACM to deploy the devel applications to a subset of clusters

By default the `devel` applications are deployed on any development clusters that ACM knows about.

```
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

## Deploy a development (devel) cluster

For instructions on how to prepare and import a development (devel) cluster please read the section [importing a cluster](/learn/importing-a-cluster). Use `clusterGroup=devel`.
.

## You are done importing the development cluster

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
