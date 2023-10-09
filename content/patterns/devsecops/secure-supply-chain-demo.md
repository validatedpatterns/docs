---
title: Multicluster DevSecOps Demo
weight: 40
aliases: /devsecops/secure-supply-chain-demo/
---

# Demonstrating Multicluster DevSecOps

## Background

Up until now the Multicluster DevSecOps validated pattern has focused primarily on successfully deploying the architectural pattern components on the three different clusters. Now it is time to see DevSecOps in action as we step through a number of pipeline demonstrations to see the secure supply chain in action.

## Prerequisite preparation

Make sure to have hub, development and production environments setup. It is possible to set up a production environment on your hub cluster if you wish to use only two clusters.

### Local laptop/workstation

Make sure you have `git` and OpenShift's `oc` command-line clients.

### OpenShift Cluster

Make sure you have the `kubeadmin` administrator login for the data center cluster. Use this or the `kubeconfig` (export the path) to provide administrator access to your data center cluster. It is not required that you have access to the edge (factory) clusters. GitOps and DevOps will take care of the edge clusters.

### GitHub account

You will need to login into GitHub and be able to fork two repositories.

* validatedpatterns/multicluster-devsecops

<!--There is no such repo as chat-client in either orgs -->
* hybrid-cloud-patterns/chat-client

## Pipeline Demos

### Pipeline 1: Build & Deploy

Running this pipeline shows how a build and deploy can run easily and push an image to production and everything looks fine. There are many development environments that run in this "trusted" mode today.

However the built image is never scanned. And in the next pipeline we see that the same image that was deployed in Pipeline 1 is actually not secure and should never have been deployed.

*TBD - screen shots*

### Pipeline 2: Build & Scan with Failure

Pipeline 2 is the same as Pipeline 1 except that the image is scanned and found to fail the scan. The image is NOT pushed to a registry and therefore not deployed to production.

*TBD - screen shots*

### Pipeline 3: Build & Scan with Success

Pipeline 3 builds an image that successfully scans without issue. This shows the steps to add a scan task to the pipeline.

*TBD - screen shots*

### Pipeline 4: Build, Scan, Sign and Push to Prod

Pipeline 4 demonstrates a more complete pipeline that builds, scans and also signs the image before pushing.

Pipeline 4 is the preferred DevSecOps approach and can be modified to include more security based tasks. E.g. when using a base image for a build, the signature of that image can be checked before the build step even starts.

*TBD - screen shots*
