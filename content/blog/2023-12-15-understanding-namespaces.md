---
 date: 2023-12-15
 title: Understanding Namespace Creation using the Validated Patterns Framework
 summary: Validate Patterns framework support for labels, annotations and operator groups when creating namespaces for OpenShift.
 author: Lester Claudio
 blog_tags:
 - patterns
 aliases: /2023/12/15/understanding-namespaces/
 keywords:
 - kubernetes namespaces
 - operator groups
 - openshift
 - validated patterns
 - namespace management
 - clustergroup
---

# Understanding Namespace Creation using the Validated Patterns Framework

In the realm of Kubernetes and containerized environments, managing namespaces efficiently is pivotal. It ensures proper organization, security, and resource isolation within a cluster. With the Validated Patterns framework, creating namespaces becomes not just systematic but also highly customizable.

In this blog we will talk about the different ways to create namespaces by describing them in the Validated Patterns values files.  We provide examples of the different options we support and the reasoning behind them.

# Describing Namespaces in the Validated Patterns values files

Namespaces in Kubernetes offer a way to divide cluster resources between multiple users, teams, or projects. They act as virtual clusters within a physical cluster, enabling isolation and segmentation. 

The Validated Patterns framework provides a structured approach to creating namespaces, allowing for a range of configurations to meet specific requirements. In addition, the Validated Patterns framework, by default, creates an Operator Group, defined by the OperatorGroup resource, which provides multi-tenant configuration to OLM-installed Operators. 

## The **namespaces:** Configuration structure

The Validated Patterns values files have several required sections that fall under the **clusterGroup:** top level section.  The structure to describe namespaces starts with the declaration of the **namespaces:** section in the values-*.yaml files.  

```
clusterGroup:
  name: example
  isHubCluster: true
  sharedValueFiles:
  - /values/{{ .Values.global.clusterPlatform }}.yaml
  - /values/{{ .Values.global.clusterVersion }}.yaml

  namespaces:
     …
```

The Validated Patterns framework, defined by the **clusterGroup** helm chart in the **common** [github repository](https://github.com/validatedpatterns/common/tree/v1/clustergroup), accepts two formats for the **namespaces:** section:

* A list object
* A map object

If a namespace is described as a list item the Validated Patterns framework will use that list element and create a Namespace resource, using that name, as well as an OperatorGroup resource.  By default the Validated Patterns framework will add the **namespace** to the **spec.targetNamespaces** for the OperatorGroup resource.

If a namespace is described as a map object, e.g. **mynamespace:**, the Validated Patterns framework will look for additional elements in the namespace description.  The elements that the Validated Patterns framework looks for are **labels:**, **annotations:**, **operatorGroup:** and **targetNamespaces:**.

The Validated Patterns framework uses a JSON Schema for defining the structure of JSON data for the values files. It provides a contract for what JSON data is required for a given application and how to interact with it. We use the JSON Schema file mostly for validation, documentation, and interaction control of JSON data. You can find the [JSON Schema](https://github.com/validatedpatterns/common/blob/v1/clustergroup/values.schema.json) for the **clusterGroup:** section in our Validated Patterns **common** [github repository](https://github.com/validatedpatterns/common/tree/v1/clustergroup).

Let's explore the various methods to create namespaces using the Validated Patterns framework, examining the configurations provided.

### Describing namespaces using a list

We mentioned that if you describe a namespace as a list the Validated Patterns framework will use that list element and create a Namespace resource, using that name, as well as an OperatorGroup resource.  By default the Validated Patterns framework will use the **namespace** as the **targetNamespace** value for the OperatorGroup resource. 

You can use both a list, and a map object, to describe a namespace.  Here’s an example of using a list to describe a namespace.

```
  namespaces:
    - open-cluster-management
    - vault
    - golang-external-secrets
    - config-demo
    - hello-world
```

A namespace will be created for each one of the items in the list as well as an operator group with the namespace included in the targetNamespaces list.

For example, the Validated Patterns framework will generate a **Namespace** manifest for the namespace **hello-world**.

```
# Source: clustergroup/templates/core/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    argocd.argoproj.io/managed-by: common-hub
  name: hello-world
spec:
```

In addition, the Validated Patterns framework will generate a default **OperatorGroup** manifest.

```
# Source: clustergroup/templates/core/operatorgroup.yaml
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: hello-world-operator-group
  namespace: hello-world
spec:
  targetNamespaces:
  - hello-world
```
By default we include the **namespace** in the list of **targetNamespaces:**.

### Adding Labels and Annotations to a namespace

In OpenShift, or Kubernetes, you can use labels and annotations as a method to organize, group, or select API objects. Labels can be used to group arbitrarily-related objects; for example, our Validated Patterns framework labels the OpenShift GitOps **applications** resources with labels so that we can identify application resources that were created by the Validated Patterns framework. 

To define labels and annotations you would describe the namespace as a map object, adding the labels and annotations needed, using the following structure in the values.yaml file:

```
  namespaces:
  - open-cluster-management:
      labels:
        openshift.io/node-selector: ""
        kubernetes.io/os: linux
      annotations:
        openshift.io/cluster-monitoring: "true"
        owner: "namespace owner"
```

The Validated Patterns framework will generate the following namespace manifest for the above example.

```
---
# Source: clustergroup/templates/core/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: open-cluster-management
  labels:
    argocd.argoproj.io/managed-by: common-example
    kubernetes.io/os: "linux"
    openshift.io/node-selector: ""
  annotations:
    openshift.io/cluster-monitoring: "true"
    owner: "namespace owner"
spec:
```

This configuration exemplifies the use of labels and annotations to define properties for the namespace. Labels assist in grouping namespaces while annotations provide additional metadata.

### Adding an OperatorGroup with a list of targetNamespaces

You can explicitly name the target namespace for an Operator group using the spec.targetNamespaces parameter. The Validated Patterns framework allows to specify a list of targetNamespaces in the description of a namespace.

```
  namespaces:
  - application-ci:
      operatorGroup: true
      targetNamespaces:
        - application-ci
        - other-namespace
```
Here, the operatorGroup is set to `true`, which tells the Validated Patterns framework that you would like to create the OperatorGroup resource, and describes a set of namespaces where an operator will be active. The targetNamespaces specifies the namespaces that will be affected by this operator.

The generated manifest for the OperatorGroup will look like this:
```
---
# Source: clustergroup/templates/core/operatorgroup.yaml
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: application-ci-operator-group
  namespace: application-ci
spec:
  targetNamespaces:
  - application-ci
  - other-namespace
```

### Excluding targetNamespaces from an OperatorGroup

When creating OperatorGroups it is important to keep in mind that an operator may not support all namespace configurations. For example, an operator that is designed to run at the cluster level shouldn’t be expected to work in an OperatorGroup that defines a single targetNamespace.

```
  namespaces:
  - exclude-targetns:
      operatorGroup: true
      targetNamespaces:
```

Here, the operatorGroup is set to `true`, which tells the Validated Patterns framework that you would like to create the OperatorGroup resource, and describes an empty targetNamespaces which specifies that this is a global Operator group, which selects all namespaces.

```
---
# Source: clustergroup/templates/core/operatorgroup.yaml
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: exclude-targetns-operator-group
  namespace: exclude-targetns
spec:
  targetNamespaces:
```

### Excluding the creation of an Operator Group for a namespace

In the case where you don’t want the Validated Patterns framework to create an OperatorGroup resource for a namespace you can do that by describing the namespace as follows:

```
  namespaces:
  - exclude-og:
      operatorGroup: false
```

Here, operatorGroup is set to `false`, indicating a complete exclusion of an Operator Group resource for the namespace, `exclude-og.`

# Leveraging Validated Patterns for flexible Namespace creation

The Validated Patterns framework offers a structured approach to namespace creation, providing flexibility and control over namespace configurations. By utilizing labels, annotations, and directives like **operatorGroup:** and **targetNamespaces:**, administrators can craft namespaces tailored to specific use cases and operational needs within a Kubernetes environment.

# Conclusion

Effective namespace management is crucial in Kubernetes environments, and the Validated Patterns framework simplifies and standardizes this process. By understanding the nuances of namespace configurations within the Validated Patterns framework, administrators can efficiently organize and control resources while ensuring security and isolation across the cluster.
