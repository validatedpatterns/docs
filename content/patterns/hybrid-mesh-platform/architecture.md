---
title: Architecture
weight: 20
aliases: /hybrid-mesh-platform/architecture/
---

# Architecture

Understand how Git, ACM, Service Interconnect, and Industrial Edge wire the hub and spoke clusters together before you install or scaffold workloads.

## Hub-spoke theory in multi-cluster Kubernetes

In multi-cluster Kubernetes, a hub-spoke model designates one administrative cluster (the **hub**) and one or more workload clusters (**spokes**). The hub owns fleet APIs: cluster inventory, policy placement, credentials for spoke registration, and often centralized GitOps controllers that fan out desired state.

Spokes remain the execution venues for application namespaces, data-plane components (Kafka, MQTT bridges, mesh dataplane), and regional isolation for latency, data residency, or blast-radius control.

## Why hub-spoke?

| Benefit | Description |
| --- | --- |
| Centralized management | One control plane for membership, RBAC patterns, and bulk upgrades. |
| Policy enforcement | Kubernetes policies, compliance checks, and security baselines propagate from the hub. |
| Observability | Aggregated metrics, logging, and tracing strategies start at the hub; uniform dashboards span spokes. |
| GitOps consistency | A single Git revision strategy (with branch or overlay variants) drives spoke drift correction. |

## Platform architecture overview

The pattern repository uses a **single `main` branch** with cluster-specific directories:

- Hub chart at `.` (repository root)
- Spoke charts at `east/` and `west/`
- Shared Helm charts under `components/` referenced by hub and spoke Application CRs

[![Hybrid Mesh Platform architecture](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)

_High-level view: hub cluster (data center / cloud) connected to east and west spoke clusters (Industrial Edge sites) via Skupper mTLS tunnels. Gateway API on the hub routes external clients to spoke services._

[![Platform architecture overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

_Detailed architecture: Git repository layout, ACM ApplicationSet fan-out, sync-wave ordering, and observability pipeline from spokes to hub Grafana._

[![Hub-spoke GitOps flow](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)

_GitOps delivery flow: hub Argo CD pushes `east/` and `west/` charts to remote clusters via ACM PlacementDecision._

## Follow the request — one temperature reading end to end

When a machine sensor on the **east** spoke publishes a temperature sample, the path is:

1. MQTT (`messaging` broker) → Camel K (`mqtt-to-kafka` integration)
2. Kafka (`dev-cluster` topic) → optional ML scoring (KServe)
3. `line-dashboard` WebSocket consumer

In parallel:

- Thanos Querier on east scrapes Istio and Kafka metrics
- Skupper Connector `prometheus-east` tunnels HTTP to the hub
- Hub Grafana datasource `prometheus-east` plots the series
- Hub Gateway routes browser traffic to the east line-dashboard via spoke-gateway and Skupper listener `ie-gateway-east`
- Developer Hub Topology shows the same pods when the catalog entity carries `backstage.io/kubernetes-cluster: east` and spoke API tokens are synced

[![End-to-end data flow](/images/hybrid-mesh-platform/arch-data-flow.png)](/images/hybrid-mesh-platform/arch-data-flow.png)

## Components on the hub vs spokes

| Area | Hub | Spokes | Config path |
| --- | :---: | :---: | --- |
| ACM hub operator & APIs | yes | | `values.yaml` |
| Argo CD / App-of-Apps root | yes | yes | `.` / `east/` / `west/` |
| ApplicationSet (spoke apps) | yes | | `values.yaml` |
| ACS Central | yes | | `values.yaml` |
| ACS Secured Cluster | | yes | `east/` `west/` |
| Developer Hub | yes | | `values.yaml` |
| Hub Gateway (Gateway API) | yes | | `values.yaml` |
| Spoke Gateway (Gateway API) | | yes | `east/` `west/` |
| Industrial Edge workloads | | yes | `east/` `west/` |
| Kafka brokers (regional) | | yes | `east/` `west/` |
| Service Mesh ambient / ztunnel | yes | yes | both |
| Istio CNI (`profile: ambient`) | yes | yes | both |
| Skupper Site (hub listeners) | yes | | `values.yaml` |
| Skupper Site (spoke connectors) | | yes | `east/` `west/` |
| Grafana (multi-cluster dashboards) | yes | | `values.yaml` |
| Grafana (local metrics) | | yes | `east/` `west/` |
| Kiali + OSSM Console plugin | yes | yes | both |
| Connectivity Link (RHCL) | yes | yes | both |
| Kubecost (primary aggregator) | yes | | `values.yaml` |
| Kubecost (agent) | | yes | `east/` `west/` |
| Kafka Console (all clusters) | yes | | `values.yaml` |

Industrial Edge components exist **only** in spoke charts. The hub chart never includes factory workloads.

## Advanced Cluster Management (ACM)

Red Hat Advanced Cluster Management for Kubernetes (ACM) provides fleet-wide visibility and lifecycle for OpenShift clusters. In Hybrid Mesh Platform it anchors hub-spoke registration, policy placement, and integration with OpenShift GitOps via `GitOpsCluster` and related APIs.

[![ACM fleet management — east and west managed clusters on the hub](/images/hybrid-mesh-platform/ACM.png)](/images/hybrid-mesh-platform/ACM.png)

### Role in this solution

- Inventory managed clusters (`hub`, `east`, `west`) and apply governance policies consistently.
- Drive which spokes receive Industrial Edge and platform components through **Placement** rules (`region=east`, `region=west`).
- Coordinate klusterlet agents, `ManagedClusterSet` membership, and secrets required for spoke import.
- Publish **PlacementDecision** objects consumed by the Argo CD ApplicationSet (`clusterDecisionResource` generator).

### Notable APIs / CRDs

| Resource | Purpose |
| --- | --- |
| `MultiClusterHub` | Hub installation health |
| `ManagedCluster`, `ManagedClusterSet` | Fleet membership and RBAC grouping |
| `Placement`, `PlacementDecision` | Dynamic cluster selection for GitOps |
| `GitOpsCluster` | Binds placement results to Argo CD cluster secrets |

Charts: `components/acm-operator`, `components/acm-hub-spoke`. Verify with `oc get managedcluster` and PlacementDecision in `openshift-gitops`.

## Advanced Cluster Security (ACS)

Red Hat Advanced Cluster Security for Kubernetes (ACS) centralizes build-time image scanning, deployment-time policy, and runtime detection across the fleet.

[![ACS Central — hub, east, and west registered](/images/hybrid-mesh-platform/ACS.png)](/images/hybrid-mesh-platform/ACS.png)

_ACS Central dashboard showing all three clusters registered (hub, east, west) with their compliance status._

[![ACS Central — policies, vulnerabilities, and runtime visibility](/images/hybrid-mesh-platform/ACS-2.png)](/images/hybrid-mesh-platform/ACS-2.png)

_ACS policy and vulnerability management — CVE scanning results across Industrial Edge and platform images._

### Hub-spoke topology

| Component | Location | Role |
| --- | --- | --- |
| **Central** | Hub | Policy console, vulnerability database, admission coordination |
| **SecuredCluster** | Hub + spokes | Sensor, collector, and admission control per cluster |

Cluster names in Central: **`hub`**, **`east`**, **`west`**. Init bundles (TLS secrets in namespace `stackrox`) register each SecuredCluster with Central.

### Service mesh exception

Namespace `stackrox` is listed in `$noMeshNamespaces` (`components/namespaces`) — **do not** label it `istio.io/dataplane-mode: ambient`. Ambient ztunnel breaks Central ↔ PostgreSQL TLS and Central becomes unreachable.

### Capabilities used

- CVE scanning for Industrial Edge and platform images (Quay/internal registry).
- Risk prioritization across namespaces and clusters.
- Optional network and process baselines for regulated factory environments.

Charts: `components/acs-operator` (hub Central), `components/acs-secured-cluster` (hub + spokes). See [Getting Started](getting-started#advanced-cluster-security-acs) for init bundle generation.

## GitOps application delivery flow

1. Hub Argo CD syncs the root Application (operators, ACM, gateway, observability).
2. ACM ApplicationSet reads PlacementDecision and pushes `east/` and `west/` to remote clusters.
3. Each spoke Argo CD reconciles child Applications locally (namespaces → operators → workloads).

[![GitOps sync sequence](/images/hybrid-mesh-platform/arch-gitops-sync-sequence.png)](/images/hybrid-mesh-platform/arch-gitops-sync-sequence.png)

Remote deployment model:

```
Hub Argo CD → ApplicationSet
  → east-spoke-components (source: east/, destination: east cluster)
       → east/templates/ generates child Application CRs
            → East Argo CD syncs child apps locally
  → west-spoke-components (source: west/, destination: west cluster)
       → west/templates/ generates child Application CRs
            → West Argo CD syncs child apps locally
```

## Sync wave ordering

Components deploy in strict order via Argo CD sync waves. Lower waves complete before higher waves start.

[![Sync wave ordering](/images/hybrid-mesh-platform/arch-sync-waves.png)](/images/hybrid-mesh-platform/arch-sync-waves.png)

Sync waves prevent operators from racing workloads — mesh and namespaces land before Industrial Edge and gateways.

### Hub sync-wave progression

1. Namespaces and RBAC
2. Operator subscriptions (ACM, GitOps, Service Mesh, Skupper, and others)
3. Platform services (Developer Hub, ACS, interconnect sites)
4. Observability stack (Grafana, Kiali, OpenTelemetry)
5. Industrial Edge data lake and gateway workloads

### Spoke sync-wave reference

| Wave | What deploys | Why this order |
| --- | --- | --- |
| 1 | Namespaces (no ambient label yet) | Names must exist before operators and workloads |
| 2 | OLM Subscriptions | CRDs and operators installed |
| 3 | Service Mesh 3 (Istio + ztunnel + ambient labels) | Mesh dataplane before application pods |
| 4 | Observability, ACS SecuredCluster | Scraping and security after mesh |
| 5 | Industrial Edge (Kafka, sensors, dashboard) | Pods enroll in ambient with HBONE ready |
| 6 | Spoke gateway + Skupper interconnect | Routing after backends exist |

Hub ApplicationSet for spokes runs at hub wave 5 after ACM placement is healthy.

## Service Interconnect (Skupper) topology

Red Hat Service Interconnect creates a **Virtual Application Network (VAN)** that bridges services across clusters without VPN tunnels, direct routes, or firewall changes. Skupper exposes spoke Industrial Edge services and Prometheus metrics to the hub for centralized observability and ingress.

[![Skupper topology](/images/hybrid-mesh-platform/arch-skupper-topology.png)](/images/hybrid-mesh-platform/arch-skupper-topology.png)

[![Service Interconnect console topology](/images/hybrid-mesh-platform/service-interconnect-console-topology.png)](/images/hybrid-mesh-platform/service-interconnect-console-topology.png)

_Skupper console showing the three sites (hub, east, west) linked in the Virtual Application Network._

### Skupper Network Observer (console views)

The Skupper Network Observer visualizes the VAN — sites, listeners, connectors, and process-level traffic across all clusters:

[![Skupper Network Observer — sites and links](/images/hybrid-mesh-platform/service-interconnect-console.png)](/images/hybrid-mesh-platform/service-interconnect-console.png)

_Sites view: hub, east, and west clusters with their active inter-router links and connection state._

[![Skupper console — components, listeners, and connectors](/images/hybrid-mesh-platform/service-interconnect-console-topology-process.png)](/images/hybrid-mesh-platform/service-interconnect-console-topology-process.png)

_Components view: listeners on the hub (ie-gateway, prometheus, kafka) matched to connectors on spokes._

[![Skupper console — process-level topology](/images/hybrid-mesh-platform/service-interconnect-console-process.png)](/images/hybrid-mesh-platform/service-interconnect-console-process.png)

_Process-level topology: individual workloads and their cross-cluster connections (spoke-gateway, auth-proxy, Kafka bootstrap)._

[![Skupper console — built-in metrics (TCP bytes, latency, connections)](/images/hybrid-mesh-platform/service-interconnect-console-metrics.png)](/images/hybrid-mesh-platform/service-interconnect-console-metrics.png)

_Built-in metrics: TCP bytes sent/received, connection latency, and active connection counts per listener._

### Hub listeners (namespace `service-interconnect`)

| Listener | Port | Purpose |
| --- | --- | --- |
| `ie-gateway-east` | 8080 | Spoke-gateway traffic from east |
| `ie-gateway-west` | 8080 | Spoke-gateway traffic from west |
| `prometheus-east` | 9091 | Prometheus metrics from east |
| `prometheus-west` | 9091 | Prometheus metrics from west |
| `kafka-east-tst` | 9092 | Kafka bootstrap (dev-cluster) from east |
| `kafka-west-tst` | 9092 | Kafka bootstrap (dev-cluster) from west |

### Spoke connectors

| Connector | Exposes |
| --- | --- |
| `ie-gateway-<spoke>` | Local spoke-gateway |
| `prometheus-<spoke>` | Nginx auth proxy → Thanos Querier |
| `kafka-<spoke>-tst` | `dev-cluster-kafka-bootstrap` |
| `kafka-<spoke>-stormshift` | `factory-cluster-kafka-bootstrap` |

**Link establishment:** Hub `AccessGrant` generates URL, code, and CA. Spoke `AccessToken` redeems the grant over HTTPS, then establishes the inter-router link. Use the Skupper grant-server CA from `skupper-grant-server-ca` — not the OpenShift Ingress CA — or spokes fail with `x509: certificate signed by unknown authority`.

```bash
oc get secret skupper-grant-server-ca -n openshift-operators \
  -o jsonpath='{.data.ca\.crt}' | base64 -d
```

Charts: `components/service-interconnect` (hub), `components/spoke-interconnect` (spokes).

## Spoke gateway aggregation

Each spoke runs a Gateway API gateway (`components/spoke-gateway`) that fronts all Industrial Edge services. Skupper exposes **one** gateway per spoke instead of every microservice individually.

[![Spoke gateway aggregation diagram](/images/hybrid-mesh-platform/arch-spoke-gateway.png)](/images/hybrid-mesh-platform/arch-spoke-gateway.png)

_Spoke gateway architecture: a single Istio Gateway fronts all Industrial Edge services. Skupper exposes this one gateway rather than every microservice._

[![Spoke Gateway API — Connectivity Link view](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)

_OpenShift Console view of spoke Gateway API resources and HTTPRoute attachment._

Hub-side Gateway API and HTTPRoute policy topology: see [Hub Gateway — Connectivity Link topology](hub-gateway#connectivity-link-topology).

## Multi-cluster observability pipeline

Spoke Thanos Querier is reached through nginx auth-proxy Connectors. Hub Listeners `prometheus-east` and `prometheus-west` become Grafana HTTP datasources (no bearer token from hub).

[![Observability pipeline](/images/hybrid-mesh-platform/arch-observability-pipeline.png)](/images/hybrid-mesh-platform/arch-observability-pipeline.png)

## Data flow (sensors to dashboard)

On each spoke, telemetry flows from sensors through MQTT, Camel, and Kafka to dashboards. Strimzi MirrorMaker replicates factory topics toward the hub-centralized data lake (MinIO/S3 archiver on hub and spokes).

## Comparison with Red Hat Validated Patterns

The [Multicloud GitOps](/patterns/multicloud-gitops) validated pattern demonstrates fleet GitOps with OpenShift GitOps and ACM: declarative root Application, cluster grouping, and progressive rollout.

**Hybrid Mesh Platform** extends that foundation with:

- [Industrial Edge](/patterns/industrial-edge/) on **east** and **west** spokes (not duplicated here — see maintained pattern for OT/factory depth)
- OpenShift Service Mesh 3 **ambient** mode (ztunnel L4, waypoints L7)
- Connectivity Link for Gateway API ingress policy
- Optional OpenShift AI (KServe) on spokes
- ACS Central + SecuredCluster agents
- Service Interconnect for cross-cluster service and metrics exposure

The result is tuned for factory-style telemetry and east-west observability, not only infrastructure provisioning.

**Next →** [Getting Started](getting-started) to translate these diagrams into a live deployment, or [Hub Gateway](hub-gateway) for cross-cluster HTTP routing detail.
