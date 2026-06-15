---
title: Architecture
weight: 20
aliases: /hybrid-mesh-platform/architecture/
---

# Architecture

## Hub-spoke theory in multi-cluster Kubernetes

In multi-cluster Kubernetes, a **hub-spoke** model designates one administrative cluster (the **hub**) and one or more workload clusters (**spokes**). The hub owns fleet APIs: cluster inventory, policy placement, credentials for spoke registration, and often centralized GitOps controllers that fan out desired state.

Spokes remain the execution venues for application namespaces, data-plane components (Kafka, MQTT bridges, mesh dataplane), and regional isolation for latency, data residency, or blast-radius control.

## Why hub-spoke?

| Benefit | Description |
| --------|------------- |
| **Centralized management** | One control plane for membership, RBAC patterns, and bulk upgrades. |
| **Policy enforcement** | Kubernetes policies, compliance checks, and security baselines propagate from the hub. |
| **Observability** | Aggregated metrics, logging, and tracing strategies start at the hub and uniform dashboards span spokes. |
| **GitOps consistency** | A single Git revision (`main`) with region paths drives spoke drift correction. |

## Multi-cluster topology: three required clusters

This pattern requires **three OpenShift clusters** — not a single-cluster deployment. The topology follows the Validated Patterns hub-spoke model: one **hub** for fleet governance and two **spokes** for factory workloads. Hub and spokes communicate over a **Skupper Virtual Application Network** (outbound-only mTLS — no inbound firewall rule changes needed). The hub's `ApplicationSet` pushes spoke charts; each spoke's local Argo CD pulls its `clusterGroup` from Git autonomously.

[![Hybrid Mesh Platform — hub-spoke component map](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)

_Platform component map: hub hosts fleet governance and AI services; east and west spokes host Industrial Edge workloads. Skupper VAN bridges cross-cluster service traffic without VPN._

## Platform architecture overview

[![Hub-spoke platform — Git paths, ApplicationSet, Skupper VAN, and per-cluster components](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)

*Single `main` branch: hub at `charts/region/hub`, spokes at `charts/region/east` and `charts/region/west`, shared charts under `charts/all/`.*

## Follow the request — one temperature reading end to end

When a machine sensor on the **east** spoke publishes a temperature sample, the path is: **MQTT** (`messaging` broker) → **Camel K** (`mqtt-to-kafka` integration) → **Kafka** (`dev-cluster` topic) → optional **ML scoring** (KServe) → **line-dashboard** WebSocket consumer. In parallel, **Thanos Querier** on east scrapes Istio and Kafka metrics; a **Skupper Connector** (`prometheus-east`) tunnels HTTP to the hub, where **Grafana** datasource `prometheus-east` plots the series. The **Hub Gateway** can route browser traffic to the east line-dashboard via **spoke-gateway** and Skupper listener `ie-gateway-east`. Developer Hub **Topology** shows the same pods when the catalog entity carries `backstage.io/kubernetes-cluster: east` and spoke API tokens are synced.

## Components on the hub vs spokes

| Area | Hub | Spokes | Config path |
| -----|-----|--------|-------------|
| ACM hub operator & APIs | yes | | `charts/region/hub/values.yaml` |
| ArgoCD / clustergroup root | yes | yes | `charts/region/hub` / `charts/region/east` / `charts/region/west` |
| ApplicationSet (spoke apps) | yes | | `charts/region/hub/values.yaml` |
| ACS Central | yes | | `charts/region/hub/values.yaml` |
| ACS Secured Cluster | | yes | `charts/region/east|west/values.yaml` |
| Developer Hub | yes | | `charts/region/hub/values.yaml` |
| Hub Gateway (Gateway API) | yes | | `charts/region/hub/values.yaml` |
| Spoke Gateway (Gateway API) | | yes | `charts/region/east|west/values.yaml` |
| Industrial Edge workloads | | yes | `charts/region/east|west/values.yaml` |
| Kafka brokers (regional) | | yes | `charts/region/east|west/values.yaml` |
| Service Mesh ambient / ztunnel | yes | yes | both |
| Istio CNI (`profile: ambient`) | yes | yes | both |
| Skupper Site (hub listeners) | yes | | `charts/region/hub/values.yaml` |
| Skupper Site (spoke connectors) | | yes | `charts/region/east|west/values.yaml` |
| Grafana (multi-cluster dashboards) | yes | | `charts/region/hub/values.yaml` |
| Grafana (local metrics) | | yes | `charts/region/east|west/values.yaml` |
| Kiali + OSSM Console plugin | yes | yes | both |
| Connectivity Link (RHCL) | yes | yes | both |
| Kubecost (primary aggregator) | yes | | `charts/region/hub/values.yaml` |
| Kubecost (agent) | | yes | `charts/region/east|west/values.yaml` |
| Kafka Console (all clusters) | yes | | `charts/region/hub/values.yaml` |

## GitOps application delivery flow

See **[GitOps deployment chain](https://maximilianopizarro.github.io/hybrid-mesh-platform/validatedpatterns-docs/gitops-deployment-chain.html)** for the full encadenamiento (hub `field-content-*` → ApplicationSet `fleet-spoke-push` → `*-spoke-components` → spoke `*-east` / `*-west` apps) with copy-paste YAML fragments.

![GitOps sequence — hub Argo CD, ApplicationSet, remote spoke sync](/images/hybrid-mesh-platform/arch-gitops-sync-sequence.png)
*Hub syncs first; ApplicationSet pushes per-spoke charts; each spoke Argo CD reconciles child Applications locally.*
## Sync wave ordering

Components deploy in strict order via ArgoCD sync waves:

![Argo CD sync wave ordering from bootstrap through dashboards](/images/hybrid-mesh-platform/arch-sync-waves.png)
*Sync waves prevent operators from racing workloads — mesh and namespaces land before Industrial Edge and gateways.*
### Spoke sync-wave reference

Matches ebook Ch.4 ordering (`charts/region/east/values.yaml`, `charts/region/west/values.yaml`):

| Wave | What deploys | Why this order |
| ---- | ------------ | -------------- |
| 1 | Namespaces (no ambient label yet) | Names must exist before operators and workloads |
| 2 | OLM Subscriptions | CRDs and operators installed |
| 3 | Service Mesh 3 (Istio + ZTunnel + ambient labels wave 2 inside chart) | Mesh dataplane before application pods |
| 4 | Observability, ACS secured cluster | Scraping and security after mesh |
| 5 | Industrial Edge (Kafka, sensors, dashboard) | Pods enroll in ambient with HBONE ready |
| 6 | Spoke gateway + Skupper interconnect | Routing after backends exist |

Hub chart uses a similar pattern; ApplicationSet for spokes runs at hub wave **5** after ACM placement is healthy.

## Service Interconnect (Skupper) topology

Red Hat Service Interconnect creates a Virtual Application Network (VAN) that bridges services across clusters without VPN or direct network connectivity.

![Skupper VAN — hub Listeners, spoke Connectors, AccessGrant and AccessToken](/images/hybrid-mesh-platform/arch-skupper-topology.png)
*Connectors expose spoke-gateway and prometheus-auth-proxy; Listeners materialize ClusterIP services on the hub.*
## Spoke gateway aggregation

Each spoke runs a **Gateway API gateway** that fronts all Industrial Edge services, providing a single entry point for Skupper to expose to the hub.

![Spoke gateway aggregates Industrial Edge HTTP routes for Skupper](/images/hybrid-mesh-platform/arch-spoke-gateway.png)
*One Connector per spoke exposes the gateway instead of every microservice individually.*
## Multi-cluster observability pipeline

![Multi-cluster observability — spoke metrics via Skupper into hub Grafana](/images/hybrid-mesh-platform/arch-observability-pipeline.png)
*Spoke Thanos Querier is reached through nginx auth-proxy Connectors; hub Grafana uses HTTP datasources without bearer tokens.*
## Data flow (sensors to dashboard)

![Industrial Edge data flow — sensors through MQTT, Camel, Kafka to Grafana and data lake](/images/hybrid-mesh-platform/arch-data-flow.png)
*Telemetry path on each spoke; MirrorMaker replicates to the hub-centralized MinIO data lake.*
## Relationship to Red Hat Validated Patterns

The **[Multicloud GitOps](https://validatedpatterns.io/patterns/multicloud-gitops)** validated pattern demonstrates fleet GitOps with OpenShift GitOps and ACM — a declarative root Application, cluster grouping, and progressive rollout. Hybrid Mesh Platform forks that foundation and extends it with:

- **Industrial Edge** factory telemetry (MQTT → Kafka → ML → dashboards) on east/west spokes
- **Service Mesh 3 ambient mode** — L4 encryption without sidecars
- **Service Interconnect (Skupper)** — cross-cluster service exposure without VPN
- **Connectivity Link (Kuadrant)** — API-aware Gateway API ingress with rate limits and API keys
- **OpenShift AI (RHOAI)** — hub-resident MaaS inference (Qwen3 / Granite via vLLM) for factory AI pipelines
- **OpenShift Lightspeed + MCP Gateway** — natural-language platform operations via `OLSConfig` and a dual MCP server (Quarkus 19 tools + Go SDK 21 tools), enabling operators to query and act on cluster state without raw YAML

## Red Hat Device Edge extension path

The current spokes run **full OpenShift clusters** (3 workers, cloud or bare-metal). For physically constrained factory devices — industrial controllers, single-board computers, ruggedized appliances — the natural extension is **Red Hat Device Edge** with **MicroShift**.

[**Red Hat Device Edge**](https://www.redhat.com/en/technologies/device-edge) combines **Red Hat Enterprise Linux** with **MicroShift**, a minimal OpenShift-compatible Kubernetes runtime optimized for edge hardware with as little as 2 CPU cores and 2 GiB RAM. MicroShift exposes the same Kubernetes API surface as OpenShift, so ACM can manage it as a `ManagedCluster` alongside full OpenShift spokes.

In a Hybrid Mesh Platform extension:

| Layer | Current spokes | Far-edge extension |
| --- | --- | --- |
| Runtime | OpenShift 4.17+ (3 workers) | MicroShift on RHEL (single node) |
| Management | ACM ManagedCluster | ACM ManagedCluster (same placement rules) |
| Workloads | Industrial Edge — Kafka, Camel K, ML | Lightweight sensors, MQTT bridge, edge inference |
| Connectivity | Skupper VAN (full) | Skupper VAN (single-pod footprint) |
| GitOps | clusterGroup PULL via ACM | clusterGroup PULL via ACM |

This extension path is not deployed in the current sandbox tier implementation, but the ACM placement model and Skupper VAN are designed to accommodate MicroShift spokes with no hub-side changes.

---

**Next →** translate diagrams into installs via **[Getting Started](getting-started)**, scaffold new edge instances via **[Scaffolding](scaffolding)**, then follow **[Observability](observability)** once workloads expose Prometheus signals. For ACM placement detail and additional reference pages, see the [pattern documentation site](https://maximilianopizarro.github.io/hybrid-mesh-platform/validatedpatterns-docs/).

## Official documentation

- [ACM Architecture](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.16/html/about/welcome-to-red-hat-advanced-cluster-management-for-kubernetes)
- [Red Hat Device Edge](https://www.redhat.com/en/technologies/device-edge)
- [MicroShift documentation](https://docs.redhat.com/en/documentation/red_hat_build_of_microshift)
- [Multicloud GitOps Pattern](https://validatedpatterns.io/patterns/multicloud-gitops)
- [Red Hat Service Interconnect](https://docs.redhat.com/en/documentation/red_hat_service_interconnect/2.1)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Argo CD ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)
