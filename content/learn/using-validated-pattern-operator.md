---
menu:
  learn:
    parent: Infrastructure
title: Using the Validated Pattern operator
weight: 33
aliases: /infrastructure/using-validated-pattern-operator/
---

# Using the Validated Pattern Operator

## Background

The Validated Pattern Operator was developed in order to take advantage of the automation provided with the validated pattern framework. It allows users to deploy validated patterns using the Red Hat OpenShift console. The idea is to point it at a validated pattern repo and let the operator do the work of deploying OpenShift Gitops and then all the parts and applications required for the pattern.

## Installing the operator

In the OpenShift console select Operators on the menu on the left of the console. Then select OperatorHub.

In the `Filter by keyword` box type the word `validated`. The validated patterns operator will appear. Select it. At this time it is a community operator and is not *officially* supported. A Community Operator information pop-up appears. Click `Continue`.

[![VP Operator](/images/operator/select-vp-operator.png)](/images/operator/select-vp-operator.png))

On the following pop-up page select `Install`.

[![Install Operator](/images/operator/install-operator.png)](/images/operator/install-operator.png))

On the Install Operator page leave the defaults and select install.

[![Install Operator form](/images/operator/install-operator-form.png)](/images/operator/install-operator-form.png))

[![Installing Operator](/images/operator/installing-operator.png)](/images/operator/installing-operator.png))

## Create a pattern instance

When the operator has completed installation click on `View Operator`.

[![Operator Installed](/images/operator/operator-installed.png)](/images/operator/operator-installed.png))

Select the `Create instance` and start filling out the Create a Pattern form.

[![Operator YAML](/images/operator/create-a-pattern-0.3.png)](/images/operator/create-a-pattern-0.3.png))

* Choose a name for the pattern deployment. This name will be used in the projects created.
* Apply any arbitrary labels to this deployment
* Choose a cluster group name. This is important because it identifies the type of cluster that this pattern will be deployed on. For example if this is `Industrial Edge` then it should be `datacenter`. If it's `multicloud-gitops` then it should be `hub`. Please check with the validated pattern to figure out which cluster group is right for this pattern.
* Select the `Git Spec` drop down on the form and change the `Target Repo` URL to your forked repository URL. E.g. From `https://github.com/hybrid-cloud-patterns/pattern-name` to `https://github.com/my-git-user/pattern-name`
* You may need to change the `Target Revision` sometimes it's marked `stable` or has a specific a version number e.g. `v2.1`, it may simply be `main`, or it might be a new branch you've created, `my-branch`.
* Make sure to make any necessary changes to your `values-*.yaml` files locally and push them to your forked repo. on the correct branch/target chosen above. For a quick start you shouldn't need to make changes.

Review the rest of the form fields and check if they require changes. For first time pattern deployments you probably don't need any further changes. Select `Create` and the bottom of the form. The OpenShift GitOps operator should show up in `Installed Operators` momentarily.

From there OpenShift GitOps will install the rest of the assets and artifacts for this pattern. Make sure to change your project to `All Projects` so you will see the other operators installing. E.g. Advanced Cluster Management (ACM).

Please follow any other post-install instructions for the pattern on that pattern's `Getting started` page.

## Using the in-cluster Gitea server

The operator supports the ability to host a forked version of the pattern inside the cluster. This means you don't need to fork the pattern repository before deploying it in your cluster to be able to tweak while you work on it. This can be useful if you don't want to host the forked repository outside the cluster, or for a quick demo.

[![Enabling in-cluster fork](/images/operator/enable-in-cluster-fork.png)](/images/operator/enable-in-cluster-fork.png))

To enable the in cluster fork, extend the `gitSpec` section in the pattern and tick the `useInClusterFork` checkbox. During the reconciliation loop, the operator will deploy a Gitea server, if none exists already, and fork the repository defined in the `target Repo` and `target Revision` onto the Gitea instance. Then it will use the newly forked repository as the source URL in the argoCD application. The URL of the newly created repository will be captured in the `Pattern` Status section, under the `inClusterRepo` field.

The Gitea server uses a persistent volume to store the git information to ensure that the data remains even if the Gitea server is not available.

```yaml
status:
  ...
  inClusterRepo: https://gitea-gitea.apps.jgil-gitops.gifm.p1.openshiftapps.com/hybrid-cloud-patterns/multicloud-gitops.git
  ...
```

At this point we're ready to clone the repository locally:

```bash
$> git clone https://gitea-gitea.apps.jgil-gitops.gifm.p1.openshiftapps.com/hybrid-cloud-patterns/multicloud-gitops.git
Cloning into 'multicloud-gitops'...
remote: Enumerating objects: 7367, done.
remote: Counting objects: 100% (7367/7367), done.
remote: Compressing objects: 100% (3291/3291), done.
remote: Total 7367 (delta 3658), reused 7367 (delta 3658), pack-reused 0
Receiving objects: 100% (7367/7367), 2.58 MiB | 9.24 MiB/s, done.
Resolving deltas: 100% (3658/3658), done.
```

Before pushing changes to the repository, we'll need to extract the user credentials that are found in the `gitea` namespace, under the `gitea-user-credentials` secret:

```bash
$> oc get secret gitea-user-credentials -n gitea -ojsonpath='{.data.username}'|base64 -d
hybrid-cloud-patterns
$> oc get secret gitea-user-credentials -n gitea -ojsonpath='{.data.password}'|base64 -d
HZL#4AMh*$5w*16p
```

With these values at hand, we push the changes:

```bash
$> git push
Username for 'https://gitea-gitea.apps.jgil-gitops.gifm.p1.openshiftapps.com': hybrid-cloud-patterns
Password for 'https://hybrid-cloud-patterns@gitea-gitea.apps.jgil-gitops.gifm.p1.openshiftapps.com': ***************
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 297 bytes | 297.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0), pack-reused 0
remote: . Processing 1 references
remote: Processed 1 references in total
To https://gitea-gitea.apps.jgil-gitops.gifm.p1.openshiftapps.com/hybrid-cloud-patterns/multicloud-gitops.git
   0a4e3bf..ff79b6b  main -> main
```

The gitops server will detect the newly applied changes and reconcile the pattern accordingly.