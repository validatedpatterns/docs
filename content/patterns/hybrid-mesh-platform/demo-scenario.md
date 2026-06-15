---
title: Demo scenario
weight: 80
aliases: /hybrid-mesh-platform/demo-scenario/
---

# Demo scenario — Hybrid Mesh AI Workshop Showroom

This page describes what the **Hybrid Mesh AI Workshop Showroom** demonstrates on a live hub-spoke fleet. It is explanatory content for architects and facilitators — not a hands-on lab guide. For step-by-step modules and registration, use the external workshop resources linked below.

## What the showroom shows

The showroom mirrors how Red Hat customers run hybrid cloud on OpenShift: a **hub cluster** managing **east** and **west** spokes through ACM, with ambient service mesh, GitOps, Industrial Edge factory telemetry, and an AI inference layer on OpenShift AI.

[![Hybrid Mesh Platform — hub-spoke architecture](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh.png)

_Hub cluster aggregates observability and Developer Hub; east and west spokes run Industrial Edge workloads connected via Service Interconnect (Skupper)._

[![Platform component map — hub vs spokes](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)](/images/hybrid-mesh-platform/workshop-hybrid-mesh-arch.png)

_Component placement across hub and spoke clusters — fleet governance centralized, factory workloads at the edge._

## Dual-track experience

The workshop content is organized in two tracks:

| Track | Audience | Focus |
| --- | --- | --- |
| **Part A (modules 01–05)** | Executives and architects | Hybrid cloud strategy, ROSA architecture, security at scale, cloud AI services, customer cases |
| **Part B (modules 10–28)** | Practitioners | ACM fleet, mesh, GitOps, Industrial Edge, observability, ACS, Connectivity Link, OpenShift AI, Kuadrant API gateway |

On validatedpatterns.io we document the **platform architecture and VP install path**. The showroom provides a rich, navigable view of the same product surfaces after deployment.

## Product surfaces highlighted

The showroom hero images and module structure align with the pattern chapters on this site:

| Product area | Showroom illustration | Pattern chapter |
| --- | --- | --- |
| ACM multicluster fleet | ![ACM fleet](/images/hybrid-mesh-platform/workshop-acm-multicluster.png) | [Getting Started](getting-started) |
| Ambient Service Mesh | ![Service Mesh](/images/hybrid-mesh-platform/workshop-service-mesh.png) | [Architecture](architecture) |
| Developer Hub templates | ![Software templates](/images/hybrid-mesh-platform/workshop-software-templates.png) | [Scaffolding](scaffolding) |
| Industrial Edge factory | ![Industrial Edge](/images/hybrid-mesh-platform/workshop-industrial-edge.png) | [Industrial Edge](industrial-edge) |
| Observability stack | ![Observability](/images/hybrid-mesh-platform/workshop-observability.png) | [Observability](observability) |
| ACS and Connectivity Link | ![ACS and Kuadrant](/images/hybrid-mesh-platform/workshop-acs-kuadrant.png) | [Hub Gateway](hub-gateway) |
| OpenShift AI / MaaS | ![OpenShift AI](/images/hybrid-mesh-platform/workshop-openshift-ai.png) | [_index](.) |
| Kairos SmartScaling | ![Kairos scaling](/images/hybrid-mesh-platform/workshop-kairos-scaling.png) | [Observability](observability) |

## Hub-spoke topology in the demo

The demo fleet uses the same three-cluster layout documented in [Architecture](architecture):

- **Hub:** ACM, Argo CD, Developer Hub, OpenShift AI, Service Mesh control plane, Skupper listeners, Kuadrant, ACS Central, Grafana, Kubecost
- **East spoke:** Industrial Edge workloads, DevSpaces, Kairos, spoke-local GitOps
- **West spoke:** Workload replicas, cross-cluster traffic via Skupper

Traffic crosses **OpenShift Service Mesh 3 ambient mode** (ztunnels, optional waypoints) and **Skupper** tunnels exposed through **Gateway API** ingress on the hub.

## OpenShift AI and API gateway (conceptual)

The showroom illustrates a shared **Model as a Service (MaaS)** endpoint on the hub. Applications that speak the OpenAI REST API can consume inference without code changes by pointing to the in-cluster service. Spoke factory pipelines reach MaaS through Skupper connectors.

**Red Hat Connectivity Link (RHCL)** with **Kuadrant** exposes managed API products — for example HTTP utilities, REST catalog APIs, and LLM chat completion routes — with rate limits and API key plans. See [Hub Gateway](hub-gateway) for the platform ingress design.

## External resources

| Resource | URL |
| --- | --- |
| Pattern implementation | [github.com/maximilianoPizarro/hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) |
| Full pattern documentation (GitHub Pages) | [maximilianopizarro.github.io/hybrid-mesh-platform](https://maximilianopizarro.github.io/hybrid-mesh-platform/) |
| Workshop showroom content repo | [showroom-hybrid-mesh-ai](https://github.com/maximilianoPizarro/showroom-hybrid-mesh-ai) |
| Live showroom (when deployed) | [Hybrid Mesh AI Workshop Showroom](https://showroom-showroom.apps.cluster-22jv2.dynamic2.redhatworkshops.io/en/index.html) |

**Next →** [Getting Started](getting-started) to deploy the Validated Patterns implementation, or [Architecture](architecture) for the technical deep dive.
