---
title: Hub Gateway
weight: 30
aliases: /hybrid-mesh-platform/hub-gateway/
---

# Hub Gateway

The hub gateway provides centralized HTTP ingress on the hub cluster with behaviors similar to an F5 BIG-IP ADC: VIP-style routing, TLS termination at the edge, and weighted traffic splits across backend services or spoke-derived routes.

Implementation chart: `components/hub-gateway`.

[![Hub gateway](/images/hybrid-mesh-platform/connectivity-link-hub-gateway.png)](/images/hybrid-mesh-platform/connectivity-link-hub-gateway.png)

[![Spoke gateway](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)

## Gateway API theory

Kubernetes Gateway API separates concerns:

| Resource | Role |
| --- | --- |
| `Gateway` | Listens on addresses and ports; attaches TLS and listener policies |
| `HTTPRoute` | Attaches to a `Gateway`; selects backend `Service` resources with matches, filters, and weighted backends |

Weighted rules enable canary or active-active distributions between service versions or regions when paired with mesh or multi-cluster DNS strategies.

## Cross-cluster routing architecture

The hub gateway routes traffic to spoke OpenShift Routes via `ExternalName` services:

```
Browser
  → Hub OpenShift Router (HTTPS)
  → Istio Gateway (port 8080)
  → Waypoint Proxy (circuit breaking)
  → ExternalName Service (east or west)
  → Spoke OpenShift Router (HTTP:80)
  → Backend Pod
```

### Front / API split

Traffic uses separate `Service` objects per cluster and traffic type so Kiali and Grafana see distinct destinations:

| Service | Purpose |
| --- | --- |
| `industrial-edge-east-front` | Static frontend assets for east spoke |
| `industrial-edge-east-api` | Socket.IO / API backend for east spoke |
| `industrial-edge-west-front` | Static frontend assets for west spoke |
| `industrial-edge-west-api` | Socket.IO / API backend for west spoke |

All four services use `ExternalName` pointing at the spoke Route hostname. Istio still tracks them as separate destination nodes in the traffic graph.

### HTTPRoute rules

1. **`/api/*`** → `*-api` services (default **east 100%**, **west 0%** for Socket.IO session affinity)
2. **Catch-all `/*`** → `*-front` services (split by `gateway.weights.east` / `gateway.weights.west`)

Override API weights with `gateway.apiWeights` when your application supports cross-cluster API load balancing.

### Key requirements

| Requirement | Reason |
| --- | --- |
| HTTP port **80** to spokes | Ambient gateways do not apply `DestinationRule` TLS to ExternalName backends; HTTPS causes `CERTIFICATE_VERIFY_FAILED` |
| `insecureEdgeTerminationPolicy: Allow` on spoke Routes | Permits HTTP from hub Envoy to spoke router |
| `ServiceEntry` per external host | Without it, Envoy has no cluster definition → HTTP 500 |
| Per-backend **Host** header rewrite | Spoke router routes by `Host` |
| Session affinity on `/api` | Socket.IO polling and WebSocket upgrade must hit the same backend |

## Circuit breaking

Each `ExternalName` service gets a `DestinationRule` with `outlierDetection` and `connectionPool`, enforced by `hub-gateway-system-waypoint` (Istio ambient L7).

### Default configuration (demo profile)

| Parameter | Default | Purpose |
| --- | --- | --- |
| `connectionPool.tcp.maxConnections` | 100 | Max concurrent TCP connections |
| `connectionPool.http.h2UpgradePolicy` | `DO_NOT_UPGRADE` | Spokes expect HTTP/1.1 |
| `connectionPool.http.maxRequestsPerConnection` | 10 | Force connection recycling |
| `outlierDetection.consecutive5xxErrors` | 3 | Eject after 3 consecutive 5xx |
| `outlierDetection.interval` | 10s | Health check interval |
| `outlierDetection.baseEjectionTime` | 30s | Minimum ejection duration |
| `outlierDetection.maxEjectionPercent` | 100 | Required when only one endpoint exists |

`maxEjectionPercent: 100` is required because each ExternalName resolves to a single endpoint; otherwise Istio refuses to eject the last host.

### Override circuit breaker values

```yaml
gateway:
  circuitBreaking:
    enabled: true
    outlierDetection:
      consecutive5xxErrors: 5
      baseEjectionTime: 60s
```

Set `enabled: false` to disable circuit breaking entirely.

## Relationship to Connectivity Link

Connectivity Link (Kuadrant) layers DNS automation, TLS policies, and advanced controls atop Gateway API. Start with plain HTTPRoutes for incremental adoption; enable Kuadrant policies when teams require DNS/TLS/rate-limit governance at scale.

## IoT Dashboard integration

The Industrial Edge `line-dashboard` (`iot-frontend`) requires an `iot-consumer` sidecar:

- Bridges MQTT to WebSocket via Socket.IO
- ConfigMap `config.json` with `websocketHost: ""` (empty = same origin)
- Spoke Route `/api` → port 3000 (`iot-consumer`)
- Hub gateway proxies `/api` to the correct spoke backend where Socket.IO terminates

## Operational notes

- Align hostnames with `deployer.domain` and corporate DNS wildcard records
- Combine with Service Mesh ambient when east-west encryption between gateway hops and workloads matters
- Monitor gateway Envoy metrics at port 15020 `/stats/prometheus`
- Generate traffic through `hub-gateway-istio` or waypoints before expecting L7 panels in Grafana

## References

- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Connectivity Link documentation](https://docs.redhat.com/en/documentation/red_hat_connectivity_link/)
- [Istio DestinationRule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)

**Next →** [Observability](observability) for Grafana and Kiali across clusters.
