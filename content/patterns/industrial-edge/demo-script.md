# Industrial Edge Deployment Script

## Objectives

There's no experience like hands-on experience and being able to see industrial
edge scenarios. This is a demo for the Industrial Edge Validated Pattern using
the latest product and technology improvements.

* Show Red Hat Operators being deployed
* Show available Red Hat Pipelines for the Industrial Edge pattern
* Show the seed pipeline running and explain what it is doing
* Demonstration of the Red Hat ArgoCD views
* Show the openshift-gitops-server view
* Show the datacenter-gitops-server view
* Show the factory-gitops-server view

#### For Information on the Red Hat Validated Patterns, visit our [website](https://validatedpatterns.io)

## See the pattern in action

Watch the following video for a demonstration of [OpenShift Pipelines in the Industrial Edge Pattern](https://www.youtube.com/watch?v=BMUiaCm6pZ8)

In this article, we give an overview of the demo and step by step instructions on how to get started.

## Getting Started

**_NOTE:_** This demo takes a "bring your own cluster" approach, which means this pattern/demo will not deploy any OpenShift clusters.

This demo script begins after the completion of you running `./pattern.sh make install` from our [Getting Started Guide](../getting-started)

### Demo: Quick Health Check
**_NOTE:_** This is a complex setup, and sometimes things can go wrong. Do a quick check of the essentials:

There is an initial `Seed Pipeline run` in namespace `manuela-ci` that builds all required container images into the local registry. Check that the run was successful like this:

![Pipeline Success](/images/industrial-edge/seed_pipeline.png)

If it did fail, try “Rerun” on the Pipeline run page:

![Re-run Pipeline](/images/industrial-edge/rerun_seed_pipeline.png)

Check that the “Line Dashboard” in the development namespace is showing Data. The Link is in the bottom of the email under “Deployed Applications”. The Application should open - click on the “Realtime Data” Navigation on the left and wait a bit. Data should be visualized as received. Note that there is only vibration data! We will soon change that and activate temperature data also.

If you wait a bit more (usually every 2-3 minutes), you will see an anomaly and alert (which is created by an ML Model)

![line dashboard](/images/industrial-edge/app-line-dashboard.png)

ArgoCD - all healthy and synced?
Login to the datacenter Argo. Link and password are in the email under ArgoCD Deployments. Make sure you get the right “datacenter one - there is another one for OpenShift gitops which could be confusing. It should look like this:

![Healthy Argo](/images/industrial-edge/ie_argoApps.png)

### Demo: Configuration Changes with GitOps

Follow the procedures [here](../application/#configuration-changes-with-gitops)

### Demo: Application Changes with DevOps

Follow the procedures [here](../application/#application-changes-using-devops)

### Demo: Application AI Model Changes with DevOps

Follow the procedures [here](../application/#application-ai-model-changes-with-devops)

## Troubleshooting

If you run into any problems, checkout the potential/Known issues list: http://validatedpatterns.io/industrial-edge/troubleshooting/

## Summary

In this demo we show you how to get started with the Industrial Edge Validated Pattern.
More specifically, we:

* Show you how to get started with the Industrial Edge Pattern
* Make configuration changes with GitOps
* Make application changes with DevOps
* Use DevOps to make changes to an Application AI model
* Stream events from the edge to the datacenter
