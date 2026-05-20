---
title: Architecture
weight: 20
aliases: /hybrid-mesh-platform/architecture/
---

# Architecture

## Hub-spoke theory in multi-cluster Kubernetes

In multi-cluster Kubernetes, a hub-spoke model designates one administrative cluster (the hub) and one or more workload clusters (spokes). The hub owns fleet APIs: cluster inventory, policy placement, credentials for spoke registration, and often centralized GitOps controllers that fan out desired state.

Spokes remain the execution venues for application namespaces, data-plane components (Kafka, MQTT bridges, mesh dataplane), and regional isolation for latency, data residency, or blast-radius control.

## Why hub-spoke?

| Benefit | Description |
| --- | --- |
| Centralized management | One control plane for membership, RBAC patterns, and bulk upgrades. |
| Policy enforcement | Kubernetes policies, compliance checks, and security baselines propagate from the hub. |
| Observability | Aggregated metrics, logging, and tracing strategies start at the hub and uniform dashboards span spokes. |
| GitOps consistency | A single Git revision strategy (with branch or overlay variants) drives spoke drift correction. |

## Platform architecture overview

Single `main` branch: hub chart at `.`, spoke charts at `east/` and `west/`, shared `components/` referenced by all clusters.

[![Platform architecture overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

[![Hub-spoke GitOps flow](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)](/images/hybrid-mesh-platform/arch-hub-spoke-flow.png)

## Follow the request — one temperature reading end to end

When a machine sensor on the east spoke publishes a temperature sample, the path is: MQTT (`messaging` broker) → Camel K (`mqtt-to-kafka` integration) → Kafka (`dev-cluster` topic) → optional ML scoring (KServe) → line-dashboard WebSocket consumer. In parallel, Thanos Querier on east scrapes Istio and Kafka metrics; a Skupper Connector (`prometheus-east`) tunnels HTTP to the hub, where Grafana datasource `prometheus-east` plots the series. The Hub Gateway can route browser traffic to the east line-dashboard via spoke-gateway and Skupper listener `ie-gateway-east`. Developer Hub Topology shows the same pods when the catalog entity carries `backstage.io/kubernetes-cluster: east` and spoke API tokens are synced.

[![End-to-end data flow](/images/hybrid-mesh-platform/arch-data-flow.png)](/images/hybrid-mesh-platform/arch-data-flow.png)

## Components on the hub vs spokes

| Area | Hub | Spokes | Config path |
| --- | --- | --- | --- |
| ACM hub operator & APIs | yes | | `values.yaml` |
| ArgoCD / App-of-Apps root | yes | yes | `.` / `east/` / `west/` |
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

## GitOps application delivery flow

Hub syncs first; ApplicationSet pushes per-spoke charts; each spoke Argo CD reconciles child Applications locally.

[![GitOps sync sequence](/images/hybrid-mesh-platform/arch-gitops-sync-sequence.png)](/images/hybrid-mesh-platform/arch-gitops-sync-sequence.png)

## Sync wave ordering

Components deploy in strict order via ArgoCD sync waves:

[![Sync wave ordering](/images/hybrid-mesh-platform/arch-sync-waves.png)](/images/hybrid-mesh-platform/arch-sync-waves.png)

Sync waves prevent operators from racing workloads — mesh and namespaces land before Industrial Edge and gateways.

## Service Interconnect (Skupper) topology

Red Hat Service Interconnect creates a Virtual Application Network (VAN) that bridges services across clusters without VPN or direct network connectivity.

Connectors expose spoke-gateway and prometheus-auth-proxy; Listeners materialize ClusterIP services on the hub.

[![Skupper topology](/images/hybrid-mesh-platform/arch-skupper-topology.png)](/images/hybrid-mesh-platform/arch-skupper-topology.png)

[![Service Interconnect console topology](/images/hybrid-mesh-platform/service-interconnect-console-topology.png)](/images/hybrid-mesh-platform/service-interconnect-console-topology.png)

## Spoke gateway aggregation

Each spoke runs a Gateway API gateway that fronts all Industrial Edge services, providing a single entry point for Skupper to expose to the hub.

One Connector per spoke exposes the gateway instead of every microservice individually.

## Multi-cluster observability pipeline

Spoke Thanos Querier is reached through nginx auth-proxy Connectors; hub Grafana uses HTTP datasources without bearer tokens.

[![Observability pipeline](/images/hybrid-mesh-platform/arch-observability-pipeline.png)](/images/hybrid-mesh-platform/arch-observability-pipeline.png)

## Data flow (sensors to dashboard)

Telemetry path on each spoke; MirrorMaker replicates to the hub-centralized MinIO data lake.

## Comparison with Red Hat Validated Patterns

The [Multicloud GitOps](/patterns/multicloud-gitops) validated pattern demonstrates fleet GitOps with OpenShift GitOps and ACM patterns that resemble this repository's hub-push model: a declarative root Application, cluster grouping, and progressive rollout.

This platform extends that idea with [Industrial Edge](/patterns/industrial-edge/) workloads deployed on multiple spokes, Service Mesh ambient, Connectivity Link, optional OpenShift AI, ACS depth, and Service Interconnect for cross-cluster service exposure — tuned for factory-style telemetry and east-west observability rather than only infrastructure provisioning.
