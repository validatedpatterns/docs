---
date: 2022-12-01
title: Multicluster DevSecOps
summary: A validated pattern that uses OpenShift Platform Plus and OpenShift Pipelines to securely build, scan, and deliver applications
author: William Henry and Jonny Rickard
blog_tags:
- openshift-platform-plus
- devsecops
- devops
- security
- patterns
- acs
- pipelines
- quay
aliases: /2022/12/01/multicluster-devsecops/
---

# Multicluster DevSecOps

## Software supply chain security: The why and what

Today more and more organizations are turning to agile development models and DevOps. With this approach, development organizations can deliver more enhancements and bug fixes in a timely manner, providing more value to their customers. While DevOps can include security earlier in the software lifecycle, in practice this has not always been the case. DevSecOps explicitly calls on organizations to pay attention to security best practices and to automate them or “Shift Left” as much as possible.

DevSecOps means baking in  application and infrastructure security from the start. In order to be successful, organizations must look both upstream where their dependencies come from, and also how their components integrate together in the production environment. It also means automating security gates to keep the DevOps workflow from slowing down. As we learn from experience, we codify that into the automation process.

A successful DevSecOps based supply chain must consider four areas of concern:

1. Secure developer dependencies
1. Secure code development
1. Secure deployment of resources into a secure environment
1. Software Bill of Materials (SBOM)

Within each of these areas there are also many best practices to be applied particularly in Cloud Native development using container technology.

* Scanning new development code for potential vulnerabilities
* Scanning dependent images that new code will be layered upon
* Attesting to the veracity of images using image signing
* Scanning images for know CVEs
* Scanning the environment for potential networking vulnerabilities
* Scanning for misconfiguration of images and other assets
* Ensuring consistent automated deployment of secure configuration using GitOps
* Continuous upgrading of security policies from both trusted third parties and experience

This pattern deploys several Red Hat Products:

* Red Hat OpenShift Container Platform (Kubernetes platform)
* [Red Hat OpenShift GitOps](https://catalog.redhat.com/software/operators/detail/5fb288c70a12d20cbecc6056) (ArgoCD)
* [Red Hat Advanced Cluster Management](https://catalog.redhat.com/software/operators/detail/5ec54aa3535cb70ab8c02996) (Open Cluster Management)
* [Red Hat OpenShift Pipelines](https://catalog.redhat.com/software/operators/detail/5ec54a4628834587a6b85ca5) (Tekton)
* [Red Hat Quay](https://catalog.redhat.com/software/operators/detail/5ec53f9d535cb70ab8c02991) (OCI image registry with security features enabled)
* [Red Hat Open Data Foundation](https://catalog.redhat.com/software/operators/detail/60e6cf098d715a89c4e8625c) (highly available storage)
* [Red Hat Advanced Cluster Security](https://catalog.redhat.com/software/operators/detail/60eefc88ee05ae7c5b8f041c) (scanning and monitoring)

## Highlight: Multicluster

While all of the components can be deployed on a single cluster, which makes for a simple demo, this pattern deploys a real world architecture where the central management, development environments, and production are all deployed on different clusters. This ensures that the pattern is structured for real-world deployments, with all the functionality needed to make such an architecture work already built-in, so that pattern consumers can concentrate on what is being delivered, rather than how.

[![Multicluster DevSecOps Architecture](/images/devsecops/logical-devsecops.png)](/images/devsecops/logical-devsecops.png)

The heavy lifting in the pattern includes a great deal of integration between components, especially those spanning across clusters:

* Deployment of Quay Enterprise  with OpenShift Data Foundations as a storage backend
* Deployment of Quay Bridge operator configured to connect with Quay Enterprise on hub cluster
* Deployment of ACS on managed nodes with integration back to ACS central on the hub
* Deployment of a secure pipeline with scanning and signing tools, including ACS

## Highlight: DevSecOps with Pipelines

*"OpenShift Pipelines makes CI/CD concepts such as a 'pipeline', a 'task', a 'step' natively instantiatable [sic] so it can use the scalability, security, ease of deployment capabilities of Kubernetes."* ([Introducing OpenShift Pipelines](https://cloud.redhat.com/blog/introducing-openshift-pipelines)). The pattern consumes many of the OpenShift Pipelines out of the box tasks but also defines new tasks for scanning and signing and includes them in enhanced DevSecOps pipelines.

[![Multicluster DevSecOps Architecture - development schema](/images/devsecops/schema-devel-pipeline.png)](/images/devsecops/schema-devel-pipeline.png)

While these pipelines are included in the pattern, the pattern also implements  the use of [Pipelines-as-Code](https://cloud.redhat.com/blog/create-developer-joy-with-new-pipelines-as-code-feature-on-openshift) feature where the pipeline can be part of the application code repository. *"This allows developers to ship their CI/CD pipelines within the same git repository as their application, making it easier to keep both of them in sync in terms of release updates."*

## Highlight: Using the CI Pipeline to provide supply chain security

This pattern includes some other technologies in the development CI pipeline, including cosign, a SIGSTORE project, implemented with [Tekton Chains](https://next.redhat.com/2022/10/06/signing-images/). [Cosign](https://docs.sigstore.dev/cosign/overview/) supports container signing, verification, and storage in an OCI registry. It enables consumers to sign their pipeline resources and images and share the attestation files providing downstream consumers assurances that they are consuming a trusted artifact.

We also implement open source tools like [Sonarqube](https://www.sonarqube.org/) for static code analysis, [nexus](https://www.sonatype.com/products/nexus-repository?topnav=true) for securely storing build artifacts in-cluster, and an open source reports application that is used to upload and present the reports from the security pipeline.

Not using these tools in your environment? That’s not a problem. The pattern framework is flexible. Organizations using different services can swap out what’s in the pattern with their software of choice to fit their environment.

## Where do we go from here?

This pattern provides a complete deployment solution for Multicluster DevSecOps that can be used as part of a supply chain deployment pattern across different industries.

Documentation for how to install the pattern is [here](/devsecops/), where there are detailed installation instructions and more technical details on the different components in the pattern.
