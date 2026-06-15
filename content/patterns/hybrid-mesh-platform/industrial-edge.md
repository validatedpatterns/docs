---
title: Industrial Edge on multiple spokes
weight: 50
aliases: /hybrid-mesh-platform/industrial-edge/
---

# Industrial Edge on multiple spokes

The [Industrial Edge](/patterns/industrial-edge/) validated pattern is a **maintained** Red Hat Validated Pattern for discrete manufacturing and operational technology (OT) connectivity on OpenShift: sensors, MQTT, Kafka-centric pipelines, CI/CD for edge software, ML-assisted anomaly detection, and centralized data lakes.

**Hybrid Mesh Platform** does not replace that pattern. It **extends** it by deploying the Industrial Edge stack independently on **east** and **west** spoke clusters while the hub aggregates observability, gateway access, and GitOps control.

[![Industrial Edge deployment overview](/images/hybrid-mesh-platform/workshop-industrial-edge.png)](/images/hybrid-mesh-platform/workshop-industrial-edge.png)

_Industrial Edge multi-cluster deployment: sensors, Kafka, Camel K, and ML scoring deployed identically on east and west spokes via ApplicationSet._

[![Industrial Edge on spoke — console view](/images/hybrid-mesh-platform/industrial-edge.png)](/images/hybrid-mesh-platform/industrial-edge.png)

_OpenShift Console view of Industrial Edge components running on a spoke cluster (namespaces, deployments, routes)._

For solution overview, northbound/southbound data flows, demo scenario (MANUela), and maintained-pattern diagrams, see [Industrial Edge](/patterns/industrial-edge/).

After operators discover Kafka clusters and mesh namespaces receive ambient labels, use this page as the **multi-cluster business narrative** tying workloads together across spokes.

## What Hybrid Mesh Platform adds

| Capability | Single-cluster Industrial Edge | Hybrid Mesh Platform |
| --- | --- | --- |
| Deployment scope | One or few factory sites | Hub + east + west spokes from one Git repo |
| GitOps | Pattern-focused repo | ApplicationSet pushes `east/` and `west/` charts remotely |
| Cross-cluster access | Per-site ingress | Hub Gateway + Skupper listeners on hub |
| Observability | Local Grafana/Prometheus | Hub Grafana with Prometheus-East/West datasources |
| Provisioning | Manual / pattern install | Developer Hub templates target `east` or `west` |
| Data lake | Central + factory sites | MirrorMaker + hub `prod-cluster` / MinIO archiver |

Each spoke runs an **identical** Industrial Edge stack independently — the hub does **not** host factory sensor workloads.

## Factory pattern

Factories emit telemetry through MQTT brokers and Camel K integrations. Kubernetes namespaces isolate teams while GitOps keeps spoke clusters aligned with approved Git revisions.

Each spoke (east/west) runs the same stack independently — the hub aggregates metrics and provides gateway access to line-dashboard and API endpoints.

## Data stack (per spoke)

| Stage | Component | Namespace |
| --- | --- | --- |
| Ingress | AMQ Broker (MQTT acceptors), machine sensors | `industrial-edge-tst-all` |
| Integration | Camel K routes (MQTT→Kafka, Kafka→S3) | `industrial-edge-tst-all` |
| Streaming | AMQ Streams / Kafka `dev-cluster` topics | `industrial-edge-tst-all` |
| Replication | Strimzi MirrorMaker (factory→data-lake) | `industrial-edge-stormshift-messaging` |
| Data lake | `prod-cluster` Kafka + Camel S3 archiver | `industrial-edge-data-lake` |
| Processing | OpenShift AI (KServe InferenceService) | `industrial-edge-tst-all` |
| CI/CD | Tekton pipelines (buildah + deploy) | `industrial-edge-ci` |
| Visualization | `line-dashboard` (WebSocket consumer) | `industrial-edge-tst-all` |

[![OpenShift AI — model serving and inference](/images/hybrid-mesh-platform/workshop-openshift-ai.png)](/images/hybrid-mesh-platform/workshop-openshift-ai.png)

_OpenShift AI on the hub: DataScienceCluster provides model serving (KServe), notebooks, and ML pipelines. Spoke workloads call inference endpoints via Skupper._

[![OpenShift AI — KServe inference on spoke](/images/hybrid-mesh-platform/openshift-ia.png)](/images/hybrid-mesh-platform/openshift-ia.png)

_KServe InferenceService on spoke: anomaly detection model scores temperature and vibration data from factory sensors in real time._

End-to-end on a spoke: sensor → MQTT → Camel K → Kafka → optional ML → dashboard; MirrorMaker streams toward centralized storage for model training (see [Architecture](architecture#follow-the-request--one-temperature-reading-end-to-end)).

## Camel K integrations

The `mqtt-to-kafka` integration bridges sensor data from the AMQ Broker to Kafka topics. It runs as a Camel K `Integration` CR deployed by the `industrial-edge-tst` chart.

The **Camel Kaoto** software template in Developer Hub scaffolds additional routes with a DevSpaces-ready project:

- MQTT→Kafka route (temperature, vibration)
- Kafka→S3/MinIO archiver (data lake)
- Alert→Mailpit route (anomaly notifications)
- Kaoto visual editor + Continue AI code assistant

**Scaffold:** Developer Hub → Create → Industrial Edge — Camel Routes (Kaoto + Continue AI) → choose **east** or **west**.

## Spoke Argo CD Applications

Each spoke deploys these Applications (generated from `east/` or `west/` charts):

| Application | Chart | Purpose |
| --- | --- | --- |
| `industrial-edge-tst` | `components/industrial-edge-tst` | Sensors, broker, Kafka, Camel, dashboard, ML |
| `industrial-edge-stormshift` | `components/industrial-edge-stormshift` | Factory Kafka + MirrorMaker |
| `industrial-edge-data-lake` | `components/industrial-edge-data-lake` | prod-cluster + S3 archiver |
| `industrial-edge-pipelines` | `components/industrial-edge-pipelines` | Tekton build-and-test pipeline |

Industrial Edge Applications exist **only** on spokes — never on the hub chart.

## Service mesh (ambient mode)

Industrial Edge namespaces run under OSSM 3 ambient mesh with ztunnel L4 metrics. Namespace `industrial-edge-tst-all` carries `istio.io/dataplane-mode: ambient`.

Ztunnel captures `istio_tcp_connections_opened_total` and related L4 series; L7 `istio_requests_total` flows through waypoint gateways where deployed.

**Exceptions** (stay off ambient):

- `spoke-gateway-system` — gateway TLS and ExternalName routing
- `industrial-edge-data-lake` — MinIO TLS and object-store compatibility

## Cross-cluster exposure

| Mechanism | Role |
| --- | --- |
| **Spoke Gateway** | Aggregates Industrial Edge services per spoke for one Skupper Connector |
| **Hub Gateway** | Routes browser traffic to east/west front and API backends with circuit breaking |
| **Skupper** | Listeners `ie-gateway-*`, `prometheus-*`, `kafka-*` on hub |

Deploy new edge instances on east or west via [Scaffolding](scaffolding). Verify traffic in [Observability](observability) and [Hub Gateway](hub-gateway).

## References

- [Industrial Edge Validated Pattern](/patterns/industrial-edge/)
- [Multicloud GitOps](/patterns/multicloud-gitops) — fleet GitOps foundation
- [Pattern repository](https://github.com/maximilianoPizarro/hybrid-mesh-platform) — charts under `charts/all/` (`industrial-edge-tst`, `industrial-edge-stormshift`, `industrial-edge-pipelines`, data lake charts)
