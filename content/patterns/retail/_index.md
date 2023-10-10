---
title: Retail
date: 2022-12-08
validated: false
summary: This pattern demonstrates a pattern that models the store side of a retail application.
products:
- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
- Red Hat AMQ
industries:
- Retail
aliases: /retail/
# uncomment once this exists
# pattern_logo: retail.png
links:
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/validatedpatterns/retail/issues
# uncomment once this exists
# ci: retail
---

# Retail Pattern

## Background

This pattern demonstrates a pattern that models the store side of a retail application.

It is derived from the [Quarkus Coffeeshop Demo](https://quarkuscoffeeshop.github.io) done by Red
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

The Retail Validated Pattern / Demo Scenario is focused in the Quarkus Coffeeshop retail experience. In a full retail
environment, it would be easy to be overwhelmed by things like item files, tax tables, item movement/placement within the store and so on, so the demo does not attempt to model all those elements - instead offering a subset of services to give a sense of how data can flow in such a system, how microservices should interact (via API calls and message passing), and where data can be persisted.

In the future we hope to expand this pattern with the homeoffice components, to further demonstrate how data can flow from leaf nodes to centralized data analytics services, which are crucial in retail IT environments.

- Web Service - the point of sale within the store. Shows the menu, and allows the user to order food and drinks, and shows when orders are ready.
- Counter service - the "heart" of the store operation - receives orders and dispatches them to the barista and kitchen services, as appropriate. Users may order as many food and drink items in one order as they wish.
- Barista - the service responsible for providing items from the "drinks" side of the menu.
- Kitchen - the service responsible for providing items from the "food" side of the menu.

Further documentation on the individual services is available at the upstream [Quarkus Coffeeshop](https://quarkuscoffeeshop.github.io/) documentation site.

[![Demo Scenario](/images/retail/retail-highlevel.png)](/images/retail/retail-highlevel.png)
