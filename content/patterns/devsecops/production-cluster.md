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

```yaml
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

## Deploy a Production (prod) cluster

For instructions on how to prepare and import a production (prod) cluster please read the section [importing a cluster](/learn/importing-a-cluster).

## You are done importing the production cluster

That's it! Go to your production OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.

[![GitOps Dashboard prod](/images/devsecops/gitops-secured-cluster.png)](/images/devsecops/gitops-secured-cluster.png)

## Next up

Work your way through the Multicluster DevSecOps GitOps/DevOps demos (TBD)
