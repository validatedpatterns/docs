---
title: Hybrid Mesh Platform
date: 2026-06-15
tier: sandbox
summary: Hub-spoke multi-cluster GitOps on OpenShift combining Service Mesh, AI Computer Vision at the Edge, AI-assisted operations (OpenShift Lightspeed + MCP), and a Red Hat Device Edge extension path.
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
focus_areas:
  - Edge
  - DevSecOps
  - AI
  - Observability
aliases: /hybrid-mesh-platform/
links:
  github: https://github.com/maximilianoPizarro/hybrid-mesh-platform
  install: getting-started
  bugs: https://github.com/maximilianoPizarro/hybrid-mesh-platform/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
tested_on:
  platform: AWS
  ocp_version: "4.17+"
  topology: "3 clusters (hub + east spoke + west spoke)"
contributor:
  name: Maximiliano Pizarro
  contact: mailto:maximilianopizarro5@gmail.com
  git: https://github.com/maximilianoPizarro
---

# Hybrid Mesh Platform

**Maintainer:** Maximiliano Pizarro, Specialist Solution Architect at Red Hat

## The problem this pattern solves

Operating a multi-cluster OpenShift fleet creates three compounding challenges that a Service Mesh alone cannot address:

| Challenge | Without this pattern | With Hybrid Mesh Platform |
| --- | --- | --- |
| **Cross-cluster connectivity** | Site-to-site VPNs, manual firewall rules per pair of clusters | Skupper Virtual Application Network — outbound-only mTLS, no inbound firewall changes |
| **Fleet governance drift** | Each cluster managed independently; configurations diverge over time | Single `main` branch drives hub + east + west via ACM + dual GitOps (PUSH ApplicationSet + PULL clustergroup) |
| **AI-assisted operations** | Operators react to incidents by parsing dashboards and YAML | OpenShift Lightspeed + MCP Gateway let operators act on platform state in natural language, reducing MTTA on infrastructure incidents |

**Goal:** This pattern combines Red Hat Service Mesh for secure inter-service connectivity with OpenShift AI (MaaS + vLLM) and OpenShift Lightspeed + MCP for natural-language platform operations — giving teams centralized GitOps governance, secure cross-cluster communication, and AI-assisted incident response in a single deployable reference architecture. For physically constrained factory devices, the architecture extends naturally to **Red Hat Device Edge** with **MicroShift**, managed by the same ACM placement rules without hub-side changes.

> **Your journey:** Install via the Validated Patterns framework (`./pattern.sh install`), connect three OpenShift clusters (hub + east + west) through ACM `managedClusterGroups`, and observe IoT sensor data across Grafana and Developer Hub. The pages below follow one continuous story — concept, install, operate, scaffold.

## What is Hybrid Mesh Platform?

**Hybrid Mesh Platform** is a production-grade, multi-cluster GitOps reference architecture that mirrors how Red Hat customers run hybrid cloud on OpenShift. It implements a **hub-spoke topology** where:

- A **hub cluster** centralizes fleet governance with **ACM**, deploys via **OpenShift GitOps** (Argo CD), hosts **Developer Hub**, runs **ACS Central**, aggregates observability in **Grafana**, and exposes cross-cluster services through a **Gateway API** hub gateway.
- Two **spoke clusters** (east and west) execute **AI Computer Vision at the Edge** (NeuroFace full stack, face detection via OVMS ModelMesh, PPE safety via YOLO/KServe, Kafka events) — connected to the hub via a **Skupper Virtual Application Network** (no VPN or firewall changes).
- **Industrial Edge** factory telemetry (MQTT → Kafka → ML → dashboards) is included but **optional and disabled by default**.
- **OpenShift Service Mesh 3** in **ambient mode** provides ztunnel-based L4 encryption and optional waypoint L7 policy across all clusters.
- **Connectivity Link (Kuadrant)** layers API-aware ingress policies — rate limiting, auth, DNS/TLS automation — on top of Gateway API.

**Tested on:** Red Hat OpenShift Container Platform **4.17+** on **AWS** (hub + east spoke + west spoke, 3 workers each).

**Multi-cluster topology:** this is a **hub + two spokes** pattern (not single-cluster). All three clusters are required; standalone single-cluster deployment is not supported by default. See [Cluster sizing](cluster-sizing) for minimum instance types per role.

**Implementation repo:** [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) — Validated Patterns layout (`clustergroup`, Vault + External Secrets, ACM managedClusterGroups).

Read **concept → mechanics → operations**: start with [Architecture](architecture), install via [Getting Started](getting-started), explore the [Demo scenario](demo-scenario), scaffold workloads via [Scaffolding](scaffolding), then use platform chapters (**Hub Gateway**, **Observability**, **Industrial Edge**).

## AI Computer Vision at the Edge (primary demo)

The primary demo (v2.2+) is **NeuroFace** — a full-stack AI Computer Vision application on east/west spokes with face detection (OVMS ModelMesh), PPE safety (YOLO/KServe), Kafka events, and Grafana dashboards, federated 50/50 from the hub via Gateway API.

| Surface | URL | Description |
| --- | --- | --- |
| NeuroFace app | `https://neuroface.<hub-domain>/` | Full UI — 50/50 east/west via hub Gateway |
| NeuroFace CV | `https://neuroface-cv.<hub-domain>/` | PPE gateway (YOLO on spokes) |
| Developer Hub | `https://developer-hub.<hub-domain>/create` | **AI Computer Vision at the Edge** template |
| Grafana | `https://grafana.<hub-domain>/` | NeuroFace east/west + hub gateway metrics |
| AI Gateway | `https://ai-gateway.<hub-domain>/` | MaaS LLM with Kuadrant API keys |

[![NeuroFace — AI Computer Vision Architecture](/images/hybrid-mesh-platform/neuroface-architecture.png)](/images/hybrid-mesh-platform/neuroface-architecture.png)

_NeuroFace architecture: face detection (OVMS), PPE safety (YOLO/KServe), LLM chat (MaaS), Kafka events, and OpenTelemetry tracing — deployed on east/west spokes, federated 50/50 from the hub._

[![Hybrid Mesh Platform — hub-spoke architecture](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)

_Hub cluster aggregates observability and Developer Hub; east and west spokes run AI Computer Vision workloads connected via Service Interconnect (Skupper)._

## Hub-spoke architecture at a glance

| Cluster | Role | Key components |
| --- | --- | --- |
| **Hub** | Fleet governance and centralized services | ACM, OpenShift GitOps, Developer Hub, OpenShift AI, Service Mesh control plane, Skupper listeners, Kuadrant, ACS Central, Grafana, Kafka Console, Kubecost |
| **East spoke** | Edge AI workloads and developer tools | AI Computer Vision (NeuroFace, YOLO, OVMS), DevSpaces, Kairos SmartScaling, spoke-local GitOps |
| **West spoke** | Workload replicas and cross-cluster validation | AI Computer Vision replicas, MirrorMaker replication to hub, Skupper connectors |

Edge AI components exist **only** on spokes. The hub aggregates metrics and provides gateway access — it does not host edge inference workloads.

[![Platform architecture overview](/images/hybrid-mesh-platform/arch-overview.png)](/images/hybrid-mesh-platform/arch-overview.png)

_Detailed architecture showing Git repo structure, ACM placement, Skupper VAN, and sync-wave delivery to east/west spokes._

## Quick links

| Topic | Page |
| --- | --- |
| Architecture deep dive | [Architecture](architecture) |
| Install flow | [Getting Started](getting-started) |
| Cluster sizing | [Cluster sizing](cluster-sizing) |
| Demo scenario and showroom | [Demo scenario](demo-scenario) |
| Hub Gateway and Connectivity Link | [Hub Gateway](hub-gateway) |
| Observability | [Observability](observability) |
| Industrial Edge (multi-cluster) | [Industrial Edge](industrial-edge) |
| Scaffolding | [Scaffolding](scaffolding) |
| Customization ideas | [Ideas for customization](ideas-for-customization) |

## Recommended reading order

1. [Architecture](architecture) — mental model of hub, spokes, GitOps, Skupper, and observability
2. [Getting Started](getting-started) — bring clusters under GitOps (ACM + ApplicationSet)
3. [Cluster sizing](cluster-sizing) — hub and spoke minimum requirements
4. [Demo scenario](demo-scenario) — what the workshop showroom demonstrates
5. [Scaffolding](scaffolding) — deploy AI Computer Vision instances from Developer Hub
6. [Hub Gateway](hub-gateway) — weighted ingress and circuit breaking across spokes
7. [Observability](observability) — Grafana, Kiali, Kafka Console
8. [Industrial Edge](industrial-edge) — optional factory data pipeline on multiple spokes

**Next →** [Architecture](architecture)

## Workshop Showroom

A **Hybrid Mesh AI Workshop Showroom** provides an explanatory, navigable view of the same product surfaces after deployment — hub-spoke diagrams, ACM fleet, mesh, Industrial Edge, observability, ACS, and OpenShift AI.

| Resource | Link |
| --- | --- |
| What the demo shows (on this site) | [Demo scenario](demo-scenario) |
| Showroom content repository | [showroom-hybrid-mesh-ai](https://github.com/maximilianoPizarro/showroom-hybrid-mesh-ai) |
| Extended pattern docs (RHDP, GitOps chain, troubleshooting) | [GitHub Pages documentation](https://maximilianopizarro.github.io/hybrid-mesh-platform/) |

Hands-on lab modules and registration flows remain in the showroom repository and deployed workshop environment — not duplicated here.

## Support

This is a **Sandbox tier** Validated Pattern with community best-effort support. See [SUPPORT.md](https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/SUPPORT.md) in the pattern repository.

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
