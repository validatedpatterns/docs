---
date: 2024-02-02
title: Announcing Intel Accelerated Validated Patterns
summary: Intel extended Validated Patterns to use hardware accelerators for AI workloads
author: Jonny Rickard
blog_tags:
- patterns
- announce
aliases: /2024/02/02/intel-patterns/
---

We are very excited to share that Red Hat has partnered with Intel to deliver not one, but two Red Hat Validated Patterns using ([Intel® Advanced Matrix Extensions](https://www.intel.com/content/www/us/en/products/docs/accelerator-engines/advanced-matrix-extensions/overview.html)) (Intel® AMX) an integrated accelerator on 4<sup>th</sup> and 5<sup>th</sup> Generation Intel® Xeon® Scalable processors that increases performance for deep-learning inference and training.

The goal of Red Hat Validated Patterns is not only to facilitate testing and deployment of complex patterns, but to demonstrate business value by incorporating real-world workloads and use cases. Our extensive partner ecosystem allows us to provide our consumers with a catalog of real deployment architectures that help to accelerate a proof of concept to production, affording decision makers with an informed strategic blueprint that helps to overcome technological challenges.

Artificial Intelligence (AI) is a common component in several Validated Patterns. The ability to accelerate image recognition, anomaly detection, and AI inference pipelines drives faster innovation in this revolutionary technology shift. With a focus on enhancing AI workloads, Intel integrated their AMX technology with two Validated Patterns—Medical Diagnosis and MultiCloud GitOps. By using the Red Hat Node Feature Discovery (NFD) operator,the engineers targeted and properly scheduled the pattern deployment onto the Intel cluster nodes. With the Medical Diagnosis pattern, Intel was able to demonstrate significantly faster inference of x-ray images at the edge. For the MultiCloud GitOps pattern, the use of Intel® AMX accelerators can provide up to 10x acceleration for inference speeds over previous generation Intel Xeon Scalable Processors.

Together with other Intel technologies, such as ([Intel® AI Tools](https://www.intel.com/content/www/us/en/developer/tools/oneapi/ai-analytics-toolkit.html#gs.5y4ujw)) and the ([OpenVINO™ Toolkit Operator](https://catalog.redhat.com/software/container-stacks/detail/60649a56209af65d24b7ca9e)), organizations are poised to advance the benefits of their investment in AI and machine learning (ML). A cornerstone partner for ([Red Hat OpenShift AI](https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai)), Intel proves to be an invaluable contributor in this space in addition to other critical business initiatives. 

([Built-in accelerators](https://www.intel.com/content/www/us/en/now/xeon-accelerated/accelerators.html)) are a revolutionary chip technology feature in Intel 4<sup>th</sup> and 5<sup>th</sup> Generation Xeon Scalable Processors with significant promise in addressing real-world workloads, such as network and storage encryption and compression, trusted domains and application security extensions, enhanced processing capacity for data-intensive workloads, and more. Read more about about the Intel AMX integration with Validated Patterns in Intel’s recently released ([reference architecture](https://www.intel.com/content/www/us/en/content-details/812552/accelerate-ai-applications-and-workflows-with-red-hat-openshift-4-14-on-4th-gen-intel-xeon-scalable-processors-solutions-reference-architecture.html)), and get the documentation for ([Intel AMX Accelerated MultiCloud GitOps](https://validatedpatterns.io/patterns/multicloud-gitops-amx/)), and ([Intel AMX Accelerated Medical Diagnosis](https://validatedpatterns.io/patterns/medical-diagnosis-amx/)). This is just the beginning. Intel is currently integrating additional built-in accelerators for Intel® Xeon® processors with Red Hat Validated Patterns. Keep an eye out for new reference architectures featuring other business critical workloads and find additional information and review our catalog of Red Hat Validated Patterns at https://validatedpatterns.io 



