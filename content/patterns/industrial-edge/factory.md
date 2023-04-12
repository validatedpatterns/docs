---
title: Factory Sites
weight: 20
aliases: /industrial-edge/factory/
---

# Having a factory (edge) cluster join the datacenter (hub)

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

For instructions on how to prepare and import a factory cluster please read the section [importing a cluster](/learn/importing-a-cluster)

### You're done

That's it! Go to your factory (edge) OpenShift console and check for the open-cluster-management-agent pod being launched. Be patient, it will take a while for the ACM agent and agent-addons to launch. After that, the operator OpenShift GitOps will run. When it's finished coming up launch the OpenShift GitOps (ArgoCD) console from the top right of the OpenShift console.

## Next up

Work your way through the Industrial Edge 2.0 [GitOps/DevOps demos](/industrial-edge/application)
