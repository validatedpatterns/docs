---
title: Management Cluster Sizing
weight: 10
aliases: /hypershift/management-cluster-sizing/
---

# Management Cluster Sizing

The Management Cluster is the key piece which will host the Control Planes of the Hosted Clusters so we need to do the sizing properly. For that matter we have a calculator, let's dive a bit in that.

## Calculator

This tool is called **hcp-sizer** and it will help you to do this sizing following 2 ways:

- Interactive: Once you execute the CLI in a shell environment, it will prompt some questions and with that it will show you how big the worker nodes should be in order to host a concrete number of Hosted Control Planes
- Discovery: This will require a running Management cluster, the CLI will connect to it and do some calculations and giving you the proper output

This is a demo of how the tool execution looks like in the Interactive mode:

[![alt text](https://img.youtube.com/vi/Da95m8sZgEo/0.jpg)](https://www.youtube.com/watch?v=Da95m8sZgEo)

## Server Categories & QPS Reference

| **Category**            | **Description**                                                                                                               |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Entry-Level Servers** | **CPU**: Typically 4 to 8 cores.<br/>**Memory**: Ranges from 8GB to 32GB of RAM.                                              |
| **Mid-Range Servers**   | **CPU**: Generally have between 12 to 24 cores.<br/>**Memory**: Equipped with 64GB to 256GB of RAM.                           |
| **High-End Servers**    | **CPU**: Could have 32 cores or more, potentially with multiple CPUs.<br/>**Memory**: From 256GB to several terabytes of RAM. |

| Category  | Description     |
|-----------|-----------------|
| Low       | 0-500 QPS       |
| Medium    | 500-1000 QPS    |
| High      | 1000-5000 QPS   |


# Management cluster deployment recomendations

- Don't use ODF based Storage class for the PVCs of the etcd deployments, make sure you use local storage for that, LVMS operator it's a good fit for that matter.
- If you use a BareMetal (Agent) provider, make sure InfraEnv resource is an separated namespace of the HostedControlPlane namespace.
