---
date: 2021-12-31
title: Medical Diagnosis
summary: A validated pattern for the medical field
author: Jonny Rickard
blog_tags:
- medical-diagnosis
- xray
- validated-pattern
aliases: /2021/12/31/medical-diagnosis/
---

# Validated Pattern: Medical Diagnosis

Our team recently completed the development of a validated pattern that showcases the capabilities we have at our fingertips when we combine OpenShift and other cutting edge Red Hat technologies to deliver a solution.

We've taken an application defined imperatively in an Ansible playbook and converted it into GitOps style declarative kubernetes resources. Using the validated pattern framework we are able to deploy, manage and integrate with multiple cutting edge Red Hat technologies, and provide a capability that the initial deployment strategy didn't have available to it: a lifecycle. Everything you need to take this pattern for a spin is in [git](https://github.com/validatedpatterns/medical-diagnosis).

## Pattern Workflow

The purpose of this pattern is to show how medical facilities can take full advantage of trained AI/ML models to identify anomalies in the body like pneumonia. From the medical personnel point of view it works with medical imagery equipment submitting an X-ray image into the application to start the workflow.

The image is uploaded to an S3-compatible object storage. This upload triggers an event from the storage, “a new image has been uploaded”,  that is sent into a Kafka topic. This topic is consumed by a KNative Eventing listener that triggers the launch of a KNative Serving instance. This instance is a containerimage  with the AI/ML model and the needed processing functions. Based on the information from the event it received, the container retrieves the image from the object store, pre-processes it, makes a prediction on the risk of pneumonia using the AI/ML model, and saves the result. A notification of those results is sent to the medical staff as well.

[![physical-dataflow](https://validatedpatterns.io/images/medical-edge/physical-dataflow.png)](https://validatedpatterns.io/images/medical-edge/physical-dataflow.png)

For a recorded demo deploying the pattern and seeing the dashboards available to the user, check out our [docs page](https://validatedpatterns.io/medical-diagnosis/)!

## Pattern Deployment

---

To deploy this pattern, follow the instructions outlined on the [getting-started](https://validatedpatterns.io/medical-diagnosis/getting-started/) page.

### What's happening?

---
During the bootstrapping of the pattern, the initial `openshift-gitops` operator is deployed with the necessary custom resource definitions, and custom resources to deploy the
`datacenter-<validated-pattern>` with references to the appropriate git repository and branch. Once the argoCD application deploys it will create all of the `common` resources
which include `advanced cluster manager`, `vault`, and `openshift-gitops`. The pattern deployment begins with argo applying the helm templates to the cluster, ultimately resulting in all resources
deploying and the `xraylab` dashboard being available via its route.

The charts for the pattern deployment are located: `$GIT_REPO_DIR/charts/datacenter/`

### Pattern Deployed Technology

---

| Operator | Upstream Project |
|:--------:| ---------------- |
| openshift data foundation (odf)| ceph, rook, noobaa |
| openshift-gitops | argoCD |
| openshift serverless | knative |
| amq streams | kafka |
| opendatahub | opendatahub |
| grafana | grafana |

## Challenges

---
With the imperative dependence on the originating content, there were some resources that didn't align 1:1 and needed to be overcome.
For example, there are a number of tasks that are interrogating the cluster for information to transform into a variable and finally
apply that variable to some resource. As you can imagine, this can be very challenging when you're declaring the state of your cluster. In order to
maneuver around these imperative actions we took what we could and created openshift jobs to execute the task.

## Conclusion

---
Speed, accuracy, efficiency all come to mind when considering what this pattern provides. Patients get the treatment they need, when they need it because we're able to use technology to quickly and accurately diagnosis anomalies detected in X-rays. The validated patterns framework enables administrators to quickly meet their user demands by providing solutions that only require them to bring their own data to complete the last 20-25% of the architecture.
