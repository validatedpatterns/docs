---
title: Observability
weight: 40
aliases: /hybrid-mesh-platform/observability/
---

# Observability

Observability ties together metrics, logs, traces, and mesh visualization so operators can compare east and west Industrial Edge clusters from the hub. It sits between [Architecture](architecture) (why telemetry crosses Skupper) and [Industrial Edge](industrial-edge) (what applications emit).

[![Grafana multi-cluster dashboards](/images/hybrid-mesh-platform/product-grafana-observability.png)](/images/hybrid-mesh-platform/product-grafana-observability.png)

[![Kiali service mesh](/images/hybrid-mesh-platform/product-kiali-service-mesh.png)](/images/hybrid-mesh-platform/product-kiali-service-mesh.png)

[![Kafka Console](/images/hybrid-mesh-platform/product-kafka-console-amq-streams.png)](/images/hybrid-mesh-platform/product-kafka-console-amq-streams.png)

[![Observability pipeline](/images/hybrid-mesh-platform/arch-observability-pipeline.png)](/images/hybrid-mesh-platform/arch-observability-pipeline.png)

## Components

| Layer | Technology | Role |
| --- | --- | --- |
| Metrics | User Workload Monitoring / Prometheus | RED/USE signals, Kafka lag, mesh L4/L7 stats |
| Dashboards (hub) | Grafana + multi-cluster datasources | Fleet and factory KPI views |
| Dashboards (spoke) | Grafana local | Per-cluster ztunnel L4, Kafka, workloads |
| Mesh UI | Kiali + OSSM Console plugin | Traffic graphs in OpenShift Console |
| Kafka UI | Streams for Apache Kafka Console | Hub UI for all spoke Kafka clusters |
| Cross-cluster metrics | Skupper + GrafanaDatasource | Prometheus metrics via VAN |
| Tracing | OpenTelemetry Collector | Distributed traces |

## Service Mesh metrics (OSSM3 ambient + ztunnel)

Use `stable-3.2` for the Service Mesh operator. Tech Preview does not deploy ztunnel.

| Metric | Producer | Notes |
| --- | --- | --- |
| `istio_tcp_connections_opened_total` | ztunnel | Primary spoke/hub L4 signal |
| `istio_tcp_sent_bytes_total` / `received` | ztunnel | Bytes per workload namespace |
| `istio_requests_total` | Waypoints, ingress gateways | L7; hub `hub-gateway-istio` |
| `kafka_server_kafkaserver_brokerstate` | Strimzi JMX | `3` = Running |
| `kafka_network_requestmetrics_requestspersec_total` | Strimzi JMX | API activity |

`IstioCNI` CR must include `profile: ambient`. Without it, ztunnel never becomes Ready and `istio_tcp_*` metrics are absent.

Grant UWM RoleBindings in `istio-system`, `ztunnel`, `hub-gateway-system`, and Industrial Edge namespaces.

Quick validation:

```bash
oc get ds -n ztunnel
oc logs -n istio-cni $(oc get pods -n istio-cni -o name | head -1) | grep AmbientEnabled
# Expect: AmbientEnabled: true
```

## Kiali and OSSM Console plugin

Each cluster runs Kiali with an OSSMConsole CR. The dynamic plugin adds Service Mesh to the OpenShift Console.

Kiali needs `cluster-monitoring-view` for Thanos Querier (`:9091`):

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

## Grafana + Thanos (multi-cluster dashboards)

Hub Grafana uses a ServiceAccount token for local Thanos and HTTP URLs for remote spokes (Skupper auth proxy — no bearer token from hub).

| Dashboard | Visualizations | Data sources |
| --- | --- | --- |
| `east-west-traffic` | Gauges, pie, bargauge (Kafka health) | Hub + Prometheus-East/West |
| `multi-cluster-istio` | Timeseries + L4 bargauge | Mixed datasources |
| `local-metrics` | ztunnel readiness, Kafka, L4 timeseries | Local Thanos per spoke |

Enable User Workload Monitoring on spokes (`enableUserWorkload: true` in `cluster-monitoring-config`).

## Multi-cluster metrics via Skupper

Spoke Thanos is exposed through an Nginx auth proxy on each spoke, then a Skupper Connector. Hub Listeners `prometheus-east` / `prometheus-west` feed Grafana datasources.

## Kafka Console (hub)

The Streams for Apache Kafka Console on the hub registers five clusters: `prod-cluster` (hub) + dev/factory × east/west via Skupper bootstrap services.

Use `type: standalone` for metrics (not `openshift-monitoring` in Console operator 0.12.x). Each `kafkaCluster` entry must include `namespace`.

Only the hub `prod-cluster` displays full metrics. Spoke clusters via Skupper show topics and nodes but limited metrics unless broker DNS is fixed with `advertisedHost` and hub `EndpointSlice` resources.

## Grafana dashboard inventory

| Dashboard | Scope | Datasources |
| --- | --- | --- |
| `east-west-traffic` | Hub | Hub, Prometheus-East, Prometheus-West |
| `multi-cluster-istio` | Hub | Hub, Prometheus-East, Prometheus-West |
| `local-metrics` | Each spoke | Local Prometheus (UWM/Thanos) |

## References

- [OpenShift Observability](https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/monitoring/)
- [Red Hat Service Interconnect](https://docs.redhat.com/en/documentation/red_hat_service_interconnect/2.1)
- [OSSM 3.2 ambient mode](https://docs.redhat.com/en/documentation/red_hat_openshift_service_mesh/3.2/html/installing/ossm-istio-ambient-mode)

Charts: `components/observability`, `components/grafana-dashboards`, `components/spoke-dashboards`, `components/kiali`, `components/kafka-console`, `components/service-interconnect`.
