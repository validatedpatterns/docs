---
menu: contribute
title: Extending an existing pattern
weight: 30
aliases: /extending-a-pattern/
---

# Extending an existing pattern

## Introduction to extending a pattern using a fork
Extending an existing pattern refers to adding a new product and/or configuration to an existing pattern. For example a pattern might be a great fit for a solution but requires the addition of an observability tool, e.g. Prometheus, Grafana, or Elastic. Or perhaps it needs multicloud communication using Skupper. Extending an existing pattern is not very difficult. The advantage is that it automates the integration of this extra product into pattern.   

Extending usually requires four steps:
1. Adding any required namespace for the product  
1. Adding a subscription to install and operator
1. Adding one or more ArgoCD applications to manage the post-install configuration of the product
1. Adding the Helm chart needed to implement the post-install configuration identified in step 3.

Sometimes there is no operator in [OperatorHub](https://catalog.redhat.com/software/search?deployed_as=Operator) for the product and it requires installation using a Helm chart. 

These additions need to be made to the appropriate `values-<cluster grouping>.yaml` file in the top level pattern directory. If the component is on a hub cluster the file would be `values-hub.yaml`. If it's on a production cluster that would be in `values-production.yaml`. Look at the pattern architecture and decide where you need to add the product.

In the example below AMQ Streams (Kafka) is chosen as a product to add to a pattern.

## Before starting, fork and clone first

1. Visit the github page for the pattern that you wish to extend. E.g. [multicloud-gitops](https://github.com/hybrid-cloud-patterns/multicloud-gitops). Select “Fork” in the top right corner.

1. On the create a new fork page, you can choose what owner repository you want and the name of the fork. Most times you will fork into your personal repo and leave the name the same. When you have made the appropriate changes press the "Create fork" button.  

1. You will need to clone from the new fork onto you laptop/desktop so that you can do the extension work effectively. So on the new fork’s main page elect the green “Code” button and copy the git repo’s ssh address.

1. In an appropriate directory on your laptop (e.g. `~/git`) use `git clone` on the command line using the ssh address copied above. Then create a branch to extend the pattern. For example if you are extending the `multicloud-gitops` pattern and adding kafka, you will need to clone your fork of multicloud-gitops and create a branch to add Kafka:

```bash
~/git> git clone git@github.com:<your git account>/multicloud-gitops.git
~/git> cd multicloud-gitops
~/git/multicloud-gitops> git checkout -b add-kafka
```

## Adding a namespace
The first step is to add a namespace in the `values-<cluster group>.yaml`. Sometimes a specific namespace is expected in other parts of a products configuration. E.g. Red Hat Advanced Cluster Security expects to use the namespace `stackrox`. While you might try using a different namespace you may encounter issues. 

In our example we are just going to add the namespace `my-kafka`.

```yaml
---
namespaces:
  ...  # other namespaces above my-kafka
  - my-kafka
``` 

## Adding a subscription
The next step is to add the subscription information for the Kubernetes Operator. Sometimes this subscription needs to be added to a specific namespace, e.g. `openshift-operators`. Check for any operator namespace requirements. In this example just place it in the newly created `my-kafka` namespace.

```yaml
---
subscriptions:
	...  # other subscriptions
    amq-streams:
      name: amq-streams
      namespace: my-kafka
``` 

## Adding the ArgoCd application
The next step is to add the application information. Sometimes you want to group applications in ArgoCD into a project and you can do this by using an existing project grouping or create a new project group. The example below uses an existing `project` called `my-app`.
 
```yaml
---
applications:
    kafka:
      name: kafka
      namespace: my-kafka
      project: my-app
      path: charts/all/kafka
``` 

## Adding the Helm Chart
The `path:` tag in the above kafka application tells ArgoCD where to find the Helm Chart needed to deploy this application. Paths are relative the the top level pattern directory and therefore in my example that is `~/git/multicloud-gitops`.  

ArgoCD will continuously monitor for changes to artifacts in that location for updates to apply. Each different site type would have its own `values-` file listing subscriptions and applications.

### Helm Charts
The previous steps merely instruct ArgoCD to install the operator for AMQ Streams. No Kafka cluster or topics are created. There is more work to be done.

You must add a Chart for Kafka:
1. A Kafka cluster chart
1. A Kafka topic chart.

Because Kafka (AMQ Streams) is often used to communicate across different clusters in multi-cluster and/or multi-cloud environment you are going to add these to the the `all` sub dir `charts/all/kafka/templates` directory. In order to do that we must:

```bash
~/git/multicloud-gitops> mkdir charts/all/kafka
~/git/multicloud-gitops> mkdir charts/all/kafka/templates
```
Helm requires a Chart.yaml file and a values.yaml file in the kafka directory.
Edit these files in the kafka directory and add the following:

```yaml
---
Chart.yaml:
apiVersion: v2
name: kafka-cluster
description: A Helm chart for Kubernetes

# A chart can be either an 'application' or a 'library' chart.
#
# Application charts are a collection of templates that can be packaged into versioned archives
# to be deployed.
#
# Library charts provide useful utilities or functions for the chart developer. They're included as
# a dependency of application charts to inject those utilities and functions into the rendering
# pipeline. Library charts do not define any templates and therefore cannot be deployed.
type: application

# This is the chart version. This version number should be incremented each time you make changes
# to the chart and its templates, including the app version.
# Versions are expected to follow Semantic Versioning (https://semver.org/)
version: 0.1.0

# This is the version number of the application being deployed. This version number should be
# incremented each time you make changes to the application. Versions are not expected to
# follow Semantic Versioning. They should reflect the version the application is using.
# It is recommended to use it with quotes.
appVersion: "1.16.0"
```

values.yaml:
```yaml
---
global:
  testlab:
    namespace: lab-kafka
```
Save the files. Having the `global.testlab.namespace` defined here allows us to override its chart from here or from values-global.yaml.

### The Kafka cluster Helm chart
Now we need a chart to deploy a kafka cluster instance. We will create a file called `kafka-cluster.yaml` in the charts/all/kafka/templates directory. Using your favorite editor edit the file, copy/paste the code below, and save the file.

kafka-cluster.yaml:

```yaml
---
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
 name: lab-cluster
 namespace: {{ .Values.global.testlab.namespace }}
# annotations:
#   argocd.argoproj.io/sync-options: SkipDryRunOnMissingResource=true
#
#   NOTE if needed you can use argocd sync-wave to delay a manifest  
#   argocd.argoproj.io/sync-wave: "3"
spec:
 entityOperator:
   topicOperator: {}
   userOperator: {}
 kafka:
   config:
     default.replication.factor: 3
     inter.broker.protocol.version: '3.3'
     min.insync.replicas: 2
     offsets.topic.replication.factor: 3
     transaction.state.log.min.isr: 2
     transaction.state.log.replication.factor: 3
   listeners:
     - name: plain
       port: 9092
       tls: true
       type: route
     - name: tls
       port: 9093
       tls: true
       type: route
       configuration:
         bootstrap:
           host: bootstrap-factory-kafka-cluster.{{ .Values.global.localClusterDomain }}
   replicas: 3
   storage:
     type: ephemeral
   version: 3.3.1
 zookeeper:
   replicas: 3
   storage:
     type: ephemeral
```

### Topic Helm Chart
We also need a chart to deploy a kafka stream. We will create a file called kafka-topic.yaml in the charts/all/kafka/templates directory. Using your favorite editor edit the file, copy/paste the code below, and save the file.

kafka-topic.yaml:

```yaml
---
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: lab-stream
  namespace: {{ .Values.global.testlab.namespace }}
  labels:
    strimzi.io/cluster: lab-cluster
spec:
  partitions: 1
  replicas: 1
  config:
    retention.ms: 604800000
    segment.bytes: 1073741824
```

## Add, Commit & Push
**Steps:**

1. Use `git status` to see what's changed that you need to add to your commit and add them using `git add`
1. Commit the changes to the branch
1. Push the branch to your fork.

```bash
~/git/multicloud-gitops> git status
~/git/multicloud-gitops> git add <the assets created/changed>
~/git/multicloud-gitops> git commit -m “Added Kafka using AMQ Stream operator and Helm charts”
~/git/multicloud-gitops> git push origin multicloud-gitops
```

## Watch OpenShift GitOps hub cluster UI and see Kafka get deployed
Let’s check the OpenShift console. This can take a bit of time for ArgoCD to pick it up and deploy the assets.

1. Select installed operators. Is AMQ Streams Operator deployed?
1. Select the Red Hat Integration - AMQ Streams operator.
1. Select Kafka tab. Is there a new lab-cluster created?
1. Select the Kafka Topic tab. Is there a lab-streams topic created?

This is a very simple and minimal Kafka set up. It is likely you will need to add more manifests to the Chart but it is a good start.
