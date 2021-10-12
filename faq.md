---
layout: default
title: FAQ
nav_order: 9
---

# FAQ

## What is a Hybrid Cloud Pattern?

Hybrid Cloud Patterns are collections of applications (in the ArgoCD sense) that demonstrate aspects of hub/edge computing that seem interesting and useful.  Hybrid Cloud Patterns will generall have a hub or centralized component, and an edge component.  These will interact in different ways.

Many things have changed in the IT landscape in the last few years - containers and kubernetes have taken the industry by storm, but they introduce many technologies and concepts.  It is not always clear how these technologies and concepts play together - and Hybrid Cloud Patterns is our effort to show these technologies working together on non-trivial applications in ways that make sense for real customers and partners to use.

The first Hybrid Cloud Pattern is based on [MANUela](https://github.com/sa-mw-dach/manuela), an application developed by Red Hat field associates.  This application highlights some interesting aspects of the industrial edge in a cloud-native world - the hub component features pipelines to build the application, a "twin" for testing purposes, a central data lake, an s3 component to gather data from the edge installations (which are factories in this case).  The edge component has machine sensors, which are responsible for only gathering data from instrumented line devices and shares them via MQTT messaging.  The edge also features Seldon, an AI/ML framework for making predictions, a custom NodeJS application to show data in real time, and messaging components supporting both MQTT and Kafka protocols.  The local applications use MQTT to retrieve data for display, and the Kafka components move the data to the central hub for storage and analysis.

We are actively developing new Hybrid Cloud Patterns.  Watch this space for updates!

## How are they different from XYZ?

Many technology demos can be very minimal - such demos have an important place in the ecosystem to demonstrate the intent of an individual technology.  Hybrid Cloud Patterns are meant to demonstrate groups of technologies working together in a cloud native way.  And yet, we hope to make these patterns general enough to allow for swapping application components out -- for example, if you want to swap out ActiveMQ for RabbitMQ to support MQTT - or use a different messaging technology altogether, that should be possible.  The other components will require reconfiguration.

## What technologies are used?

Key technologies in the stack for Industrial Edge include:

- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
- Red Hat OpenShift GitOps (based on ArgoCD)
- Red Hat OpenShift Pipelines (based on tekton)
- Red Hat Integration - AMQ Broker (ActiveMQ Artemis MQTT)
- Red Hat Integration - AMQ Streams (Kafka)
- Red Hat Integration - Camel K
- Seldon Operator

In the future, we expect to further use Red Hat OpenShift, and expand the integrations with other elements of the ecosystem.  How can the concept of GitOps integrate with a fleet of devices that are not running Kubernetes?  What about integrations with baremetal or VM servers?  Sounds like a job for Ansible!  We expect to tackle some of these problems in future patterns.

## How are they structured?

Hybrid Cloud Patterns come in parts - we have a [common](https://github.com/hybrid-cloud-patterns/common) repo with logic that will apply to multiple patterns.  The design allows for individual applications within a pattern to be swapped out by pointing to different repositories or branches

## Who is behind this?

Today, a team of Red Hat engineers including Andrew Beekhof (@beekhof), Lester Claudio (@claudiol), Martin Jackson (@mhjacks), William Henry (@ipbabble) and others.

Excited or intrigued by what you see here?  We'd love to hear your thoughts and ideas!  Try the patterns contained here and see below for links to our repos and issue trackers.

## How can I get involved?

Try out what we've done and submit issues to our [issue trackers](https://github.com/hybrid-cloud-patterns/industrial-edge/issues).

We will review pull requests to our [pattern](https://github.com/hybrid-cloud-patterns/common) [repositories](https://hybrid-cloud-patterns/industrial-edge).
