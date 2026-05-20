---
title: Hub Gateway
weight: 30
aliases: /hybrid-mesh-platform/hub-gateway/
---

# Hub Gateway

The hub gateway pattern provides centralized HTTP ingress on the hub cluster with behaviors similar to an F5 BIG-IP ADC: VIP-style routing, TLS termination at the edge, and weighted traffic splits across backend services or spoke-derived routes.

[![Hub gateway](/images/hybrid-mesh-platform/connectivity-link-hub-gateway.png)](/images/hybrid-mesh-platform/connectivity-link-hub-gateway.png)

[![Spoke gateway](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)](/images/hybrid-mesh-platform/connectivity-link-spoke-gateway.png)

## Gateway API theory

Kubernetes Gateway API separates concerns:

- `Gateway` — listens on addresses and ports; attaches TLS and listener policies.
- `HTTPRoute` — attaches to a `Gateway` and selects backend `Service` resources with matches, filters, and weighted backends.

Weighted rules enable canary or active-active distributions between service versions or regions when paired with mesh or multi-cluster DNS strategies.

## Cross-cluster routing architecture

The hub gateway routes traffic to spoke cluster OpenShift Routes via `ExternalName` services:

```
Browser → Hub OpenShift Router (HTTPS)
       → Istio Gateway (port 8080)
       → Waypoint Proxy (circuit breaking)
       → ExternalName Service (east/west)
       → Spoke OpenShift Router (HTTP:80)
       → Backend Pod
```

### Front / API split

Traffic is split into separate `Service` objects per cluster and traffic type:

| Service | Purpose |
| --- | --- |
| `industrial-edge-east-front` | Static frontend assets for east spoke |
| `industrial-edge-east-api` | Socket.IO / API backend for east spoke |
| `industrial-edge-west-front` | Static frontend assets for west spoke |
| `industrial-edge-west-api` | Socket.IO / API backend for west spoke |

All four services use `ExternalName` pointing to the same spoke Route hostname, but Istio tracks them as distinct destinations.

The `HTTPRoute` uses two rules:

1. `/api` prefix → routed to `*-api` services (defaults to east 100%, west 0% for Socket.IO session affinity).
2. Catch-all → routed to `*-front` services (split by `gateway.weights.east` / `west`).

Override API weights with `gateway.apiWeights` in values when your application supports cross-cluster API load balancing.

### Key requirements

- **HTTP port 80, not HTTPS** — Istio ambient mode gateways do not apply `DestinationRule` TLS settings on ExternalName backends. Spoke Routes must set `insecureEdgeTerminationPolicy: Allow`.
- **ServiceEntry** for each external host — without a `ServiceEntry`, Envoy returns HTTP 500.
- **Per-backend Host header rewrite** — the spoke OpenShift router routes by `Host` header.
- **Session affinity for Socket.IO** — the `/api` rule pins to a single spoke by default.

## Circuit breaking

Each `ExternalName` service gets a `DestinationRule` with `outlierDetection` and `connectionPool` settings, enforced by the `hub-gateway-system-waypoint` proxy (Istio ambient L7).

| Parameter | Default | Purpose |
| --- | --- | --- |
| `connectionPool.tcp.maxConnections` | 100 | Max concurrent TCP connections |
| `outlierDetection.consecutive5xxErrors` | 3 | Eject after 3 consecutive 5xx |
| `outlierDetection.baseEjectionTime` | 30s | Minimum ejection duration |
| `outlierDetection.maxEjectionPercent` | 100 | Allow ejecting the only endpoint |

Set `gateway.circuitBreaking.*` in the hub-gateway values to override. Set `enabled: false` to disable circuit breaking entirely.

## Relationship to Connectivity Link

Connectivity Link (Kuadrant) layers DNS automation, TLS policies, and advanced controls atop Gateway API. Start with plain HTTPRoutes if you need incremental adoption; enable Kuadrant policies when teams are ready.

## IoT Dashboard integration

The Industrial Edge `line-dashboard` (iot-frontend) requires an `iot-consumer` sidecar:

- `iot-consumer` bridges MQTT to WebSocket via Socket.IO
- Mount a ConfigMap `config.json` with `websocketHost: ""` (empty = same origin)
- Path-based Route `/api` to port 3000 (iot-consumer)
- The hub gateway proxies `/api` requests to the correct spoke backend

## Operational notes

- Keep hostnames aligned with `deployer.domain` and corporate DNS wildcard records.
- Combine with Service Mesh ambient when east-west encryption between gateway hops and workloads matters.
- Monitor the gateway Envoy proxy metrics at port 15020 `/stats/prometheus`.

Implementation chart: `components/hub-gateway`.

## References

- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
- [Connectivity Link documentation](https://docs.redhat.com/en/documentation/red_hat_connectivity_link/)
- [Istio DestinationRule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)
