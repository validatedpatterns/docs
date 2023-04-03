---
title: Ideas for Customization
weight: 60
aliases: /devsecops/ideas-for-customization/
---

# Ideas for Customization

## More desirable tools in the development pipeline

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. Maybe there is a tool in the CI/CD pipeline that you'd like to substitute for a preferred tool. E.g. using Clair in Quay to do image scanning instead of RH ACS. Or Quay Enterprise may be removed for another image repository. 

### How to add a new tool to the pipeline

1. In the `region` directory make a new directory that will house the Helm chart for your tool.

1. Follow the guide on [how to extend a pattern](/contribute/extending-a-pattern/)

## Deploying development and hub components to one cluster

In some environments the organization may require a single cluster with different namespaces for development environments and hub environments. To achieve this you could combine the components in the development cluster group `values-development.yaml` file into the `values-hub.yaml` file. 

Things to consider. While OpenShift Pipelines needs to move to the `values-hub.yaml` file, the Quay bridge and ACS integration for pipeline scanning is not required. I.e. some of the plumbing needed to connect pipelines to various artifacts can be removed. Policies that are used by ACM move secrets to the development cluster would not be needed.

## Different production environments

While this can be done with any of the patterns the Multicluster DevSecOps pattern is about building and deploying developed code. There maybe a variety of places where a deployment could land in production. Consider a smart city application. Various types of cluster groups could be used in production - a cluster group for traffic light applications, a cluster group for electric tram cars, a cluster group for smart road signs. 

1. `values-traffic-lights.yaml`

1. `values-tram-cars.yaml`

1. `values-smart-signs.yaml`

GitOps and DevSecOps would be used to make sure that applications would be deployed on the correct clusters. Some of the "clusters" might be light single-node clusters.  Some applications be be deployed to several cluster groups. E.g. the application to place information on a smart sign might also be deployed to the tram cars that also have smart signs in passenger compartments or the engineers compartment.
