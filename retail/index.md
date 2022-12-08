---
layout: default
title: Retail
parent: Patterns
has_children: true
nav_order: 6
---

<div class="pattern_logo">
  <img src="/images/logos/industrial-edge.png" class="pattern_logo" alt="Points">
</div>

# Retail Pattern

{: .no_toc }

[Install](getting-started){: .btn .btn-green .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/retail/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

This pattern demonstrates a pattern that models the store side of a retail application.

It is derived from the [Quarkus Coffeeshop Demo](https://quarkuscofeeshop.github.io) done by Red
Hat Solution Architects. The demo models the use of multiple application microservices which use Kafka messaging to interact and a Postgres database to persist data. (There is a homeoffice analytics suite in the demo that we hope to include in a later version of the pattern.

This demo pulls together several different strands of the demo and allows for multiple stores to be installed on remote clusters via ACM if the user desires.

The demo allows users to go to the store's web page, order drinks and food items, and see those items "made" and served by the microservices in real time.

The pattern includes build pipelines and a demo space, so that changes to the applications can be tested prior to "production" deployments.

### Solution elements

- How to use a GitOps approach to keep in control of configuration and operations
- How to centrally manage multiple clusters, including workloads
- How to build and deploy workloads across clusters using modern CI/CD
- How to architect a modern application using microservices and Kafka in Java

### Red Hat Technologies

- Red Hat OpenShift Container Platform (Kubernetes)
- Red Hat Advanced Cluster Management (Open Cluster Management)
- Red Hat OpenShift GitOps (ArgoCD)
- Red Hat OpenShift Pipelines (Tekton)
- Red Hat AMQ Streams (Apache Kafka Event Broker)

## Architecture

The following diagram shows the relationship between the microservices, messaging, and database components:

[![Retail Pattern Architecture](/images/retail/retail-architecture.png)](/images/retail/retail-architecture.png)

- The hub. This cluster hosts the CI/CD pipelines, a test instance of the applications and messaging/database services for testing purposes, and a single functional store.
- Optional remote clusters. Each remote site can support a complete store environment. The default one modelled is a "RALEIGH" store location.

### Demo Scenario

The Industrial Edge Validated Pattern / Demo Scenario is focused in the Quarkus retail experience. In a full retail
environment, it would be easy to be overwhelmed by things like item files, tax tables, item movement/placement within the store and so on.

- Web Service - the point of sale within the store. Shows the menu, and allows the user to order food and drinks, and shows when orders are ready.
- Counter service - the "heart" of the store operation - receives orders and dispatches them to the barista and kitchen services, as appropriate. Users may order as many food and drink items in one order as they wish.
- Barista - the service responsible for providing items from the "drinks" side of the menu.
- Kitchen - the service responsible for providing items from the "food" side of the menu.
[![Demo Scenario](/images/retail/retail-highlevel.png)](/images/retail/retail-highlevel.png)
