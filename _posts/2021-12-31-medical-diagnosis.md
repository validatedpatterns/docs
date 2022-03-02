# Validated Pattern: Medical Diagnosis
---
layout: post
date: 2021-12-31
title: Medical Diagnosis
published: true
tags:
- medical-diagnosis
- xray
- validated-pattern
---
Our team recently completed the development of a validated pattern that showcases the capabilities we have at our fingertips when we combine OpenShift and other cutting edge Red Hat technologies to deliver a solution. We've taken an application written completely in Ansible and converted the kubernetes resources into manifests to be deployed, managed and monitored through ArgoCD. Using the validated pattern framework we are able to deploy, manage and integrate with multiple cutting edge Red Hat technologies, and provide a capability that the initial deployment strategy didn't have available to it: a lifecycle. Everything you need to take this pattern for a spin is in [git](https://github.com/hybrid-cloud-patterns/medical-diagnosis).

For a recorded demo deploying the pattern and seeing the dashboards available to the user, check out our [docs page](https://hybrid-cloud-patterns.io/medical-diagnosis/)!

#### Pattern Deployment
---
**PREREQUISITES**
Before getting started, you need to install the following packages and collections.

| Packages |
|:--------:|
| git |
| make |
| ansible |

example: `sudo dnf install <package> -y`

| pip Packages |
|:-----------:|
| openshift |
| kubernetes |

example: `pip3 install <package> --user`

| Ansible Collections |
|:-------------------:|
| kubernetes.core |

example: `ansible-galaxy collection install <collection_name>`

1. clone the repository
The deployment is split into two phases: `bootstrap` and `deployment`:

2. make install

3. profit

##### What's happening?
---
During the bootstrapping of the pattern, the initial `openshift-gitops` operator is deployed with the necessary custom resource definitions, and custom resources to deploy the 
`datacenter-<validated-pattern>` with references to the appropriate git repository and branch. Once the argoCD application deploys it will create all of the `common` resources 
which include `advanced cluster manager`, `vault`, and `openshift-gitops`. The pattern deployment begins with argo applying the helm templates to the cluster, ultimately resulting in all resources
deploying and the `xraylab` dashboard being available via its route.

The charts for the pattern deployment are located: `$GIT_REPO_DIR/charts/datacenter/`

#### Pattern Deployed Technology
---
| Operator | Upstream Project | 
|:--------:| ---------------- |
| openshift data foundation (odf)| ceph, rook, noobaa |
| openshift-gitops | argoCD |
| openshift serverless | knative |
| amq streams | kafka |
| opendatahub | opendatahub |
| grafana | grafana | 

#### Challenges
---
With the imperative dependence on the originating content, there were some resources that didn't align 1:1 and needed to be overcome. 
For example, there are a number of tasks that are interrogating the cluster for information to transform into a variable and finally
apply that variable to some resource. As you can imagine, this can be very challenging when you're declaring the state of your cluster. In order to 
maneuver around these imperative actions we took what we could and created openshift jobs to execute the task. 
