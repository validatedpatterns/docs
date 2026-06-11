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

## What is Hybrid Mesh Platform?

**Hybrid Mesh Platform** is a production-grade, multi-cluster GitOps reference architecture that mirrors how Red Hat customers run hybrid cloud on OpenShift. It implements a **hub-spoke topology** where:

- A **hub cluster** (OpenShift on AWS) centralizes fleet governance with **ACM**, deploys via **OpenShift GitOps** (Argo CD), hosts the **Developer Hub** internal portal, runs **ACS Central** for security, aggregates observability in **Grafana**, and exposes cross-cluster services through a **Gateway API** hub gateway with circuit breaking.
- Two **spoke clusters** (east and west) execute **Industrial Edge** factory workloads — MQTT sensors, Kafka pipelines, ML inference, and dashboards — connected to the hub via a **Skupper Virtual Application Network** (no VPN or firewall changes).
- **OpenShift Service Mesh 3** in **ambient mode** (no sidecars) provides ztunnel-based L4 encryption and optional waypoint L7 policy across all clusters.
- **Connectivity Link (Kuadrant)** layers API-aware ingress policies — rate limiting, auth, DNS/TLS automation — on top of Gateway API.

The result is a reference design you can adopt, extend, or customize for factory IoT, fleet management, or any workload that requires centralized governance with distributed execution.

**Tested on:** Red Hat OpenShift Container Platform **4.20** on **AWS** (hub + east spoke + west spoke, multinode 3 workers each). Compatible with 4.14+ per cluster.

**Current release:** [ocp-420-v5](https://github.com/maximilianoPizarro/platform-hub-spoke-config/releases/tag/ocp-420-v5) — Camel Dashboard on east/west spokes, Skupper token sync, Kafka Console broker DNS fixes.

Read **concept → mechanics → operations**: start with [Architecture](architecture), install via [Getting Started](getting-started), scaffold workloads via [Scaffolding](scaffolding), then use platform chapters (**Hub Gateway**, **Observability**, **Industrial Edge**) before drilling into the [pattern repository](https://github.com/maximilianopizarro/platform-hub-spoke-config).

[![Hybrid Mesh Platform — hub-spoke architecture](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)

_Hub cluster aggregates observability and Developer Hub; east and west spokes run Industrial Edge workloads connected via Service Interconnect (Skupper). Click the image to open the full diagram._

## Hub-spoke architecture at a glance

The platform simulates a production hybrid mesh:

- **Hub** runs: ACM, OpenShift GitOps (Argo CD), Developer Hub, OpenShift AI, Service Mesh control plane, Skupper, Kuadrant, ACS Central, Grafana, Kafka Console, and Kubecost.
- **East spoke** runs: Industrial Edge workloads, DevSpaces (Kaoto + Continue AI), Kairos SmartScaling, and spoke-local Argo CD.
- **West spoke** runs: Industrial Edge replicas demonstrating cross-cluster traffic, MirrorMaker replication, and Skupper connectivity.

## Service mesh and traffic flow

The platform uses OpenShift Service Mesh 3 in **ambient mode** (no sidecars). Traffic between hub and spokes crosses a Skupper tunnel exposed via Gateway API:

- `HTTPRoute` resources on the hub split traffic to east/west backends (frontend 50/50, API pinned for Socket.IO session affinity)
- `DestinationRule` circuit breaking ejects unhealthy endpoints
- `AuthorizationPolicy` (zero-trust) restricts which service accounts can reach backends

## OpenShift AI — Model as a Service

The AI layer provides a shared LLM endpoint (MaaS) deployed on the hub via the OpenShift AI operator (`DataScienceCluster`). Any application that speaks the OpenAI REST API can consume MaaS without code changes — just point `OPENAI_API_BASE` to the in-cluster service.

## Kuadrant API gateway

Kuadrant manages API rate limiting and auth policies across the hub gateway. Per-user API keys scoped to plans enable controlled access to AI endpoints and workshop APIs via `APIProduct`, `AuthPolicy`, and `TokenRateLimitPolicy`.

[![Platform architecture overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

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

## Workshop — Hybrid Mesh AI

A dual-track **Hybrid Mesh AI Workshop** is available for this platform:

- **Part A (modules 01–05)** — Executive-oriented: hybrid cloud strategy, ROSA architecture, security at scale, AWS AI integration, and real customer cases.
- **Part B (modules 10–28)** — Fully hands-on on a live RHDP hub-spoke fleet: ACM fleet management, ambient mesh, Developer Hub scaffolding, Industrial Edge deployment, Kairos SmartScaling, observability, GitOps, Service Mesh, scalability (HPA + Kafka), network policies, ACS + Connectivity Link, FinOps (Kubecost), OpenShift AI, AI Gateway (MaaS + Kuadrant), and LLM/RAG patterns.

Each module targets a specific product area and includes a `verify` step to confirm work. The lab uses the same three-cluster topology documented here (hub + east + west on AWS).

See the [workshop site](https://maximilianopizarro.github.io/platform-hub-spoke-config/workshop/) for agenda, registration, and YAML snippets.

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
