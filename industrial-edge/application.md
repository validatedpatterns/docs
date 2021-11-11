
---
layout: default
title: Application Demos
grand_parent: Patterns
parent: Industrial Edge
nav_order: 2
---

# Demonstrating Industrial Edge example applications  
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Background

Up until now the Industrial Edge 2.0 validated patterns has focused primarily on successfully deploying the architectural pattern. Now it is time to see GitOps and DevOps in action as we go through a number of demonstrations to change both configuration information and the applications that we are deploying.

If you have already deployed the data center and optionally a factory (edge) cluster, then you have already seen several applications deployed in the OpenShift GitOps console. If you haven't done this then we recommend you deploy the data center after you have setup the Quay repositories described below. 

## Prerequiste prepartaion

### Quay public registry setup 

In the [Quay.io](https://quay.io) registry please ensure you have the following repositories and that they are set for public access. Replace your-org with the name of your organization or Quay.io username. 

* _your-org_/iot-software-sensor
* _your-org_/iot-consumer
* _your-org_/iot-frontend
* _your-org_/iot-anomoloy-detection
* _your-org_/http-ionic

These repositories are needed in order to provide container images built at the data center to be consumed by the factories (edge).

### Local laptop/workstation

Make sure you have `git` and OpenShift's `oc` command line clients.

### OpenShift Cluster

Make sure you have the `kubeadmin` administrator login for the data center cluster. Use this or the `kubeconfig` (export the path) to provide administrator access to your data center cluster. It is not required that you have access to the edge (factory) clusters. GitOps and DevOps will take care of the edge clusters.

### GitHub account

You will need to login into GitHub and be able to fork two repositories.

* hybrid-cloud-patterns/industrial-edge
* hybrid-cloud-patterns/manuela-dev


## Configuration changes with GitOps

There will may be times where you need to change the configuration of some of the edge devices in one or more of your factories. In our example, we have various sensors at the factory. Modification can be made to these sensors using `ConfigMaps`. 

 ![](/images/highleveldemodiagram.png)

In this demonstration we will turn on a temperature sensor for sensor #2. We will first do this in the data center because this will demonstrate the power of GitOps without having to involve the edge/factory.  However if you do have an factory joined using Advanced Cluster Management, then the changes will make their way out to the factory. But it is not necessary for the demo as we have a complete test environment on the data center.

Make sure you are able to see the dashboard application in a tab on your browser. You can find the URL for the dashboard application by looking at the following in your OpenShift console. 

![](/images/network-routing-line-dashboard.png)

Select Networking->Routes on the lefthand side of the console. Using the Projects pull-down, select `manuela-tst-all`. Click on the URL under the Location column for the route Name `line-dashboard`. this will launch the line-dashboard monitoring application in a browser tab. The URL will look like:  

line-dashboard-manuela-tst-all.apps.*cluster-name*.*domain*

Using you favorite editor, edit the following file:

```
industrial-edge-charts/data/center/manuela-test/templates/machine-sensor/machine-sensor-2-configmap.yaml
```

Change `SENSOR_TEMPERATURE_ENABLED: "false"` to `SENSOR_TEMPERATURE_ENABLED: "true"`.

Then change and commit this to your git repository so that the change will be picked up by OpenShift GitOps (ArgoCD). 

```
git add industrial-edge-charts/data/center/manuela-test/templates/machine-sensor/machine-sensor-2-configmap.yaml
git commit -m "Turned on temprature sensor for machine sensor #2"
git push
```

You can track the progress of this commit/push in your OpenShift GitOps console in the `manuela-test-all` application. You will notice components regarding machine-sensor-2 getting sync-ed.

![](/images/argocd-line-dashboard.png)

There is only one more step to see the change. Unfortunately your browser knows little about GitOps and therefore the dashboard application may need to have it's page/tab refreshed. 

![](/images/app-line-dashboard.png)

## Application changes using DevOps




