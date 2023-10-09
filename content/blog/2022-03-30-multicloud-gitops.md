---
date: 2022-03-30
title: Multi-Cloud GitOps
summary: A validated pattern for multi-cluster and/or multi-cloud gitops
author: Martin Jackson
blog_tags:
- multi-cloud gitops
- xray
- validated-pattern
aliases: /2022/03/30/multicloud-gitops/
---

# Validated Pattern: Multi-Cloud GitOps

## Validated Patterns: The Story so far

Our first foray into the realm of Validated Patterns was the adaptation of the MANUela application and its associated tooling to ArgoCD and Tekton, to demonstrate the deployment of a fairly involved IoT application designed to monitor industrial equipment and use AI/ML techniques to predict failure.  This resulted in the Industrial Edge validated pattern, which you can see [here](https://github.com/validatedpatterns/industrial-edge).

This was our first use of a framework to deploy a significant application, and we learned a lot by doing it.  It was good to be faced with a number of problems in the “real world” before taking a look at what is really essential for the framework and why.

All patterns have at least two parts:  A “common” element (which we expect to be the basic framework that nearly all of our patterns will share) and a pattern-specific element, which uses the common pattern and expands on it with pattern-specific content.  In the case of Industrial Edge, the common component included secret handling, installation of the GitOps operator, and installation of Red Hat Advanced Cluster Management.  The pattern-specific components included the OpenShift Pipelines Operator, the AMQ Broker and Streams operators, Camel-K, the Seldon Operator, OpenDataHub, and Jupyter Notebooks and S3 storage buckets.

## Multi-Cloud GitOps: The Why and What

After finishing with Industrial Edge, we recognized that there were some specific areas that we needed to tell a better story in.  There were several areas where we thought we could improve the user experience in working with our tools and repos.  And we recognized that the pattern might be a lot clearer in form and design to those of us who worked on it than an interested user from the open Internet.

So we had several categories of work to do as we scoped this pattern:

* *Make a clear starting point:* Make a clear “entry point” into pattern development, and define the features that we think should be common to all patterns.  This pattern should be usable as a template for both us and other users to be able to clone as a starting point for future pattern development.
* *Make “common” common:* Since this pattern is going to be foundational to future patterns, remove elements from the common framework that are not expected to be truly common to all future patterns (or at least a large subset of them).  Many elements specific to Industrial Edge found their way into common; in some cases we thought those elements truly were common and later re-thought them.
* *Improve secrets handling:* Provide a secure credential store such that we can manage secrets in that store rather than primarily as YAML files on a developer workstation.  Broker access to that secret store via the External Secrets Operator to ensure a level of modularity and allow users to choose different secret stores if they wish. We also want to integrate the usage of that secret store into the cluster and demonstrate how to use it.
* *Improve support for cluster scalability:* For the Industrial Edge pattern, the edge cluster was technically optional (we have a supported model where both the datacenter and factory applications can run on the same cluster).  We want these patterns to be more clearly scalable, and we identified two categories of that kind of scalability:

1. Clusters vary only in name, but run the same applications and the same workloads
1. Clusters vary in workloads, sizing, and configuration, and allow for considerable variability.

Many of the elements needed to support these were present in the initial framework, but it may not have been completely clear how to use these features, or they were couched in terms that only made sense to the people who worked on the pattern.  This will now be clearer for future patterns, and we will continue to evolve the model with user and customer feedback.

## Key Learning: Submodules are hard, and probably not worth it

1. Copy and Paste
1. Git Submodules
1. Git Subtrees

We rejected the notion of copy and paste because we reasoned that once patterns diverged in their “common” layer it would be too difficult and painful to bring them back together later.  More importantly, there would be no motivation to do so.

In Industrial Edge, we decided to make common a git submodule.  Git submodules have been a feature of git for a long time, originally intended to make compiling a large project with multiple libraries more straightforward, by having a parent repo and an arbitrary set of submodule repos.  Git submodule requires a number of exceptions to the “typical” git workflow - the initial clone works differently, and keeping the submodule updated to date can trip users up.  Most importantly, it requires the practical management of multiple repositories, which can make life difficult in disconnected environments, which are important to us to support.  It was confusing for our engineers to understand how to contribute code to the submodule repository.  Finally, user response to the exceptions they had to make because of submodules was universally negative.

So going forward, because it is still important to have a common basis for patterns, and a clear mechanism and technical path to get updates to the common layer, we have moved to the subtree model as a mechanism for including common.  This allows consumers of the pattern to treat the repo as a single entity instead of two, and does not require special syntax or commands to be run when switching branches, updating or, in many cases, contributing to common itself.

## Key Learning: Secrets Management

One of our biggest challenges in following GitOps principles for the deployment of workloads is the handling of secrets.  GitOps tells us that the git repo should be the source of truth - but we know that we should not store secrets directly in publicly accessible repositories.  Previously, our patterns standardized the use of YAML files on the developer workstation as the de-facto authoritative secret store.  This can be problematic for at least two reasons: for one, if two people are working on the same repo, which secret store is “right”?  Secondly, it might be easier to retrieve credentials from a developer workstation due to information breach or theft. Our systems will not work without secrets, and we need to have a better way of working with them.

## Highlight: Multi-cloud GitOps is the “Minimum Viable Pattern”

One of the goals of this pattern is to provide the minimal pattern that both demonstrates the goals, aims and purpose of the framework and does something that we think users will find interesting and valuable.  We plan to use it as a starting point for our own future pattern development; and as such we can point to it as the pattern to clone and start with if a user wants to start their own pattern development from scratch.

## New Feature: Hub Cluster Vault instance

In this pattern, we introduce the ability to reference upstream helm charts, and pass overrides to them in a native ArgoCD way.  The first application we are treating this way is Hashicorp Vault.  The use of Vault also allows us to make Vault the authoritative source of truth for secrets in the framework.  This also improves our security posture by making it significantly easier to rotate secrets and have OpenShift “do the right thing” by re-deploying and re-starting workloads as necessary.

For the purposes of shipping this pattern as a runnable demonstration, we take certain shortcuts with security that we understand are not best practices - storing the vault keys unencrypted on a developer drive, for example. If you intend to run code derived from this pattern in production, we strongly recommend you consider and follow the practices documented [here](https://learn.hashicorp.com/tutorials/vault/pattern-unseal?in=vault/recommended-patterns).

## New Feature: External Secrets Operator

While it is important to improve the story for secret handling in the pattern space overall, it is also important to provide space for multiple solutions inside patterns. Because of this, we include the external secrets operator, which in the pattern uses vault, but can be used to support a number of other secret providers, and can be extended to support secrets providers that it does not already support.  Furthermore, the external secrets approach is less disruptive to existing applications, since it works by managing the secret objects applications are already used to consuming.  Vault provides different options for integration, including the agent injector, but this approach is very specific to Vault and not clearly portable.

In a similar note to the feature about Vault and secrets: the approach we take in this release of the pattern has some known security deficiencies.  In RHACM prior to 2.5, policies containing secrets will not properly cloak the secrets in the policy objects, and will not properly encrypt the secrets at rest.  RHACM 2.5+ includes a fromSecret function that will secure these secrets in transit and at rest in both of these ways.  (Of course, any entity with cluster admin access can recover the contents of a secret object in the cluster.)  One additional deficiency of this approach is that the lookup function we use in the policies to copy secrets only runs when the policy object is created or refreshed - which means there is not a mechanism within RHACM presently to detect when a secret has changed and the policy needs to be refreshed.  We are hoping this functionality will be included in RHACM 2.6.

## New Feature: clusterGroups can have multiple cluster members

Using Advanced Cluster Management, we can inject per-cluster configuration into the ArgoCD application definition.  We do this, for example, with the global.hubClusterDomain and global.localClusterDomain variables, which are available to use in helm templates in applications that use the framework.

This enables one of our key new features, the ability to deploy multiple clusters that differ only in local, cluster-defined ways (such as the FQDNs that they would publish for their routes).  This is a need we determined when we were working on Industrial Edge, where we had to add the FQDN of the local cluster to a config map, for use in a browser application that was defined in kubernetes, but runs in a user’s browser.

The config-demo namespace uses a deployment of the Red Hat Universal Base Image of httpd to demonstrate how to use the framework to pass variables from application definition to actual use in config maps.  The config-demo app shows the management of a secret defined and securely transferred from the hub cluster to remote clusters, as well as allowing for the use of the hub cluster base domain and the local cluster base domain in configuration of applications running on either the hub or managed clusters.

## Where do we go from here?

One of the next things we are committed to delivering in the new year is a pattern to extend the concept of GitOps to include elements that are outside of OpenShift and Kubernetes - specifically Red Hat Enterprise Linux nodes, including Red Hat Enterprise Linux For Edge nodes, as well as Red Hat Ansible Automation Platform.

We plan on developing a number of new patterns throughout the new year, which will showcase various technologies.  Keep watching this space for updates, and if you would like to get involved, visit our site at [https://validatedpatterns.io](https://validatedpatterns.io)!
