---
layout: default
title: Creating a new pattern
nav_order: 5
has_children: true
---

# Creating a new pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Introduction to pattern creation

This section provides the details on how to create a new pattern using the validated patterns framework. Creating a new pattern might start from scratch or it maybe be from an existing deployment that would benefit from a repeatable framework based on GitOps.

This introduction explains some of framework design decisions and why they were chosen. There are some high level concepts that are required for the framework. While those concepts can be implemented using a variety of open source projects, this framework is prescriptive and so mentions the project and also (down stream) product that was used. E.g. For development builds we us Tekton (project) and specifically OpenShift Pipelines (product).

The framework uses popular Cloud Native Computing Foundation (CNCF) [projects](https://landscape.cncf.io/) as much as possible. The CNCF landscape also contains lots of projects that solve the same or similar problem. The validated patterns effort has chosen specific projects but it is not unreasonable for users to switch out one project for another. (See more on Operators below).

There is no desire to replicate efforts already in CNCF. If new a open source project comes out of this framework, the plan would be to contribute that to CNCF.

## Who creates patterns?

Many enterprise class Cloud Native applications are complex and require man different application services integrated together. Organizations can learn from each other on how to create robust, scalable and maintainable systems. When you find a pattern that seems to work, it makes sense to promote best practices to others in order for them to not repeat the many failures you probably made while getting to your killer pattern.

In the world of DevOps (including DevSecOps and GitOps) teams should include personnel from development, operations, security, and architects. What makes DevOps work is the collaboration of all these IT personnel and the business owners and others. As DevOps practices move through your organization, best practices are shared and standards evolve.

This validate patterns framework has evolved since it was started in 2019. It will likely continue to evolve. But what was learned is that there are some common concepts that need to be addressed once you desire to generalize your organizations framework.

Therefore, the goal is, that developers, operators and architects will use this framework to have secure and repeatable day one deployment mechanism and maintenance automation for day two operations.

## A common platform

One of the most important goals of this framework is to provide consistency across any cloud provider - public or private. Public cloud providers each have Kubernetes distributions. And while they keep up with the Kubernetes release cycle, they are not always running on the same version. Furthermore each cloud provider provides their own sets of services that developers often consume. So while you could automate the difference handling for each of the cloud providers, the framework utilizes one Kubernetes distribution that runs on public or private clouds - the hybrid and/or multi cloud model.

The framework depends on Red Hat OpenShift Container Platform (OCP). Once you have deployed Red Hat OCP wherever you wish to deploy your cloud native application pattern, then the framework can deploy on that platform in a few easy steps.

## Containment beyond containers

If you are reading this chances are you are already familiar with Linux containers. But there is more to containers than Linus containers in the Cloud Native environment.

### Containers

Containers allow you to encapsulate your program/process, and all its dependencies in one package called a container image. The container runtime starts an instance of this container using only the Linux kernel and the directory structure, with program and dependencies, provided in the container image. This ensures that the program is running isolated from any other packages, programs or files loaded on the host system.

Kubernetes, and the Cloud Native community of services, use Linux containers as their basic building block.

### Operators

While Linux containers provide an incredibly useful way to isolate the dependencies for an application or application service, containers also require some life cycle management. For example, at start up a container my need to set up access to networks, or extra storage. This type of set up usually happens with a human operator decided on how the container will connect networks or host storage. The operator may also have to do routine maintenance. For example if the container contains a database, the human operator may need to do a backup or routine scrubbing of the database.

Kubernetes [Operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) is an extension to Kubernetes *"that make sue of custom resources to manage applications and their components."* I.e. it provides and extra layer of encapsulation on top of containers that packages up some operation automation with the container. It puts what the human operator would do into an Operator pattern for the service or set of services.

Many software providers/vendors have created operators to manage their application or service lifecycle. Red Hat OpenShift provides a a [catalog of certified Operators](https://catalog.redhat.com/software/operators/search) that application develops can consume as part of their overall application. The validated patterns makes use of these certified Operators as much as possible. Having a common platform like Red Hat OpenShift helps reduce risk by using certified Operators.

### Validated patterns

Assembling operators into a common pattern provides another layer of encapsulation. As with an Operator, where the developer can take advantage of the best practices from a experienced human operator, a validated pattern provides a way of taking advantage of best practices for deploying operators and other assets for a particular type of solution. Rather than starting from scratch to figure out how to deploy and manage a complex set of integrated and dependent containerized services, a developer can take a validated pattern and know that a lot of experience has been put into it.

[![Validated pattern stack](/images/framework/validated-patterns-stack.png)](/images/framework/validated-patterns-stack.png)

A validated pattern has been tested and continues to be tested as the life cycle of individual parts (Operators) change through release cycles. Red Hat's Quality Engineering team provides Continuous Integration of the pattern for new releases of Red Hat products (Operators).

The validated patterns framework takes advantage of automation technology. It uses Cloud Native automation technology as much as possible. Occasionally the framework resorts to some scripts in order to get a pattern up and running faster.

## Automation has many layers

As mentioned above gaining consistency and robustness for deploying complex Cloud Native applications requires automation. While it many Kubernetes distributions, including OpenShift, provide excellent user interfaces for deploying and managing applications, this is mostly useful during development and/or debugging when things go wrong. Being able to consistently deploy complex applications is critical.

But which automation tool should be used? Or which automation tools, plural? During the development of the validated patterns framework we learned important lessons on the different areas of automation.

### Automation for building application code

When developing container based Cloud Native applications a developer needs build executable code and create a new container image for deployment into their Kubernetes test environment. Once tested, that container image needs to be moved through the continuous integration and continuous deployment (CI/CD) pipeline until it ends up in production. [Tekton](https://tekton.dev/) is a Cloud Native CI/CD project that is build for hybrid-cloud. [OpenShift Pipelines](https://cloud.redhat.com/learn/topics/ci-cd) is a Red Hat product based on Tekton.

### Automation for application operations

There are two aspects to consider for operations when doing automation. First you must be able to package up much of the configuration that is required for deploying Operators and pods. The validated patterns framework started with a project called Kustomize which allows you to assemble complex deployment YAML to apply to your Kubernetes cluster. Kustomize is a powerful tool, and almost achieved what we needed. However it fell short when we needed to propagate variable data into our deployment YAML. Instead we chose [Helm](https://cloud.redhat.com/learn/topics/helm) because it provides templating and can therefore handle the injection of variable data into the deployment package. See more on templating [here](https://helm.sh/docs/helm/helm_template/).

The second aspect of automation for application automation deals with both workflow and GitOps. Validated patterns requires that a workflow deploys various components of the complex application. Visibility into the success or failure of those application components is really important. After the initial deployment it is important to role out configuration changes in an automated way using a code repository. This is achieved using GitOps. i.e. Using a Git repository as a mechanism to change configuration that triggers the automatic roll-out of those changes.

*"Application definitions, configurations, and environments should be declarative and version controlled. Application deployment and lifecycle management should be automated, auditable, and easy to understand."*  - Argo CD project

OpenShift GitOps is based on the [Argo CD](https://argo-cd.readthedocs.io/en/stable/) project. It is a GitOps continuous delivery tool for Kubernetes.

## Secret handling

Validated patterns often depend on resources that require certificates or keys. These secrets need to be handled carefully. And while it's tempting to focus on just the deployment of the pattern and "handle security later", that's a really bad idea. In the spirit of DevSecOps the validated patterns effort has decided to "shift security left". i.e. build security in early in the life cycle.

When it comes to security, the approach requires patience and care to set up. There is no avoiding some manual steps but validated patterns tries to automate as much as possible while at the same time taking the lid off so developers can see what was and needs to be done.

There are two approaches to secret handling with validated:

   - Using special configuration files. This is fine for initial development but not for production.
   - Using a Cloud Native secrets handling tool e.g. [Vault](https://www.vaultproject.io/docs/platform/k8s) or [Conjur](https://www.conjur.org/solutions/secrets-management/)

Some of the validated patterns use configuration files (for now), while others, like the [Multicloud GitOps](https://hybrid-cloud-patterns.io/multicloud-gitops/) uses Vault. *TBD add a link to the Vault set up page here when completed*

## Policy

While many enterprise Cloud Native applications use open source, many of the products used require licenses or subscriptions. Policies help enforce license and subscription management and the channels needed to get access to those licenses or subscriptions.

Similarly in a multicloud deployments and complex edge deployments policies can help define and select the correct GitOps workflows that need to be managed for various sites or clusters. E.g. defining an OpenShift Cluster as a "Factory" in the [Industrial Edge](https://hybrid-cloud-patterns.io/industrial-edge/factory/) validated pattern provides a simple trigger to roll-out the entire Factory deployment. Policy is a very powerful tool in automation.

Validated patterns uses [Red Hat Advanced Cluster Management for Kubernetes](https://www.redhat.com/en/technologies/management/advanced-cluster-management) to control clusters and applications from a single console, with built in security policies.
