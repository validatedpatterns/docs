---
layout: default
title: Patterns
nav_order: 2
has_children: true
---

# Pattern List

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## Patterns quick-start

Each pattern can be deployed using the command-line. Check the `values-` for changes that are needed before deployment. After changing the `values-` files where needed, you can run `make install` from your local repository directory and that will deploy the datacenter/hub cluster for a pattern. Edge clusters are deployed by joining/importing them into ACM on the hub.

Alternatively to the `make install` you can use the [validated pattern operator](https://operatorhub.io/operator/patterns-operator) available in the OpenShift console.

Navigate to Operators/OperatorHub on the left. In the `Filter by keyword` box type the word `validated`. The validated patterns operator will appear. Select it. At this time it is a community operator and is not officially supported. A Community Operator information pop-up appears. Click `Continue`.

[![VP Operator](/images/operator/select-vp-operator.png)](/images/operator/select-vp-operator.png))

On the following pop-up page select `Install`.

[![Install Operator](/images/operator/install-operator.png)](/images/operator/install-operator.png))

On the Install Operator page leave the defaults and select install.

[![Install Operator form](/images/operator/install-operator-form.png)](/images/operator/install-operator-form.png))

[![Installing Operator](/images/operator/installing-operator.png)](/images/operator/installing-operator.png))

When the operator has completed installation click on `View Operator`.

[![Operator Installed](/images/operator/operator-installed.png)](/images/operator/operator-installed.png))

Select the `Create instance` and start filling out the Create a Pattern form.

[![Operator YAML](/images/operator/create-a-pattern.png)](/images/operator/create-a-pattern.png))

* You can change the name and apply labels and a cluster group name.
* Select the `Git Spec` drop down on the form and change the `Target Repo` URL to your forked repository URL. E.g. From `https://github.com/hybrid-cloud-patterns/pattern-name` to `https://github.com/my-git-user/pattern-name`
* You may need to change the `Target Revision` sometimes it's marked `stable` with a version number, or it may simply be `main`.
* Make sure to make any necessary changes to your `values-` files locally and push them to your forked repository. For a quick start you shouldn't need to make changes.

Review the rest of the form fields and check if they require changes. For first time pattern deployments you probably don't need any further changes. Select `Create` and the bottom of the form. The OpenShift GitOps operator should show up in `Installed Operators` momentarily.

From there OpenShift GitOps will install the rest of the assets and artifacts for this pattern. Make sure to change your project to `All Projects` so you will see the other operators installing. E.g. Advanced Cluster Management (ACM).

Please follow any other post-install instructions for the pattern on that pattern's Getting started page.
