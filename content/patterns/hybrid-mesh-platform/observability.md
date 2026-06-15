---
title: Observability
weight: 40
aliases: /hybrid-mesh-platform/observability/
---

# Observability

Observability ties together metrics, logs, traces, and mesh visualization so operators can compare east and west Industrial Edge clusters from the hub. It sits between [Architecture](architecture) (why telemetry crosses Skupper) and [Industrial Edge](industrial-edge) (what applications emit).

Grafana panels, Kiali graphs, and Kafka Console views help you confirm that factory telemetry and mesh traffic match the architecture diagrams after install.

[![Observability overview](/images/hybrid-mesh-platform/workshop-observability.png)](/images/hybrid-mesh-platform/workshop-observability.png)

_Observability stack overview: Grafana for multi-cluster dashboards, Kiali for mesh topology, Kafka Console for streaming health, and OpenTelemetry for distributed traces._

## How cross-cluster metrics flow

Spoke clusters scrape their own Prometheus metrics (Kafka JMX, ztunnel L4, workload RED signals). An **nginx auth proxy** in front of Thanos Querier injects a bearer token, and a **Skupper Connector** exposes it on port 9091. On the hub, Skupper **Listeners** `prometheus-east` and `prometheus-west` materialize as ClusterIP services that Grafana queries as plain HTTP datasources — no spoke tokens are stored on the hub.

[![Observability pipeline](/images/hybrid-mesh-platform/arch-observability-pipeline.png)](/images/hybrid-mesh-platform/arch-observability-pipeline.png)

_Architecture: spoke Prometheus → nginx auth proxy → Skupper connector → hub listener → Grafana datasource._

## Grafana — multi-cluster dashboards

Hub Grafana aggregates three datasources: local hub Thanos plus `prometheus-east` and `prometheus-west` via Skupper. Dashboards are deployed by the `components/grafana-dashboards` chart.

[![Grafana multi-cluster dashboards](/images/hybrid-mesh-platform/product-grafana-observability.png)](/images/hybrid-mesh-platform/product-grafana-observability.png)

_Hub Grafana landing — fleet dashboards organized by cluster and workload type._

The **east-west-traffic** dashboard shows Kafka broker health (gauges), leader/partition distribution (pie), and API request rates (bargauge) across both spokes:

[![Grafana — east-west traffic and Service Mesh](/images/hybrid-mesh-platform/product-grafana-observability-2.png)](/images/hybrid-mesh-platform/product-grafana-observability-2.png)

_East-west traffic: broker state gauges, leader distribution, and API request bargauges per cluster._

The **multi-cluster-istio** dashboard plots L4 ztunnel TCP connections, bytes timeseries, and cross-cluster error rates:

[![Grafana — multi-cluster Istio metrics (ztunnel L4)](/images/hybrid-mesh-platform/product-grafana-observability-3.png)](/images/hybrid-mesh-platform/product-grafana-observability-3.png)

_Multi-cluster Istio: ztunnel TCP connections, bytes sent/received, error rate per cluster._

Extended KPI panels combine Kafka and mesh signals for a single operational health view:

[![Grafana — extended fleet KPI panels](/images/hybrid-mesh-platform/product-grafana-observability-4.png)](/images/hybrid-mesh-platform/product-grafana-observability-4.png)

_Fleet KPI: combined Kafka + mesh health across all clusters._

## Kiali — mesh topology visualization

Each cluster runs Kiali with an OSSMConsole CR (OpenShift Console plugin). On the hub, Kiali shows multi-cluster topology using remote secrets — without requiring Istio multi-cluster trust federation. With ztunnel active, the graph shows L4 connections; L7 detail appears for paths routed through waypoints.

[![Kiali service mesh](/images/hybrid-mesh-platform/product-kiali-service-mesh.png)](/images/hybrid-mesh-platform/product-kiali-service-mesh.png)

_Kiali traffic graph: L4 ztunnel connections between hub gateway and spoke services._

[![Kiali — service mesh traffic graph](/images/hybrid-mesh-platform/product-kiali-service-mesh-2.png)](/images/hybrid-mesh-platform/product-kiali-service-mesh-2.png)

_Kiali detail view: per-service traffic rates, error percentages, and response time distributions._

## Kafka Console — streaming health across clusters

The Streams for Apache Kafka Console on the hub registers hub `prod-cluster` (full metrics) plus spoke `dev-cluster` and `factory-cluster` via Skupper bootstrap listeners. Operators can view topics, consumer groups, partitions, and broker status from a single UI.

[![Kafka Console](/images/hybrid-mesh-platform/product-kafka-console-amq-streams.png)](/images/hybrid-mesh-platform/product-kafka-console-amq-streams.png)

_Kafka Console landing: five registered clusters (hub + east/west × dev/factory)._

[![Kafka Console — multi-cluster clusters and topics](/images/hybrid-mesh-platform/product-kafka-console-amq-streams-2.png)](/images/hybrid-mesh-platform/product-kafka-console-amq-streams-2.png)

_Cluster detail: topics, partitions, and replicas per spoke Kafka cluster over Skupper._

[![Kafka Console — broker and topic detail over Skupper](/images/hybrid-mesh-platform/product-kafka-console-amq-streams-3.png)](/images/hybrid-mesh-platform/product-kafka-console-amq-streams-3.png)

_Broker and topic metrics: producer/consumer rates, lag, and partition leadership distribution._

## Observability architecture

| Layer | Technology | Role |
| --- | --- | --- |
| Metrics | User Workload Monitoring / Prometheus | RED/USE signals, Kafka lag, mesh L4/L7 stats |
| Dashboards (hub) | Grafana + multi-cluster datasources | Fleet and factory KPI views (`components/grafana-dashboards`) |
| Dashboards (spoke) | Grafana local | Per-cluster ztunnel L4, Kafka, workloads (`components/spoke-dashboards`) |
| Mesh UI | Kiali + OSSM Console plugin | Traffic graphs in OpenShift Console |
| Kafka UI | Streams for Apache Kafka Console | Hub UI for all spoke Kafka clusters (`components/kafka-console`) |
| Cross-cluster metrics | Skupper + Grafana datasource | Prometheus via VAN |
| Tracing | OpenTelemetry Collector | Distributed traces (`components/opentelemetry`) |
| Mesh scraping | `components/istio-monitoring` | istiod, gateways, waypoints, ztunnel, Kafka JMX |

**Hub:** Grafana aggregates hub Thanos plus HTTP datasources `prometheus-east` / `prometheus-west` (Skupper listeners). Kafka Console registers hub `prod-cluster` and remote bootstrap services over Skupper.

**Spokes:** Local Grafana and Kiali use local Thanos. Connectors expose Thanos and Kafka bootstrap to the hub.

## Service Mesh metrics (OSSM 3 ambient + ztunnel)

Use channel **`stable-3.2`** for the Service Mesh operator. Tech Preview (`candidates` / 3.0.0-tp.2) does **not** deploy ztunnel.

| Metric | Producer | Notes |
| --- | --- | --- |
| `istio_tcp_connections_opened_total` | ztunnel | Primary spoke/hub L4 signal |
| `istio_tcp_sent_bytes_total` / `received` | ztunnel | Bytes per workload namespace |
| `istio_requests_total` | Waypoints, ingress gateways | L7; hub `hub-gateway-istio` when traffic flows |
| `kafka_server_kafkaserver_brokerstate` | Strimzi JMX | `3` = Running — use in gauge panels |
| `kafka_network_requestmetrics_requestspersec_total` | Strimzi JMX | API activity — bargauge panels |
| `kafka_server_replicamanager_leadercount` / `partitioncount` | Strimzi JMX | piechart / bargauge on fleet views |

### Prerequisite: ambient profile on Istio CNI

`IstioCNI` CR must include `profile: ambient`. Namespace-only ambient labels are insufficient — without the profile, ztunnel never becomes Ready and `istio_tcp_*` series are absent.

Grant UWM `ClusterRoleBinding` to `cluster-monitoring-view` in `istio-system`, `ztunnel`, `hub-gateway-system`, and Industrial Edge namespaces.

```bash
oc get ds -n ztunnel
oc logs -n istio-cni $(oc get pods -n istio-cni -o name | head -1) | grep AmbientEnabled
# Expect: AmbientEnabled: true
```

## Kiali and OSSM Console plugin

Each cluster runs Kiali with an OSSMConsole CR. The dynamic plugin adds **Service Mesh** to the OpenShift Console.

### Fixing 401 Unauthorized on the plugin

The plugin proxies API calls to Kiali, which queries Thanos Querier (`:9091`). Kiali's service account needs cluster monitoring read access:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kiali-monitoring-rbac
roleRef:
  kind: ClusterRole
  name: cluster-monitoring-view
subjects:
- kind: ServiceAccount
  name: kiali-service-account
  namespace: openshift-cluster-observability-operator
```

Kiali CR `external_services.prometheus`:

```yaml
prometheus:
  auth:
    type: bearer
    use_kiali_token: true
  thanos_proxy:
    enabled: true
  url: https://thanos-querier.openshift-monitoring.svc.cluster.local:9091
```

With ztunnel running, Kiali shows **L4** traffic graphs; **L7** appears for HTTP routed through waypoints.

Hub Kiali multi-cluster details: [Getting Started — Kiali](getting-started#step-7-kiali-multi-cluster-hub).

## Grafana + Thanos (dashboards with data)

**Hub Grafana** uses a ServiceAccount token for local Thanos and HTTP URLs for remote spokes (Skupper auth proxy injects bearer token — hub Grafana does not store spoke tokens).

**Spoke Grafana** uses local Prometheus/Thanos only. Do not point spoke dashboards at hub Skupper listener names unless intentionally cross-querying.

| Dashboard | Visualizations | Data sources |
| --- | --- | --- |
| `east-west-traffic` | Gauges (broker state), donut pie (leaders East/West), bargauge (partitions, Kafka API req/s) | Hub + Prometheus-East/West |
| `multi-cluster-istio` | Timeseries + L4 bargauge per cluster | Mixed datasources |
| `local-metrics` | ztunnel readiness gauge, Kafka bargauge/piechart, L4 timeseries | Local Thanos per spoke |

Notes:

- Hub gateway / Istio HTTP panels may show **no data** until clients generate traffic through `hub-gateway-istio` or waypoints
- Kafka panels use `kafka_network_requestmetrics_*` and `kafka_server_replicamanager_*` — not legacy `brokertopicmetrics` with `_objectname` filters

Enable User Workload Monitoring on spokes:

```yaml
# cluster-monitoring-config ConfigMap
enableUserWorkload: true
```

## Multi-cluster metrics via Skupper

On each spoke, Thanos Querier sits behind an nginx **auth proxy** (injects bearer token). Skupper Connector exposes the proxy; hub Listener `prometheus-east` / `prometheus-west` becomes a Grafana HTTP datasource.

See [Architecture — Service Interconnect](architecture#service-interconnect-skupper-topology) for listener/connector names.

## Kafka Console (hub)

The Streams for Apache Kafka Console on the hub registers:

- `prod-cluster` (hub, full metrics in `industrial-edge-data-lake`)
- dev/factory clusters on east and west via Skupper bootstrap listeners

### Metrics configuration

`metricsSources` type `openshift-monitoring` is broken in Console operator 0.12.x (`Prometheus URL is not configured` in logs). Use **`type: standalone`**:

- URL: `https://thanos-querier.openshift-monitoring.svc.cluster.local:9091`
- Bearer token via `kubernetes.io/service-account-token` Secret
- TrustStore: `openshift-service-ca.crt` ConfigMap (PEM)
- `ClusterRoleBinding` for `cluster-monitoring-view`

Each `kafkaCluster` entry **must** include `namespace` — without it, logs report `namespace is required for metrics retrieval`.

Only hub `prod-cluster` shows full broker metrics by default. Spoke clusters over Skupper show topics and nodes; full metrics require broker DNS fixes below.

### Broker DNS over Skupper

Common error: `Timed out waiting for a node assignment` / `listNodes` fails — console reaches bootstrap over Skupper but broker advertised DNS from spokes does not resolve on the hub.

**Fix:**

1. **Spokes:** Strimzi `advertisedHost` per broker with cluster suffix (`dev-cluster-broker-0-east`, and similar)
2. **Hub:** headless Services + `EndpointSlice` in `components/kafka-console/templates/broker-dns.yaml` (Helm `lookup` of Skupper ClusterIPs)

Argo CD excludes `Endpoints` from managed resources — use `EndpointSlice` so broker DNS syncs via GitOps.

Re-sync `kafka-console` after Skupper listeners are healthy. Confirm `listNodes` returns 200 in the Console UI.

## Grafana dashboard inventory

| Dashboard | Scope | Datasources |
| --- | --- | --- |
| `east-west-traffic` | Hub | Hub, Prometheus-East, Prometheus-West |
| `multi-cluster-istio` | Hub | Hub, Prometheus-East, Prometheus-West |
| `local-metrics` | Each spoke | Local Prometheus (UWM/Thanos) |

## AI-assisted operations (Kairos)

The platform integrates AI-driven operational intelligence through event correlation, anomaly detection, and human-in-the-loop workflows:

[![Kairos — worker scaling and SmartScalingPolicy](/images/hybrid-mesh-platform/workshop-kairos-scaling.png)](/images/hybrid-mesh-platform/workshop-kairos-scaling.png)

_Kairos SmartScalingPolicy: AI-driven recommendations for scaling Industrial Edge sensor workers based on Kafka lag and CPU pressure._

[![Kairos — event correlation and alerting](/images/hybrid-mesh-platform/kairos-events.png)](/images/hybrid-mesh-platform/kairos-events.png)

_Event correlation: Kairos aggregates Kubernetes events, Prometheus alerts, and mesh signals to surface actionable incidents._

[![Kairos — historical analysis and trends](/images/hybrid-mesh-platform/kairos-history.png)](/images/hybrid-mesh-platform/kairos-history.png)

_Historical analysis: trend detection across factory shifts, identifying degradation patterns before hard failures._

[![Kairos — human-in-the-loop decision workflows](/images/hybrid-mesh-platform/kairos-human-in-the-loop.png)](/images/hybrid-mesh-platform/kairos-human-in-the-loop.png)

_Human-in-the-loop: Kairos proposes actions (scale, restart, reroute) that require operator approval before execution._

[![Kairos — AI agents for autonomous remediation](/images/hybrid-mesh-platform/kairos-ia-agents.png)](/images/hybrid-mesh-platform/kairos-ia-agents.png)

_AI agents: autonomous remediation for pre-approved scenarios (auto-scale on Kafka consumer lag threshold)._

[![Kairos — observability-driven insights](/images/hybrid-mesh-platform/kairos-observability.png)](/images/hybrid-mesh-platform/kairos-observability.png)

_Observability-driven insights: Kairos correlates Grafana metrics with mesh topology to pinpoint root cause across clusters._

## References

- [OpenShift Observability](https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/monitoring/)
- [Red Hat Service Interconnect 2.1](https://docs.redhat.com/en/documentation/red_hat_service_interconnect/2.1)
- [OSSM 3.2 ambient mode](https://docs.redhat.com/en/documentation/red_hat_openshift_service_mesh/3.2/html/installing/ossm-istio-ambient-mode)
- [Kiali on OSSM 3.2](https://docs.redhat.com/en/documentation/red_hat_openshift_service_mesh/3.2/html/observability/kiali-operator-provided-by-red-hat)

Charts: `components/observability`, `components/grafana-dashboards`, `components/spoke-dashboards`, `components/kiali`, `components/kafka-console`, `components/opentelemetry`, `components/istio-monitoring`, `components/service-interconnect`, `components/spoke-interconnect`.

**Next →** [Industrial Edge](industrial-edge) for the factory data pipeline on multiple spokes.
