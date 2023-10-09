---
title: Components
weight: 30
aliases: /retail/components/
---

# Component Details

## The Quarkus Coffeeshop Store [Chart](https://github.com/validatedpatterns/retail/tree/main/charts/store/quarkuscoffeeshop-charts)

This chart is responsible for deploying the applications, services and routes for the Quarkus Coffeeshop demo. It models a set of microservices that would make sense for a coffeeshop retail operation. The detail of what the microservices do is [here](https://quarkuscoffeeshop.github.io/coffeeshop/).

* [quarkuscoffeeshop-web](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-web)

Serves as the "front end" for ordering food and drinks.

* [quarkuscoffeeshop-counter](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-counter)

The counter service receives the orders, persists them in the database, and notifies when they are ready.

* [quarkuscoffeeshop-barista](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-barista)

The barista service is responsible for preparing items from the "drink" side of the menu.

* [quarkuscoffeeshop-kitchen](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-kitchen)

The kitchen service is responsible for preparing items from the "food" side of the menu.

* [quarkuscoffeeshop-customerloyalty](https://github.com/quarkuscoffeeshop/customerloyalty)

The customerloyalty service is responsible for generating customer loyalty events, when a customer enters the "rewards" email. This data is not persisted or tracked anywhere.

* [quarkuscoffeeshop-inventory](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-inventory)

The inventory service is responsible for tracking food and drink inventory.

* [quarkuscoffeeshop-customermocker](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-customermocker)

The customermocker can be used to generate test traffic.

* [quarkuscoffeeshop-majestic-monolith](https://github.com/quarkuscoffeeshop/quarkuscoffeeshop-majestic-monolith)

The "majestic monolith" builds all the apps into a single bundle, to simplify the process of deploying this app on single node systems.

All the components look like this in ArgoCD when deployed:

[![retail-v1-argo-coffeeshop-store](/images/retail/retail-v1-argo-coffeeshop-store.png)](/images/retail/retail-v1-argo-coffeeshop-store.png)

The chart is designed such that the same chart can be deployed in the hub cluster as the "production" store, the "demo" or TEST store, and on a remote cluster.

## The Quarkus Coffeeshop Database [Chart](https://github.com/validatedpatterns/retail/tree/main/charts/all/crunchy-pgcluster)

This installs a database instance suitable for use in the Retail pattern. It uses the Crunchy PostgreSQL [Operator](https://github.com/CrunchyData/postgres-operator) to provide PostgreSQL services, which includes high availability and backup services by default, and other features available.

Like the store chart, the Database chart can be deployed in the same different scenarios.

In ArgoCD, it looks like this:

[![retail-v1-argo-coffeeshopdb](/images/retail/retail-v1-argo-coffeeshopdb.png)](/images/retail/retail-v1-argo-coffeeshopdb.png)

## The Quarkus Coffeeshop Kafka [Chart](https://github.com/validatedpatterns/retail/tree/main/charts/all/quarkuscoffeeshop-kafka)

This chart installs Kafka for use in the Retail pattern. It uses the Red Hat AMQ Streams [operator](https://access.redhat.com/documentation/en-us/red_hat_amq/7.2/html/using_amq_streams_on_openshift_container_platform/index).

## The Quarkus Coffeeshop Pipelines [Chart](https://github.com/validatedpatterns/retail/tree/main/charts/hub/quarkuscoffeeshop-pipelines)

The pipelines chart defines build pipelines using the Red Hat OpenShift Pipelines [Operator](https://catalog.redhat.com/software/operators/detail/5ec54a4628834587a6b85ca5) (tektoncd). Pipelines are provided for all of the application images that ship with the pattern; the pipelines all build the app from source, deploy them to the "demo" namespace, and push them to the configured image registry.

Like the store and database charts, the kafka chart supports all three modes of deployment.

[![retail-v1-argo-pipelines](/images/retail/retail-v1-argo-pipelines.png)](/images/retail/retail-v1-argo-pipelines.png)

## The Quarkus Coffeeshop Landing Page [Chart](https://github.com/validatedpatterns/retail/tree/main/charts/all/landing-page)

The Landing Page chart builds the page that presents the links for the demos in the pattern.

[![retail-v1-landing-page](/images/retail/retail-v1-argo-landing-page.png)](/images/retail/retail-v1-argo-landing-page.png)
