---
menu:
  contribute:
    parent: Background on pattern development
title: Validated pattern structure
weight: 21
aliases: /building-vps/structure/
---

# Validated pattern structure

## Framework fundamentals

The validated patterns framework uses [OpenShift GitOps](https://docs.openshift.com/container-platform/4.9/cicd/gitops/understanding-openshift-gitops.html) (ArgoCD) as the primary driver for deploying patterns and keeping them up to date. Validated patterns use Helm charts as the primary artifacts for GitOps. [Helm charts](https://helm.sh/) provide a mechanism for templating that is powerful when building repeatable, automated deployments across different deployment environments (i.e. clouds, data-centers, edge, etc.)

Many Cloud Native Computing Foundation (CNCF) projects use [Operators](https://operatorframework.io/) to manage the lifecycle of their service. Whenever possible, validated patterns will make use of these Operators to deploy the application service.

[Red Hat Advanced Cluster Management](https://www.redhat.com/en/technologies/management/advanced-cluster-management) (ACM) is primarily used to automate the deployment of edge clusters. It provides subscription information for specific deployment sites.

[OpenShift Pipelines](https://docs.openshift.com/container-platform/4.9/cicd/pipelines/understanding-openshift-pipelines.html) is used to automate builds and keep image repositories up to date.

## Pattern directories tour

Examining any of the existing patterns reveals the important organizational part of the validated patterns framework. Let's take a look at a couple of the existing validated patterns: Multicluster GitOps and Industrial Edge.

```text
~/g/multicloud-gitops on main ◦ tree -L 2
.
├── charts
│   └── region
├── common
│   ├── acm
│   ├── clustergroup
│   ├── common -> .
│   ├── examples
│   ├── install
│   ├── Makefile
│   ├── Makefile.toplevel
│   ├── pattern-vault.init
│   ├── reference-output.yaml
│   ├── scripts
│   ├── tests
│   └── values-global.yaml
├── Makefile
├── README.md
├── scripts
│   └── make_common_subtree.sh
├── values-global.yaml
├── values-hub.yaml
└── values-region-one.yaml

11 directories, 11 files
```

First we notice some subdirectories: charts, common, and scripts - along with `values-` yaml files.

```text
~/g/industrial-edge on stable-2.0 ◦ tree -L 2
.
├── charts
│   ├── datacenter
│   └── factory
├── common
│   ├── acm
│   ├── common -> .
│   ├── examples
│   ├── install
│   ├── Makefile
│   ├── Makefile.toplevel
│   ├── scripts
│   ├── site
│   ├── values-datacenter.yaml
│   └── values-global.yaml
├── docs
│   ├── images
│   └── old-deployment-map.txt
├── images
│   ├── import-cluster.png
│   ├── import-with-kubeconfig.png
│   └── launch-acm-console.png
├── Makefile
├── README.md
├── scripts
│   └── sleep-seed.sh
├── SUPPORT_AGREEMENT.md
├── values-datacenter.yaml
├── values-factory.yaml
├── values-global.yaml
└── values-secret.yaml.template

14 directories, 16 files
```

We see the same or similar files in the Industrial Edge pattern above.

## The `charts` directory

This is where validated patterns keep the helm charts for a pattern. The helm charts are used deploy and manage the various components of the applications deployed at a site. By convention, the charts are broken out by site location. You may see `datacenter`, `hub`, `factory`, or other site names in there.

Each site has sub-directories based on application or library component groupings.

From [Helm documentation:](https://helm.sh/docs/chart_template_guide/getting_started/)
*Application charts* are a collection of templates that can be packaged into versioned archives to be deployed.

*Library charts* provide useful utilities or functions for the chart developer. They're included as a dependency of application charts to inject those utilities and functions into the rendering
pipeline. Library charts do not define any templates and therefore cannot be deployed.

These groupings are used by OpenShift GitOps to deploy into the cluster. The configurations for each of the components inside an application are synced every three minutes by OpenShift GitOps to make sure that the site is up to date. The configuration can also be synced manually if you do not wish to wait up to three minutes.

[![Charts Dir](/images/framework/dir-ie-charts.png)](/images/framework/dir-ie-charts.png)

The configuration YAML for each component of the application is stored in the templates sub-directory. For example, the Industrial Edge `datacenter` has a application called Kafka. The configuration for Kafka is stored in `kafka/templates`.

[![Charts Dir](/images/framework/dir-ie-kafka-charts.png)](/images/framework/dir-ie-kafka-charts.png)

## The `common` directory

There are several common components that are in use across the validated patterns that exist today. E.g. the External Secrets operator and RHACM (Red Hat Advanced Cluster Management). These components are part of the validated patterns framework. They are configured to work together in the GitOps based framework. Rather than duplicating the configuration in each pattern, these common technologies are moved into a common directory. If there are pattern specific post-deployment configurations to be applied, those should be added to the Helm charts in the `charts` directory structure. This is unlikely for these components. Consider `common` out of bounds unless you are working on modifying the framework.

## The `scripts` directory

Sometimes an Operator and/or the Helm charts still leave some work to be done with regard to final configuration. When extra code is needed to deploy, the extra code is placed in the `scripts` directory. The majority of the time a consumer of a validated pattern will only use this code through the existing automation. I.e. The `Makefile` or OpenShift GitOps will make use of these scripts. So - If there is extra *massaging* required for your application, put the scripts in here and try to run them from within the automation. It is very unlikely you will need to change the scripts directory. Consider `scripts` out of bounds unless you are modifying the framework.

## Applications and `values-` files

Helm uses `values.yaml` files to pass variables into charts. Variables in the `values.yaml` file can be overridden in the following ways:

1. By a `values.yaml` file in the parent directory
1. By a values file passed into the `helm <install/upgrade>` command using `-f`
1. By specifying an override individual value in the the `helm` command with `--set`

For more information on values files and their usage see the [values files section](https://helm.sh/docs/chart_template_guide/values_files/) of the Helm documentation.

This section is meant as an introduction to the `values-` files that the framework uses to override values in the chart templates. In the Getting Started pages there will be more specific usage details.

### There are three types of `value-` files.

1. **`values-global.yaml`**: 
   This is used to set variables for helm charts across the pattern. It contains the name of the pattern and sets some other variables for artifacts like, image registry, Git repositories, GitOps syncPolicy etc.
1. **`values-<site>.yaml`**: 
   Each specific site requires information regarding what applications and subscriptions are required for that site. This file contains a list of namespaces, applications, subscriptions, the operator versions etc. for that site.
1. **`values-secret.yaml.template`**: 
   All patterns require some secrets for artifacts included in the pattern. E.g. credentials for GitHub, AWS, or Quay.io. The framework provides a safe way to load those secrets into a vault for consumption by the pattern. This template file can be copied to your home directory, the secret values applied, and the validated pattern will go look for `values-secrets.yaml` in your home directory. **Do not leave a `values-secrets.yaml` file in your cloned git directory or it may end up in your (often public) Git repository, like GitHub.**

### Values files can have some overrides.

1. Version overrides can be used to set specific values for OCP versions. E.g. **`values-hub-4.12.yaml`** allows you to tweak a specific value for OCP 4.12 on the Hub cluster. 

1. Version overrides can be used to set specific values for specific cloud providers. E.g. **`values-AWS.yaml`** would allow you to tweak a specific value for all cluster groups deployed on AWS.

### Other combination examples include:

1. **`values-hub-Azure.yaml`** only apply this Azure tweak on the hub cluster.

1. **`values-4.12.yaml`** apply these OCP 4.12 tweaks to all cluster groups in this pattern.

Current supported cloud providers include **`AWS`**, **`Azure`**, and **`GCP`**. 

## Applications & subscriptions

## Environment values and Helm

The reason the above values files exist is to take advantage of Helms ability to use templates and substitute values into your charts. This makes the pattern very portable.

The following `messaging-route.yaml` example shows how the AMQ messaging service is using values set in the `values-global.yaml` file for Industrial Edge.

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  labels:
    app: messaging
  name: messaging
spec:
  host: messaging-manuela-tst-all.apps.{{ .Values.global.datacenter.clustername }}.{{ .Values.global.datacenter.domain }}
  port:
    targetPort: 3000-tcp
  to:
    kind: Service
    name: messaging
    weight: 100
  wildcardPolicy: None
```


The values in the `values-global.yaml` will be substituted when the YAML is applied to the cluster.

```yaml
global:
  pattern: industrial-edge

...

  datacenter:
    clustername: ipbabble-dc
    domain: blueprints.rhecoeng.com

  edge:
    clustername: ipbabble-f1
    domain: blueprints.rhecoeng.com
```
