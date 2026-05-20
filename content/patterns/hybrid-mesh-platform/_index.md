---
title: Hybrid Mesh Platform
date: 2026-05-20
tier: sandbox
summary: Multi-cluster GitOps platform using a hub-spoke topology with ACM, OpenShift Service Mesh, ACS, and Industrial Edge workloads on OpenShift 4.20.
rh_products:
  - Red Hat OpenShift Container Platform
  - Red Hat Advanced Cluster Management
  - Red Hat OpenShift GitOps
  - Red Hat Advanced Cluster Security for Kubernetes
  - Red Hat OpenShift Service Mesh
  - Red Hat Connectivity Link
  - Red Hat OpenShift AI
  - Red Hat AMQ Streams
  - Red Hat build of Apache Camel
  - Red Hat OpenShift Pipelines
  - Red Hat Developer Hub
  - Red Hat Service Interconnect
industries:
  - General
  - Industrial
aliases: /hybrid-mesh-platform/
links:
  github: https://github.com/maximilianopizarro/platform-hub-spoke-config
  install: getting-started
  bugs: https://github.com/maximilianopizarro/platform-hub-spoke-config/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
contributor:
  name: Maximiliano Pizarro
  contact: mailto:maximilianopizarro5@gmail.com
  git: https://github.com/maximilianoPizarro
---

# Hybrid Mesh Platform

**Maintainer:** Maximiliano Pizarro, Specialist Solution Architect at Red Hat

This platform deploys in one `helm upgrade`, connects three OpenShift clusters (hub + east + west), and shows IoT sensor data across Grafana and Developer Hub within about 30 minutes. The pages below follow one continuous story — concept, install, operate, scaffold — so you can read straight through or jump to any chapter.

Multi-cluster GitOps platform using Red Hat products — a hub-spoke topology that centralizes governance with Red Hat Advanced Cluster Management (ACM), delivers [Industrial Edge](/patterns/industrial-edge/) workloads on regional spokes, uses OpenShift Service Mesh in ambient mode for east-west connectivity, layers Connectivity Link (Kuadrant) for API-aware ingress policy, exposes Grafana dashboards for cross-cluster visibility, and integrates Advanced Cluster Security (ACS) for vulnerability and runtime protection.

**Supported on:** Red Hat OpenShift Container Platform 4.20 (and 4.14 or newer per cluster).

Read **concept → mechanics → operations**: start with [Architecture](architecture), install via [Getting Started](getting-started), scaffold workloads via [Scaffolding](scaffolding), then use platform chapters (Hub Gateway, Observability, Industrial Edge) before drilling into the pattern repository.

## Overview

This repository models a **GitOps-first platform** where:

- **Hub cluster** runs ACM, OpenShift GitOps (Argo CD), observability aggregation, Developer Hub, ACS Central, Mailpit for notifications, and gateway-style HTTP routing with circuit breaking for shared services.
- **Spoke clusters** (east/west regions) host **Industrial Edge** workloads: sensor and MQTT-style ingestion, Kafka pipelines, optional ML scoring, and dashboards fed by Prometheus-compatible metrics.
- **Service Mesh 3 ambient** reduces sidecar overhead while retaining ztunnel-based L4 and waypoint-based L7 policy where needed.
- **Hub Gateway** splits traffic into front and API services per spoke, with per-service **circuit breaking** via `DestinationRule`.
- **Service Interconnect (Skupper)** bridges spoke services and metrics to the hub via a Virtual Application Network, without VPN or firewall changes.
- **Spoke Gateways** aggregate Industrial Edge services per spoke for simplified cross-cluster exposure.
- **Kiali + OSSM Console** provides service mesh topology visualization on every cluster via the OpenShift Console plugin.
- **Grafana dashboards** roll up cluster and application signals from all clusters.
- **ACS** provides centralized policy, CVE visibility, and SecuredCluster agents on spokes.

[![Platform hub-spoke overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

_Hub cluster aggregates observability and Developer Hub; east and west spokes run Industrial Edge workloads connected via Service Interconnect (Skupper)._

## Quick links

| Topic | Page |
| --- | --- |
| Architecture deep dive | [Architecture](architecture) |
| Install flow | [Getting Started](getting-started) |
| Hub Gateway | [Hub Gateway](hub-gateway) |
| Observability | [Observability](observability) |
| Industrial Edge (multi-cluster) | [Industrial Edge](industrial-edge) |
| Scaffolding | [Scaffolding](scaffolding) |
| Customization | [Ideas for customization](ideas-for-customization) |

## Recommended reading order

1. [Architecture](architecture) — mental model of hub, spokes, GitOps, and observability
2. [Getting Started](getting-started) — bring clusters under GitOps
3. [Scaffolding](scaffolding) — deploy Industrial Edge instances on east/west from Developer Hub
4. [Hub Gateway](hub-gateway) — weighted ingress and circuit breaking across spokes
5. [Observability](observability) — Grafana, Kiali, Kafka Console
6. [Industrial Edge](industrial-edge) — factory data pipeline on multiple spokes

## Red Hat products used

- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management for Kubernetes
- Red Hat OpenShift GitOps (Argo CD)
- Red Hat Advanced Cluster Security for Kubernetes
- Red Hat OpenShift Service Mesh
- Red Hat Connectivity Link (Kuadrant, Gateway API)
- Red Hat OpenShift AI
- Red Hat AMQ Streams (Apache Kafka)
- Red Hat build of Apache Camel / Camel K
- Red Hat OpenShift Pipelines (Tekton)
- Red Hat Developer Hub (Backstage)
- Red Hat Service Interconnect (Skupper)
