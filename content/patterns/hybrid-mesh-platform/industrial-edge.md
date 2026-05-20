---
title: Industrial Edge on multiple spokes
weight: 50
aliases: /hybrid-mesh-platform/industrial-edge/
---

# Industrial Edge on multiple spokes

The [Industrial Edge](/patterns/industrial-edge/) validated pattern is a **maintained** Red Hat Validated Pattern for factory and operational technology (OT) workloads on OpenShift. **Hybrid Mesh Platform** does not replace that pattern — it **extends** it by deploying the same Industrial Edge stack independently on **east** and **west** spoke clusters while the hub aggregates observability, gateway access, and GitOps control.

[![Industrial Edge on spoke](/images/hybrid-mesh-platform/industrial-edge.png)](/images/hybrid-mesh-platform/industrial-edge.png)

For the full Industrial Edge solution overview, data flows, and maintained-pattern documentation, see [Industrial Edge](/patterns/industrial-edge/).

## What Hybrid Mesh Platform adds

| Capability | Single-cluster Industrial Edge | Hybrid Mesh Platform |
| --- | --- | --- |
| Deployment scope | One or few factory sites | Hub + east + west spokes from one Git repo |
| GitOps | Pattern repo per deployment | ApplicationSet pushes `east/` and `west/` charts remotely |
| Cross-cluster access | Per-site ingress | Hub Gateway + Skupper listeners on hub |
| Observability | Local Grafana/Prometheus | Hub Grafana with Prometheus-East/West datasources |
| Provisioning | Manual / pattern install | Developer Hub templates target `east` or `west` |

Each spoke runs an **identical** Industrial Edge stack independently — the hub does not host Industrial Edge workloads.

## Factory pattern on spokes

Factories emit telemetry through MQTT brokers and Camel integrations. Kubernetes namespaces isolate teams while GitOps keeps spoke clusters aligned with approved revisions.

## Data stack (per spoke)

| Stage | Component | Namespace |
| --- | --- | --- |
| Ingress | AMQ Broker (MQTT acceptors), machine sensors | `industrial-edge-tst-all` |
| Integration | Camel K routes (MQTT→Kafka, Kafka→S3) | `industrial-edge-tst-all` |
| Streaming | AMQ Streams / Kafka dev-cluster topics | `industrial-edge-tst-all` |
| Replication | Strimzi MirrorMaker (factory→data-lake) | `industrial-edge-stormshift-messaging` |
| Data lake | prod-cluster Kafka + Camel S3 archiver | `industrial-edge-data-lake` |
| Processing | OpenShift AI (KServe InferenceService) | `industrial-edge-tst-all` |
| CI/CD | Tekton pipelines (buildah + deploy) | `industrial-edge-ci` |
| Visualization | line-dashboard (WebSocket consumer) | `industrial-edge-tst-all` |

## Camel K integrations

The `mqtt-to-kafka` integration bridges sensor data from the AMQ Broker to Kafka topics. The Camel Kaoto software template in Developer Hub scaffolds additional Camel routes with a DevSpaces-ready project.

To scaffold a Camel route: Developer Hub → Create → Industrial Edge — Camel Routes (Kaoto) → choose **east** or **west**.

## Spoke Argo CD Applications

Each spoke deploys these Argo CD Applications:

| Application | Chart | Purpose |
| --- | --- | --- |
| `industrial-edge-tst` | `components/industrial-edge-tst` | Sensors, broker, Kafka, Camel, dashboard, ML |
| `industrial-edge-stormshift` | `components/industrial-edge-stormshift` | Factory Kafka + MirrorMaker |
| `industrial-edge-data-lake` | `components/industrial-edge-data-lake` | prod-cluster + S3 archiver |
| `industrial-edge-pipelines` | `components/industrial-edge-pipelines` | Tekton build-and-test pipeline |

## Service mesh (ambient mode)

Industrial Edge namespaces run under OSSM3 ambient mesh with ztunnel L4 metrics. Namespace `industrial-edge-tst-all` carries `istio.io/dataplane-mode: ambient`.

Exception: `spoke-gateway-system` and `industrial-edge-data-lake` stay off ambient to avoid TLS conflicts with MinIO and WebSocket routing.

## Cross-cluster exposure

- **Spoke Gateway** aggregates Industrial Edge services per spoke for Skupper.
- **Hub Gateway** routes browser traffic to east/west line-dashboard and API backends.
- **Skupper** Connectors expose prometheus and ie-gateway to hub Listeners.

Deploy new edge instances on east or west via [Scaffolding](scaffolding).

## References

- [Industrial Edge Validated Pattern](/patterns/industrial-edge/)
- [Multicloud GitOps](/patterns/multicloud-gitops) — fleet GitOps foundation
