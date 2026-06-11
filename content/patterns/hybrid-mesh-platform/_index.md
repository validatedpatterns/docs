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
tested_on:
  platform: AWS
  ocp_version: "4.20"
  topology: "3 clusters (hub + east spoke + west spoke)"
contributor:
  name: Maximiliano Pizarro
  contact: mailto:maximilianopizarro5@gmail.com
  git: https://github.com/maximilianoPizarro
---

# Hybrid Mesh Platform

**Maintainer:** Maximiliano Pizarro, Specialist Solution Architect at Red Hat

> **Your journey:** This platform deploys in one `helm upgrade`, connects three OpenShift clusters (hub + east + west), and shows IoT sensor data across Grafana and Developer Hub within about 30 minutes. The pages below follow one continuous story — concept, install, operate, scaffold — so you can read straight through or jump to any chapter.

**Hybrid Mesh Platform** is a multi-cluster GitOps platform using Red Hat products. It implements a hub-spoke topology that centralizes governance with Red Hat Advanced Cluster Management (ACM), delivers [Industrial Edge](/patterns/industrial-edge/) workloads on regional spokes, uses OpenShift Service Mesh in ambient mode for east-west connectivity, layers Connectivity Link (Kuadrant) for API-aware ingress policy, exposes Grafana dashboards for cross-cluster visibility, and integrates Advanced Cluster Security (ACS) for vulnerability and runtime protection.

**Tested on:** Red Hat OpenShift Container Platform **4.20** on **AWS** (hub + east spoke + west spoke, multinode 3 workers each). Compatible with 4.14+ per cluster.

**Current release:** [ocp-420-v5](https://github.com/maximilianoPizarro/platform-hub-spoke-config/releases/tag/ocp-420-v5) — Camel Dashboard on east/west spokes, Skupper token sync, Kafka Console broker DNS fixes.

Read **concept → mechanics → operations**: start with [Architecture](architecture), install via [Getting Started](getting-started), scaffold workloads via [Scaffolding](scaffolding), then use platform chapters (**Hub Gateway**, **Observability**, **Industrial Edge**) before drilling into the [pattern repository](https://github.com/maximilianopizarro/platform-hub-spoke-config).

## Overview

This repository models a **GitOps-first platform** where:

- **Hub cluster** runs ACM, OpenShift GitOps (Argo CD), observability aggregation, Developer Hub, ACS Central, Mailpit for notifications, and gateway-style HTTP routing with **circuit breaking** for shared services.
- **Spoke clusters** (east/west regions) host **Industrial Edge** patterns: sensor and MQTT-style ingestion, Kafka pipelines, optional ML scoring, and dashboards fed by Prometheus-compatible metrics.
- **Service Mesh 3 ambient** reduces sidecar overhead while retaining ztunnel-based L4 and waypoint-based L7 policy where needed.
- **Hub Gateway** splits traffic into **front** and **API** services per spoke, with per-service **circuit breaking** via `DestinationRule`.
- **Service Interconnect (Skupper)** bridges spoke services and metrics to the hub via a Virtual Application Network (VAN), without VPN or firewall changes.
- **Spoke Gateways** aggregate Industrial Edge services per spoke for simplified cross-cluster exposure.
- **Kiali + OSSM Console** provides service mesh topology visualization on every cluster via the OpenShift Console plugin.
- **Grafana dashboards** roll up cluster and application signals from all clusters.
- **ACS** provides centralized policy, CVE visibility, and SecuredCluster agents on spokes.

[![Platform hub-spoke overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

_Hub cluster aggregates observability and Developer Hub; east and west spokes run Industrial Edge workloads connected via Service Interconnect (Skupper). Click the image to open the full diagram._

Architecture diagrams illustrate Git, **ACM fleet management**, **ACS Central**, Skupper VAN, Connectivity Link, and Industrial Edge on east/west — use them as the visual companion to the install chapters (see [Architecture](architecture) for ACM and ACS console views).

## Quick links

| Topic | Page |
| --- | --- |
| Architecture deep dive | [Architecture](architecture) |
| Install flow | [Getting Started](getting-started) |
| Hub Gateway and Connectivity Link | [Hub Gateway](hub-gateway) |
| Observability | [Observability](observability) |
| Industrial Edge (multi-cluster) | [Industrial Edge](industrial-edge) |
| Scaffolding | [Scaffolding](scaffolding) |
| Branch strategy and customization | [Ideas for customization](ideas-for-customization) |

## Recommended reading order

1. [Architecture](architecture) — mental model of hub, spokes, GitOps, Skupper, and observability
2. [Getting Started](getting-started) — bring clusters under GitOps (includes ACM + ApplicationSet detail)
3. [Scaffolding](scaffolding) — deploy Industrial Edge instances on east/west from Developer Hub
4. [Hub Gateway](hub-gateway) — weighted ingress and circuit breaking across spokes
5. [Observability](observability) — Grafana, Kiali, Kafka Console
6. [Industrial Edge](industrial-edge) — factory data pipeline: sensors, Kafka, Camel, ML on multiple spokes

Screenshots and architecture diagrams in the pattern repository support full-screen review — handy after deploying dashboards and verifying cross-cluster traffic.

**Next →** [Architecture](architecture) — understand how Git, ACM, and Skupper wire the three clusters together.

## Workshop

A hands-on **Hybrid Mesh AI Workshop** (dual-track: executive strategy + hands-on lab) is available for this platform. It covers ACM fleet management, ambient mesh, Developer Hub scaffolding, OpenShift AI, Kuadrant API gateway, and FinOps — all on a live RHDP hub-spoke fleet. See the [workshop site](https://maximilianopizarro.github.io/platform-hub-spoke-config/workshop/) for agenda and registration.

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
- Red Hat OpenShift Dev Spaces (Kaoto, Continue AI)
- Red Hat OpenShift Virtualization (KubeVirt)
- Red Hat Quay (container registry on hub)
- Red Hat Service Interconnect (Skupper)
- Streams for Apache Kafka Console (hub fleet UI)
- Gitea (in-cluster Git for scaffolder repos)
- Mailpit (SMTP testing for notifications)
- Observability stack (Prometheus-compatible metrics, Grafana, OpenTelemetry, Kiali)
