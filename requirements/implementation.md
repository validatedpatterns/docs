---
layout: default
title: Implementation Requirements
parent: Requirements
has_children: false
nav_order: 4
published: false
---

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Technical Requirements

Additional requirements specific to the implementation for all Community, Validated, and Supported patterns

* _PTN1._ Patterns **MUST** include one or more Git repositories, in a publicly accessible location, containing configuration elements that can be consumed by the OpenShift GitOps operator (ArgoCD) without supplying custom ArgoCD images.
* _PTN2._ Patterns CAN include additional configuration and/or demo elements located in one or more additional private git repos.
* _PTN3._ Patterns **MUST** be useful without all content stored in private git repos
* _PTN4._ Patterns **MUST** include a list of names and versions of all the products and projects being consumed by the pattern
* _PTN5._ Patterns SHOULD include sample application(s) to demonstrate the business problem(s) addressed by the pattern.  
* _PTN6._ Patterns SHOULD try to indicate which parts are foundational as opposed to being for demonstration purposes. 
* _PTN7._ Patterns **MUST** be useful without any sample applications that are private or lack public sources. 
Patterns must not become useless due to bit rot or opaque incompatibilities in closed source “applications”.
* _PTN8._ Patterns **MUST NOT** store sensitive data elements, including but not limited to passwords, in Git
* _PTN9._ Patterns **MUST** be possible to deploy on any IPI-based OpenShift cluster (BYO)
We distinguish between the provisioning and configuration requirements of the initial cluster (“Patterns”), and of clusters/machines managed by the initial cluster (see “Managed clusters”) 
* _PTN10._ Patterns **MUST** use the https://github.com/hybrid-cloud-patterns/common/tree/main/clustergroup Helm chart, as the initial OpenShift GitOps application that describes all namespaces, subscriptions, and any other GitOps applications which contain the configuration elements that make up the solution.
* _PTN11._ Patterns SHOULD use the VP operator to deploy patterns.  However anything that creates the OpenShift GitOps subscription and initial clustergroup application could be acceptable.
* _PTN12._ Patterns CAN include automation that deploys a known set of clusters and/or machines in a specific topology 
* _PTN13._ Patterns CAN limit functionality/testing claims to specific platforms, topologies, and cluster/node sizes
* _PTN14._ Patterns SHOULD embody the “open hybrid cloud model” unless there is a compelling reason to limit the availability of functionality to a specific platform or topology.
* _PTN15._ Patterns SHOULD use industry standards and Red Hat products for all required tooling 
Patterns prefer current best practices at the time of pattern development. Solutions that do not conform to best practices should expect to justify non-conformance and/or expend engineering effort to conform.
* _PTN16._ Patterns SHOULD NOT make use of upstream/community operators and images except, depending on the market segment, where critical to the overall solution. 
Such operators are forbidden to be deployed into an increasing number of customer environments, which limits reuse.
Alternatives include productizing the operator, and building it in-cluster from trusted sources as part of the pattern.
* _PTN17._ Patterns CAN consume operators from established partners (eg. Hashicorp Vault, and Seldon)
* _PTN18._ Patterns SHOULD be decomposed into modules that perform a specific function, so that they can be reused in other patterns.  
For example, Bucket Notification is a capability in the Medical Diagnosis pattern that could be used for other solutions.
* _PTN19._ Patterns SHOULD use Ansible Automation Platform to drive the declarative provisioning and management of managed hosts (eg. RHEL). See also “Imperative elements”.
* _PTN20._ Patterns CAN include managed clusters
* _PTN21._ Patterns CAN include details or automation for provisioning managed clusters, or rely on the admin to pre-provision them out-of-band. 
* _PTN22._ Patterns SHOULD use RHACM to manage policy and compliance on any managed clusters.
* _PTN23._ Patterns SHOULD use RHACM and the https://github.com/hybrid-cloud-patterns/common/tree/main/acm chart to deploy and configure OpenShift GitOps to managed clusters.
* _PTN24._ Patterns CAN also choose to model multi-cluster solutions as an uncoordinated collection of “initial hub clusters”
* _PTN25._ Managed clusters SHOULD be loosely coupled to their hub, and use OpenShift GitOps to consume applications and configuration directly from Git as opposed to having hard dependencies on a centralized cluster. 
* _PTN26._ Managed clusters **MUST** operate on the premise of “eventual consistency” (automatic retries, and an expectation of idempotence), which is one of the essential benefits of the GitOps model.
* _PTN27._ Managed clusters SHOULD use the “pull” deployment model for obtaining their configuration.
* _PTN28._ Imperative elements **MUST** be implemented as idempotent code stored in Git
* _PTN29._ Imperative elements CAN interact with cluster state and/or external influences
* _PTN30._ Imperative elements SHOULD be implemented as Ansible playbooks
* _PTN31._ Imperative elements SHOULD be driven declaratively – by which we mean that the playbooks should be triggered by Jobs and/or CronJobs stored in Git and delivered by OpenShift GitOps.
