# Validated Pattern: Medical Diagnosis
---
layout: post <br>
date: 2021-12-31 <br>
title: Medical Diagnosis <br>
published: true <br> 
tags:
- medical-diagnosis
- xray
- validated-pattern
---
Our team recently completed the development of a validated pattern that showcases the capabilities we have at our fingertips when we combine OpenShift and other cutting edge Red Hat technologies to deliver a solution. 

We've taken an application defined imperatively in an Ansible playbook and converted it into GitOps style declarative kubernetes resources. Using the validated pattern framework we are able to deploy, manage and integrate with multiple cutting edge Red Hat technologies, and provide a capability that the initial deployment strategy didn't have available to it: a lifecycle. Everything you need to take this pattern for a spin is in [git](https://github.com/hybrid-cloud-patterns/medical-diagnosis).

#### Pattern Workflow
The purpose of this pattern is to show how medical facilities can take full advantage of trained AI/ML models to identify anomalies in the body like pneumonia. From the medical personnel persona it works by medical personnel submitting an X-ray image into the application to start the workflow. The image-generator application puts the image into a S3 compliant bucket via ODF (object storage) for storage. The X-ray is available to the Grafana dashboard via the image-server application. At the same time, kafka will initiate a knative serverless function that triggers the image for processing. Once processed a container image is created within the internal openshift registry and a notification is sent back to the medical staff with the results. 

![](https://hybrid-cloud-patterns.io/images/medical-edge/physical-dataflow.png?raw=True)

For a recorded demo deploying the pattern and seeing the dashboards available to the user, check out our [docs page](https://hybrid-cloud-patterns.io/medical-diagnosis/)!

#### Pattern Deployment
---
Before getting started, you need to install the following packages and collections.
**PREREQUISITES** <br>

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

#### Conclusion
---
Speed, accuracy, efficiency all come to mind when considering what this pattern provides. Patients get the treatment they need, when they need it because we're able to use technology to quickly and accurately diagnosis anomalies detected in X-rays. The validated patterns framework enables administrators to quickly meet their user demands by providing solutions that only require them to bring their own data to complete the last 20-25% of the architecture.