---
title: Ideas for customization
weight: 90
aliases: /hybrid-mesh-platform/ideas-for-customization/
---

# Ideas for customization

Adapt Hybrid Mesh Platform to your fleet size, regions, and operational constraints. The pattern repository follows a **single-branch, multi-directory** model so all clusters stay on `main` while Helm values and folders isolate hub vs spoke configuration.

## Branch strategy

All configuration lives on branch **`main`**. Cluster-specific settings use directories — not long-lived environment branches.

### Repository layout

```
charts/region/hub/   → Hub bootstrap + hub clusterGroup values
charts/region/east/  → East spoke bootstrap + clusterGroup values
charts/region/west/  → West spoke bootstrap + clusterGroup values
charts/all/          → Shared component charts (50+ charts)
values-global.yaml   → Pattern name and shared Git URL
values.yaml          → Root chart values (clustergroup subscription)
```

Each `charts/region/<role>/` directory is an independent Helm chart with its own `Chart.yaml` and `values.yaml`. Component charts under `charts/all/` are referenced by hub and spoke clusterGroup Applications.

### How values and ApplicationSet interact

| Path / File | Purpose |
| --- | --- |
| `values-global.yaml` | Pattern name and shared Git URL |
| `charts/region/hub/values.yaml` | Hub clusterGroup — operators, observability, gateway, managedClusterGroups |
| `charts/region/east/values.yaml` | East spoke clusterGroup — subscriptions, domains, Applications |
| `charts/region/west/values.yaml` | West spoke clusterGroup — subscriptions, domains, Applications |
| `charts/all/` | Shared component charts referenced by all clusters |

The pattern uses **dual GitOps**. The hub ApplicationSet (`charts/all/acm-hub-spoke`) uses a `clusterDecisionResource` generator for the PUSH leg:

```yaml
# Hub ApplicationSet (fleet-spoke-push) — actual path in the pattern repo
source:
  path: charts/all/spoke-meta-push   # PUSH: meta chart deploys to spoke cluster
destination:
  name: '{{name}}'                   # east or west, via hub Argo CD cluster secret
```

The spoke's local Argo CD then autonomously **PULL**s from `charts/region/east/` or `charts/region/west/` — the hub does not apply spoke workloads directly.

## Adding a new spoke cluster

1. Provision OpenShift and import the cluster into ACM.
2. Label `ManagedCluster`: `region=<name>`, `cluster.open-cluster-management.io/clusterset=global`.
3. Copy `charts/region/east/` to `charts/region/south/` and update `clusterName`, `deployer.domain`, `clusters.hub.domain` inside the new chart.
4. Add `clusters.south.domain` (or equivalent) to `charts/region/hub/values.yaml`.
5. Register the spoke as an Argo CD cluster secret on the hub (name must match the folder name: `south`).
6. Validate: `helm lint charts/region/south/` and `helm template charts/region/south/`.
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
| Regions | Add spokes beyond east/west — new `charts/region/<name>/` folder + ACM labels + hub gateway weights |
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

## Red Hat Device Edge with MicroShift

The current spokes require full OpenShift clusters (3 workers, cloud or bare-metal). For physically constrained factory locations — industrial controllers, single-board computers, ruggedized appliances — the pattern extends to **Red Hat Device Edge** with **MicroShift**.

[**Red Hat Device Edge**](https://www.redhat.com/en/technologies/device-edge) bundles RHEL with **MicroShift**, a minimal OpenShift-compatible runtime that runs on hardware with as little as 2 CPU cores and 2 GiB RAM. Because MicroShift exposes the Kubernetes API, ACM manages it as a `ManagedCluster` with the same placement rules used for full OpenShift spokes — no hub changes required.

### Extending the pattern for MicroShift spokes

1. Provision a RHEL device with MicroShift installed (`rpm-ostree install microshift`).
2. Import the device into ACM as a `ManagedCluster` with labels `region=far-edge`.
3. Add `charts/region/far-edge/` in the pattern repo with a lightweight values profile — omit Kafka 3-replica and DevSpaces; keep MQTT bridge, Camel K lite, and Skupper.
4. Register a Skupper `AccessToken` on the device (same outbound-only mTLS as cloud spokes).
5. Hub Grafana aggregates metrics from the far-edge site the same way it does from east/west.

This extension is documented as a future topology in [Architecture — Red Hat Device Edge extension path](architecture#red-hat-device-edge-extension-path). It is not deployed in the current sandbox tier.

## Related patterns

- [Multicloud GitOps](/patterns/multicloud-gitops) — fleet GitOps and ACM placement patterns
- [Industrial Edge](/patterns/industrial-edge/) — underlying factory/OT workload pattern (maintained tier)

**Pattern repository:** [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) (Validated Patterns). Legacy App-of-Apps: [platform-hub-spoke-config](https://github.com/maximilianoPizarro/platform-hub-spoke-config).
