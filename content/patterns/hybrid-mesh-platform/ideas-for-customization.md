---
title: Ideas for customization
weight: 70
aliases: /hybrid-mesh-platform/ideas-for-customization/
---

# Ideas for customization

Adapt Hybrid Mesh Platform to your fleet size, regions, and operational constraints. The pattern repository follows a **single-branch, multi-directory** model so all clusters stay on `main` while Helm values and folders isolate hub vs spoke configuration.

## Branch strategy

All configuration lives on branch **`main`**. Cluster-specific settings use directories — not long-lived environment branches.

### Repository layout

```
.              → Hub cluster (root Helm chart)
east/          → East spoke cluster (self-contained Helm chart)
west/          → West spoke cluster (self-contained Helm chart)
components/    → Shared component charts referenced by all clusters
```

Each directory (`east/`, `west/`) is an independent Helm chart with its own `Chart.yaml`, `values.yaml`, and `templates/`. The hub uses the repository root (`.`) as its chart.

### How values and ApplicationSet interact

| Path / File | Purpose |
| --- | --- |
| `values.yaml` | Hub — operators, observability, gateway, hub-only components |
| `east/values.yaml` | East spoke — subscriptions, domains, spoke Applications |
| `west/values.yaml` | West spoke — subscriptions, domains, spoke Applications |
| `values-lite.yaml` | Minimal hub profile for demos (fewer operators) |
| `components/` | Shared charts referenced by hub and spoke Application CRs |

The ACM ApplicationSet (`components/acm-hub-spoke`) uses a **`clusterDecisionResource`** generator:

```yaml
# Conceptual — see pattern repo for full template
source:
  path: '{{name}}'          # east/ or west/
destination:
  name: '{{name}}'          # remote cluster via Argo CD secret
```

Each spoke chart generates **child Application CRs** that the spoke's own Argo CD syncs locally — the hub does not apply spoke workloads directly.

## Adding a new spoke cluster

1. Provision OpenShift and import the cluster into ACM.
2. Label `ManagedCluster`: `region=<name>`, `cluster.open-cluster-management.io/clusterset=global`.
3. Copy `east/` to a new folder (for example `south/`) and update `clusterName`, `deployer.domain`, `clusters.hub.domain`.
4. Add `clusters.south.domain` (or equivalent) to hub `values.yaml`.
5. Register the spoke as an Argo CD cluster secret on the hub (name must match folder name).
6. Validate: `helm lint south/` and `helm template south/`.
7. Confirm Placement selects the cluster and ApplicationSet creates `south-spoke-components`.

## Minimal profiles

For constrained environments (labs, CI, edge PoC), use `values-lite.yaml` on the hub:

```bash
helm template test . -f values-lite.yaml
```

Disables heavy subscriptions while preserving GitOps bootstrap and ApplicationSet paths.

## Customization ideas

| Area | Customization |
| --- | --- |
| Regions | Add spokes beyond east/west — new folder + ACM labels + hub gateway weights |
| Gateway weights | `gateway.weights.east` / `west` for canary or active-active front traffic |
| API affinity | `gateway.apiWeights` when Socket.IO can span spokes |
| Circuit breaking | Tune `gateway.circuitBreaking` per environment (see [Hub Gateway](hub-gateway)) |
| Industrial Edge | Scaffold additional factory instances per spoke via [Scaffolding](scaffolding) |
| Observability | Custom Grafana dashboards; additional Prometheus federation |
| Mesh | Waypoints for L7 policy on selected namespaces; keep data-lake off ambient if using MinIO |
| Skupper | Additional listeners/connectors for new spoke services |
| Secrets | Vault or External Secrets for multi-cluster credentials (never commit tokens) |
| OpenShift version | Validate on 4.20+; align operator channels per release |
| Developer Hub | Extend software templates under `docs/assets/backstage/software-templates/` |

## Related patterns

- [Multicloud GitOps](/patterns/multicloud-gitops) — fleet GitOps and ACM placement patterns
- [Industrial Edge](/patterns/industrial-edge/) — underlying factory/OT workload pattern (maintained tier)

**Pattern repository:** [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) (Validated Patterns). Legacy App-of-Apps: [platform-hub-spoke-config](https://github.com/maximilianoPizarro/platform-hub-spoke-config).
