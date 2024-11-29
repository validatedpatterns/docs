---
title: Factory Sites
weight: 20
aliases: /industrial-edge/factory/
---

# Having a factory (edge) cluster join the datacenter (hub)

## Deploy a factory cluster

By default the `factory` applications defined in the `values-factory.yaml` file
are deployed on all clusters imported into ACM and that have the label
`clusterGroup=factory`

For instructions on how to prepare and import a factory cluster please read the
section [importing a cluster](/learn/importing-a-cluster). Use
`clusterGroup=factory`.

### You're done

That's it! Go to your factory (edge) OpenShift console and check for the
open-cluster-management-agent pod being launched. Be patient, it will take a
while for the ACM agent and agent-addons to launch. After that, the operator
OpenShift GitOps will run. When it's finished coming up launch the
OpenShift GitOps (ArgoCD) console from the top right of the OpenShift
console.

## Next up

Work your way through the Industrial Edge 2.0 [GitOps/DevOps demos](/industrial-edge/application)
