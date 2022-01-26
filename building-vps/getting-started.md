---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Creating a new pattern
nav_order: 1
---

# Getting started creating a new pattern  
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to https://console.redhat.com/openshift/create )
1. (Optional) A second OpenShift cluster for mulitcloud/multi-cluster demonstration or testing
1. A github account (and a token for it with repos permissions, to read from and write to your forks)
1. The helm binary, see https://helm.sh/docs/intro/install/

The use of this blueprint depends on having at least one running Red Hat OpenShift cluster. The validated patterns framework for Cloud Native applications depends on using Red Hat OpenShift.

If you do not have a running Red Hat OpenShift cluster you can start one on a public or private cloud by using [Red Hat's cloud service](https://console.redhat.com/openshift/create).

The validated patterns framework uses GitOps and therefore a Git repository. While the framework defaults to GitHub it is not difficult to change to use other Git repositories. Changes can be made to the `values-secrets.yaml` file that is used for injecting Git repo. variables into the framework.

# Getting to know the framework

<TBD>


# Environment values and Helm



