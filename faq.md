---
layout: default
title: FAQ
nav_order: 9
---

# FAQ

## What is a Hybrid Cloud Pattern?

Hybrid Cloud Patterns are collections of applications (in the ArgoCD sense) that demonstrate aspects of hub/edge computing that seem interesting and useful.  Hybrid Cloud Patterns will generally have a hub or centralized component, and an edge component.  These will interact in different ways.

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

Hybrid Cloud Patterns come in parts - we have a [common](https://github.com/hybrid-cloud-patterns/common) repo with logic that will apply to multiple patterns.  Layered on top of that is our first pattern - [industrial edge](https://github.com/hybrid-cloud-patterns/industrial-edge).  This layout allows for individual applications within a pattern to be swapped out by pointing to different repositories or branches for those individual components by customizing the values files in the root of the repository to point to different branches or forks or even different repos entirely. (At present, the repos all have to be on github.com and accessible with the same token.)

The common repo is primarily concerned with how to deploy the GitOps operator, and to create the namespaces that will be necessary to manage the pattern applications.

The pattern repo has the application-specific layout, and determines which components are installed in which places - hub or edge.  The pattern repo also defines the hub and edge locations.  Both the hub and edge are expected to have multiple components each - the hub will have pipelines and the CI/CD framework, as well as any centralization components or data analysis components.  Edge components are designed to be smaller as we do not need to deploy Pipelines or the test and staging areas to the Edge.

Each application is described as a series of resources that are rendered into GitOps (ArgoCD) via Helm and Kustomize.  The values for these charts are set by values files that need to be "personalized" (with your local cluster values) as the first step of installation.  Subsequent pushes to the gitops repo will be reflected in the clusters running the applications.

## Who is behind this?

Today, a team of Red Hat engineers including Andrew Beekhof (@beekhof), Lester Claudio (@claudiol), Martin Jackson (@mhjacks), William Henry (@ipbabble) and others.

Excited or intrigued by what you see here?  We'd love to hear your thoughts and ideas!  Try the patterns contained here and see below for links to our repos and issue trackers.

## How can I get involved?

Try out what we've done and submit issues to our [issue trackers](https://github.com/hybrid-cloud-patterns/industrial-edge/issues).

We will review pull requests to our [pattern](https://github.com/hybrid-cloud-patterns/common) [repositories](https://hybrid-cloud-patterns/industrial-edge).
