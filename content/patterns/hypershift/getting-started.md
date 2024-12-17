---
title: Getting Started
weight: 20
aliases: /hypershift/getting-started/
---

# Deploying a Hosted Control Plane

## Prerequisites and workflow

- Install the multicluster engine for Kubernetes Operator (MCE) in a Openshift standalone cluster.
- Create an instance of `MultiClusterEngine` to enable `hypershift`.
- Create an S3 bucket that hosted control plane will use for OpenID Connect (OIDC).

From here we will need to know which provider we will use mainly. If we will focus in self-manage on-premise we will need to make sure that Assisted Installer (Agent) and/or Openshift Virtualization are installed and configured properly.

For Assisted Installer (Agent), we need to follow [this guide](https://hypershift-docs.netlify.app/how-to/agent/create-agent-cluster/#configure-agent-service), where basically you configures the `AgentServiceConfig` resource. This will allow the infrastructure operator to deploy Assisted Installer pods in the same `multicluster-engine` namespace.
For Openshift Virtualization (Kubevirt), we need to install a separated operator called `kubevirt-hyperconverged` which will make sure all the components are ready to use Openshift Virtualization.

If your focus is the cloud, you don't need to install additional resources in your Management clusters, you only will need to configure the IAM in AWS.

## How to deploy a Hosted Cluster

- How to deploy a HostedCluster in AWS: https://hypershift-docs.netlify.app/getting-started/#create-a-hosted-cluster
- How to deploy a HostedCluster in Azure: https://hypershift-docs.netlify.app/how-to/azure/create-azure-cluster-with-options
- How to deploy a HostedCluster in Kubevirt: https://hypershift-docs.netlify.app/how-to/kubevirt/create-kubevirt-cluster/#create-a-hostedcluster
- How to deploy a HostedCluster in Agent: https://hypershift-docs.netlify.app/how-to/agent/create-agent-cluster/#create-a-hosted-cluster
- How to deploy a HostedCluster in Openstack: https://hypershift-docs.netlify.app/how-to/openstack/create-openstack-cluster/#create-a-hostedcluster

> **Note**
> Please make sure you know the development status of the provider you will use, because this is a fast changing software and we constantly keep changing the status of every provider with different and more features.