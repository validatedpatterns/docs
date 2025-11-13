---
date: 2022-08-24
title: Using clusterGroups in the Validated Patterns Framework
summary: Defining what we mean by clusterGroups in the Validated Pattern Framework (and how to use them)
author: Martin Jackson
blog_tags:
- validated-pattern
aliases: /2022/08/24/clustergroups/
keywords:
- clustergroups
- multicluster
- validated patterns
- kubernetes
- openshift
- cluster management
- gitops
---

# What Is a clusterGroup?

The Validated Patterns framework defines itself in terms of clusterGroups. A clusterGroup is a set of one or more Kubernetes clusters that are managed to have the same deployments (that is, subscriptions and applications, namespaces and projects) applied to each member of the same clustergroup. Two different members of the same clusterGroup will differ in cluster-name and in other cluster-specific details (such as PKI and tokens) but will have the same subscriptions and applications as other members of the same clusterGroup.

Essentially, a clusterGroup is an abstract definition of what the pattern will install on each respective cluster in the pattern. It is possible to install multiple clusterGroups on the same cluster, as we do (for example) in [Industrial Edge](/industrial-edge) where we have both datacenter and factory clusterGroups, and the factory clusterGroup is installed on the datacenter cluster by default.

# Single-Cluster and Multi-Cluster Patterns

Because Validated Patterns started as an Edge initiative, we designed the notion of multi-cluster patterns into the framework from the beginning. The first Validated Pattern, [Industrial Edge](/industrial-edge/) models a central data-lake and an optional remote factory cluster. The factory cluster does not need the CI or test system, nor the central data lake. Since we have different configuration needs on the two types of cluster, we define them as different cluster groups.

Other patterns only (so far) require a single cluster, since they model their Edge requirements in different ways. [Medical Diagnosis](/medical-diagnosis) brings a pre-provided set of data (which would ordinarily come in from Edge clusters). [Ansible Edge GitOps](/ansible-edge-gitops) has RHEL instances as its Edge environment, not OpenShift clusters - and it runs its VMs through OpenShift Virtualization so it only uses the one cluster. In these cases, it is simplest to
designate the single cluster as a Hub cluster.

# Uses for a Hub Cluster in a Multi-Cluster Deployment

But in multi-cluster deployments, it is often helpful to define a hierarchy. Even if there are exactly two clusters as part of a multi-cluster pattern, it may be helpful to define one as the "hub", in case the pattern grows to more clusters later. Modern architectures can scale to many instances, in some cases thousands, and there are certain responsibilities that are convenient to define as "central" or "hub" functions. Some examples that exist in the Framework and its applications so far:

1. Configuration Management (via Advanced Cluster Management, or by Ansible Automation Platform)
1. Data Aggregation (via AMQ Streams)
1. Continuous Integration/Continuous Delivery Pipelines (via OpenShift Pipelines)
1. Data Visualization (via Grafana)
1. Secrets storage and maintenance (via Vault and the External Secrets Operator)

Some other potential uses for the "hub" role or function include:

1. General "control plane" functions
1. Metrics aggregation

The hub role defines a place in the architecture to run these vital functions, while reserving capacity on the Edge for data gathering and pre-process functions.

But this naturally brings up a question - what are the different roles we have considered in the Validated Patterns framework, and how should they be used?

# Types of clusterGroup

While we describe the Validated Patterns framework as "opinionated", we do not want to make it overly constricting. The framework currently considered two types of clusterGroups: Hub and non-hub. We consider "Hub" as a role, primarily, but it is also used as the default name for the Hub clusterGroup. There are two important aspects of a Hub clusterGroup:

1. It is expected to be a singleton (there is expected to be a single hub cluster in the hub clusterGroup)
1. There is expected to be a single Hub clusterGroup in a given pattern

Generally, we expect that non-Hub clusterGroups will be Edge clusters, but this is not essential. A clusterGroup should have at least one cluster that it will apply to (otherwise, why define one?) and can have multiple clusters. The framework sets ArgoCD's `ignoreMissingValueFiles` setting to `true` unconditionally, and the framework also provides an `extraValueFiles` variable, which can define multiple optional additional values files on a per-clusterGroup basis.

# How the Hierarchy Works - the clustergroup Chart

The clustergroup chart begins by looking in the pattern's `values-global.yaml` for the `main.clusterGroupName` value. This value is then used to compute the next values file to process - if the value of that variable is `hub` then the application(s) that are created will use both the `values-global.yaml` and `values-hub.yaml` files in the root of the pattern repository. The `clusterGroup` structure will then be parsed for `name` and `isHubCluster` values; namespaces, subscriptions, projects and applications will be applied. Any managedClusterGroups (on the hubCluster) will be defined in terms for Advanced Cluster Management (as is done in [Industrial Edge](/industrial-edge)). Because the factory match expression is very general (`vendor In OpenShift`) this will match the hub cluster and any cluster that is joined to the hub cluster's ACM instance.

# Frequently Asked Questions (FAQs)

## I have a single-cluster Pattern. Do I need to call my hub cluster "hub"?

You can, but you do not have to. If you want to call it something other than `hub`:

1. Define a different `main.clusterGroupName` value in `values-global.yaml`
1. Create the `values-yourhubgroupname.yaml` in the root of your pattern repository.
1. Make sure `clusterGroup.name` variable in `values-yourhubgroupname.yaml` matches your intended hub group.

## I have a multi-cluster Pattern. All of my Edge clusters will have the same configuration. Do I need multiple clusterGroups to model it?

No! This is the exact scenario we had in mind when we designed clusterGroups. Just add multiple clusters with the same criteria you defined to the ACM instance on your hub cluster, and each cluster you add will get the same subscriptions and applications.

## I have a multi-cluster Pattern. How do I decide if I need multiple clusterGroups to model it?

Do you have different subscriptions or applications that you plan to use on your different clusterGroups? If so, you should define different clusterGroups and define them as managedClusterGroups for your hub cluster.
