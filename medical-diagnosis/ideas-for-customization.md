---
layout: default
title: Ideas for Customization
grand_parent: Patterns
parent: Medical Diagnosis
nav_order: 5
---

# Ideas for Customization

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Why change it?

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. The medical diagnosis pattern is just an example of how AI/ML workloads built for object detection and classification can be run on top of OpenShift clusters. Consider your workloads for a moment - how would your workload best consume the pattern framework? Do your consumers require on-demand or near real time responses when using your application? Is your application processing images or data that is protected by either Government Privacy Laws or HIPAA? The medical diagnosis pattern has the ability to answer the call to either of these requirements via OpenShift Serverless and OpenShift Data Foundations.

# What are some different ways that I could use this pattern?

1. The medical-diagnosis pattern is scanning X-Ray images to determine the probability that a patient may or may not have Pneumonia. Continuing with the medical path, the pattern could be used for other early detection scenarios that utilize object detection and classification. For example, the pattern could be used to scan C/T images for anamolies in the body such Sepsis, Cancer or even bengin tumors. Additionally, the pattern could be used for detecting blod clots, some heart disease as well as bowel disorders like Crohn's disease.

1. The Transportation Security Agency (TSA) could use the medical-diagnosis pattern in a way that enhances their existing scanning capabilities to detect with a higher probability restricted items carried on a person or hidden away in a piece of luggage. With MLOps the model is constantly training and learning to better detect those items that are dangerous but aren't necessarily metallic such as a fiream or knife. The model is also training to dismiss those items that are authorized ultimately saving us from being stopped and searched at security checkpoints!

1. Militaries could use images collected from drones, satellites or other platforms to identify objects and determine with probability what that object is. For example, the model could be trained to determine a type of ship, potentially its country of origin and other identifying characteristics.

# Summary

These are just a few ideas to help get the creative juices flowing for how you could use the medical-diagnosis pattern as a framework for your application. 

[Help & Feedback](https://groups.google.com/g/hybrid-cloud-patterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/hybrid-cloud-patterns/ansible-edge-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
