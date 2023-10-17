---
title: Multicloud GitOps with Portworx Enterprise
date: 2023-18-05
validated: false
summary: This pattern helps you develop and deploy applications on an open hybrid cloud in a stable, simple, and secure way. It includes persistent storage for stateful applications.
products:
- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
- Portworx Enterprise
industries:
- General
aliases: /multicloud-gitops-Portworx/
pattern_logo: multicloud-gitops-Portworx.png
links:
  install: getting-started
  help: https://groups.google.com/g/validatedpatterns
  bugs: https://github.com/portworx/rh-multicloud-gitops-pxe/issues
# ci: mcgitopspxe
---

# Multicloud GitOps with Portworx Enterprise

_Some details will differ based on the requirements of a specific implementation but all validated patterns, based on a portfolio architecture, generalize one or more successful deployments of a use case._

**Use case:**

- Use a GitOps approach to manage hybrid and multi-cloud deployments across both public and private clouds.
- Enable cross-cluster governance and application lifecycle management.
- Securely manage secrets across the deployment.
- Deploy and configure Portworx Enterprise persistent storage for stateful applications.

**Background:**
Organizations are aiming to develop, deploy, and operate applications on an open hybrid cloud in a stable, simple, and secure way. This hybrid strategy includes multi-cloud deployments where workloads might be running on multiple clusters and on multiple clouds—private or public. It include Portworx Enterprise for persistent storage and Kubernetes data services required for stateful applications.

This strategy requires an infrastructure-as-code approach: GitOps. GitOps uses Git repositories as a single source of truth to deliver infrastructure-as-code. Submitted code checks the continuous integration (CI) process, while the continuous delivery (CD) process checks and applies requirements for things like security, infrastructure-as-code, or any other boundaries set for the application framework. All changes to code are tracked, making updates easy while also providing version control should a rollback be needed.

## Solution overview

This architecture covers hybrid and multi-cloud management with GitOps as shown in Figure 1. At a high level this requires a management hub, for DevOps and GitOps, and infrastructure that extends to one or more managed clusters running on private or public clouds. The automated infrastructure-as-code approach can manage the versioning of components and deploy according to the infrastructure-as-code configuration.

**Why Hybrid Multicloud management with GitOps ?**

- Unify management across cloud environments.
- Dynamic infrastructure security.
- Infrastructural continuous delivery best practices.

[![Multi-Cloud Architecture](/images/multicloud-gitops-Portworx/hybrid-multicloud-management-gitops-hl-arch.png)](/images/multicloud-gitops/hybrid-multicloud-management-gitops-hl-arch.png)

_Figure 1 shows a high-level overview of the solution including the business drivers, management hub, and the clusters under management._

## Logical diagram

[![Logical Architecture](/images/multicloud-gitops-Portworx/logical-diagram.png)](/images/multicloud-gitops-Portworx/logical-diagram.png)

_Figure 2. Logical diagram of hybrid multi-cloud management with GitOps._

As you can see in Figure 2, logically this solution can be viewed as being composed of an automation component, unified management (including secrets management), and the cluster(s) under management—all running on top of a user-chosen mixture of on-prem data center(s) and public cloud(s).

## The technology

The following technology was chosen for this solution.

[_Red Hat OpenShift Platform_](https://www.redhat.com/en/technologies/cloud-computing/openshift/try-it) is an enterprise-ready Kubernetes container platform built for an open hybrid cloud strategy. It provides a consistent application platform to manage hybrid cloud, public cloud, and edge deployments. It delivers a complete application platform for both traditional and cloud-native applications, allowing them to run anywhere. OpenShift has a pre-configured, pre-installed, and self-updating monitoring stack that provides monitoring for core platform components. It also enables the use of external secret management systems (like HashiCorp Vault in this case) to securely add secrets into the OpenShift platform.

[_Red Hat OpenShift GitOps_](https://www.redhat.com/en/technologies/cloud-computing/openshift/try-it) is a declarative application continuous delivery tool for Kubernetes based on the ArgoCD project. Application definitions, configurations, and environments are declarative and version controlled in Git. It can automatically push the desired application state into a cluster, quickly find out if the application state is in sync with the desired state, and manage applications in multi-cluster environments.

[_Red Hat Advanced Cluster Management for Kubernetes_](https://www.redhat.com/en/technologies/management/advanced-cluster-management) controls clusters and applications from a single console, with built-in security policies. Extends the value of Red Hat OpenShift by deploying apps, managing multiple clusters, and enforcing policies across multiple clusters at scale.

[_Red Hat Ansible Automation Platform_](https://www.redhat.com/en/technologies/management/ansible) provides an enterprise framework for building and operating IT automation at scale across hybrid clouds including edge deployments. It enables users across an organization to create, share, and manage automation—from development and operations to security and network teams.

[_Portworx Enterprise_](https://portworx.com/redhat) provides persistent storage and Kubernetes data services to Red Hat OpenShift. Persistence is necessary for stateful applications in Kubernetes environments. Portworx also provides business continuity with [Portworx Backup](https://www.redhat.com/en/resources/portworx-backup-partner-solution-brief) and [Portworx DR](https://www.redhat.com/en/resources/portworx-disaster-recovery-brief) products that will be incorporated in a future GitOps pattern.

**Hashicorp Vault**  provides a secure centralized store for dynamic infrastructure and applications across clusters, including over low-trust networks between clouds and data centers.

This solution also uses a variety of _observability tools_ including the Prometheus monitoring and Grafana dashboard that are integrated with OpenShift as well as components of the Observatorium meta-project which includes Thanos and the Loki API.

## Architectures

Figure 3 provides a schematic diagram overview of the complete solution including both components and data flows.

Subsequent schematic diagrams go into more detail on:

- Bootstrapping the management hub (Figure 4)
- Hybrid multi-cloud GitOps (Figure 5)
- Dynamic security management (Figure 6)
- Observability in hybrid multi-cloud environments (Figure 7)

[![Physical Architecture](/images/multicloud-gitops-Portworx/schema-gitops.png)](/images/multicloud-gitops-Portworx/schema-gitops.png)

_Figure 3. Overview schematic diagram of the complete solution._

### Bootstrapping the management hub

[![Schematic diagram of bootstrapping the management hub](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-install.png)](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-install.png)

_Figure 4. Schematic diagram of bootstrapping the management hub._

As detailed below, Figure 4 provides a schematic diagram showing the setup of the management hub using Ansible playbooks.

- Set up the Red Hat OpenShift Platform that hosts the Management Hub. The OpenShift installation program provides flexible ways to install OpenShift. An  Ansible playbook kicks off the installation with necessary configurations.
- Ansible playbooks are again used to deploy and configure Red Hat Advanced Cluster Management for Kubernetes and, later, other supporting components (such as external secrets management) on top of the provisioned OpenShift cluster.
- Another Ansible playbook installs HashiCorp Vault, a Red Hat partner product chosen for this solution that can be used to manage secrets for OpenShift clusters.
- An Ansible playbook is used again to configure and trigger the Openshift GitOps operator on the hub cluster. This deploys the Openshift GitOps instance to enable continuous delivery.

### Hybrid multicloud GitOps

[![Schematic diagram of hybrid multi-cloud management with GitOps](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-security.png)](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-security.png)

_Figure 5. Schematic diagram of hybrid multi-cloud management with GitOps._

As detailed below, Figure 5 provides a schematic diagram showing remaining activities associated with setting up the management hub and clusters using Red Hat Advanced Cluster Management.

- Manifest and configuration are set as code template in the form of “Kustomization” yaml. It describes the end desire state of how the managed cluster is going to be like. When done, it is pushed into the source control management repository with a version assigned to each update.
- OpenShift GitOps watches the repository and detects changes in the repository.
- OpenShift GitOps creates/updates the manifest by creating Kubernetes objects on top of Red Hat Advanced Cluster Management.
- Red Hat Advanced Cluster Management provision/update/delete managed clusters and configuration according to the manifest. In the manifest, you can configure what cloud provider the cluster will be on, the name of the cluster, infra node details and worker node. Governance policy can also be applied as well as provision an agent in the cluster as the bridge between the control center and the managed cluster.
- OpenShift GitOps will continuously watch between the code repository and status of the clusters reported back to Red Hat Advanced Cluster Management. Any configuration drift or in case of any failure, it will automatically try to remediate by applying the manifest (Or showing alerts for manual intervention).

### Dynamic security management

[![Schematic showing the setup and use of external secrets management](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-security.png)](/images/multicloud-gitops-Portworx/spi-multi-cloud-gitops-sd-security.png)

_Figure 6. Schematic showing the setup and use of external secrets management._

As detailed below, Figure 6 provides a schematic diagram showing how secrets are handled in this solution.

During setup, the token to securely access HashiCorp Vault is stored in Ansible Vault. It is encrypted to protect sensitive content.

Red Hat Advanced Cluster Management for Kubernetes allows us to have centralized control over the managed clusters. It acquires the token from Ansible Vault during install and distributes it among the clusters.

To allow the cluster access to the external vault, we need to set up the external secret management (with Helm in this study). OpenShift Gitops is used to deploy the external secret object to a managed cluster.

External secret management fetches secrets from HashiCorp Vault using the token we created in step 2 and constantly watches for updates.
Secrets are created in each namespace, where applications can use them.

## Demo Scenario

## Download diagrams

View and download all of the diagrams above in our open source tooling site.

[[Open Diagrams]](https://www.redhat.com/architect/portfolio/tool/index.html?#gitlab.com/osspa/portfolio-architecture-examples/-/raw/main/diagrams/spi-multi-cloud-gitops.drawio)

## What Next

- [Deploy the management hub](getting-started)  using Helm
- Add a managed cluster to [deploy the  managed cluster piece using ACM](managed-cluster)
