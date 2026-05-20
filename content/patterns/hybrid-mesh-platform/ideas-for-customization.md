---
title: Ideas for customization
weight: 70
aliases: /hybrid-mesh-platform/ideas-for-customization/
---

# Ideas for customization

## Branch strategy

This repository follows a **single-branch, multi-directory** model: all configuration lives on `main` and cluster-specific configuration is handled via dedicated folders per cluster.

### Repository layout

```
.              → Hub cluster (root Helm chart)
east/          → East spoke cluster (self-contained Helm chart)
west/          → West spoke cluster (self-contained Helm chart)
components/    → Shared component charts referenced by all clusters
```

Each directory (`east/`, `west/`) is an independent Helm chart with its own `Chart.yaml`, `values.yaml`, and `templates/`. The hub uses the repository root (`.`) as its chart.

### How it works

| Path / File | Purpose |
| --- | --- |
| `values.yaml` | Hub cluster – operators, observability, gateway, hub-only components |
| `east/values.yaml` | East spoke – full component list, subscriptions, domain configuration |
| `west/values.yaml` | West spoke – full component list, subscriptions, domain configuration |
| `values-lite.yaml` | Minimal hub profile – fewer subscriptions, lighter footprint for demos |
| `components/` | Shared Helm charts used by hub and spoke Application CRs |

The ACM ApplicationSet uses a `clusterDecisionResource` generator to deploy each spoke's folder to the remote cluster. Each spoke chart generates child Application CRs that the spoke's own Argo CD syncs locally.

## Adding a new spoke cluster

1. Provision the OpenShift cluster and import it into ACM.
2. Label the `ManagedCluster` for placement selectors (`region=<name>`, `cluster.open-cluster-management.io/clusterset=global`).
3. Create a folder (e.g. `south/`) by copying `east/` and adjusting `clusterName`, `deployer.domain`, and `clusters.hub.domain` in `values.yaml`.
4. Add the cluster domain to hub `values.yaml` under `clusters.<name>.domain`.
5. Register the spoke as an Argo CD cluster secret on the hub.
6. Run `helm template` and CI (`helm lint`, `helm template south/`) to validate.

The Placement will automatically include the new cluster if it matches the label selectors, and the ApplicationSet will generate an Application pointing to the new folder.

## Minimal profiles

For constrained environments, use `values-lite.yaml` on the hub: fewer subscriptions and disabled heavy components while preserving GitOps bootstrap paths.

```bash
helm template test . -f values-lite.yaml
```

## Customization ideas

| Area | Customization |
| --- | --- |
| Regions | Add spokes beyond east/west (copy folder + ACM labels) |
| Gateway weights | Adjust `gateway.weights` for canary or active-active front traffic |
| Circuit breaking | Tune `gateway.circuitBreaking` per environment |
| Industrial Edge | Scaffold additional factory instances per spoke via Developer Hub |
| Observability | Add Grafana dashboards or federate additional Prometheus endpoints |
| Mesh | Enable waypoints for L7 policy on selected namespaces |
| Secrets | Integrate Vault or External Secrets for multi-cluster credentials |
| OpenShift version | Test on 4.20+; validate operator channels per release |

## Related patterns

- [Multicloud GitOps](/patterns/multicloud-gitops) — fleet GitOps and ACM placement patterns
- [Industrial Edge](/patterns/industrial-edge/) — underlying factory/OT workload pattern
