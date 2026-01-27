---
 date: 2024-07-12
 title: In-cluster Git Server
 summary: Validated Patterns now supports running an in-cluster git server
 author: Michele Baldessari
 blog_tags:
 - patterns
 - git
 keywords:
 - gitea
 - in-cluster git
 - git server
 - validated patterns
 - gitops
 - kubernetes
 - openshift
---

# In-cluster Git Server

## Overview

Starting with the patterns operator version 0.0.52 there is an initial (experimental)
support for having an in-cluster git server. Once enabled, a very simple gitea server 
is installed and configured inside the cluster. The patterns will use the internal
gitea server to pull code from. By default the Gitea server repository will sync from
the upstream git repo every eight hours.

## Why

One of the main reasons to have an in-cluster git server is to make it simpler
to get started with patterns. It avoids the need to have a fork of the original
pattern's git repo and the changes can be done directly in the in-cluster git 
repository.

## How to get started

There are fundamentally two ways to set up the in-cluster gitea server. 

1. Via the user interface in the console by enabling the `In Cluster Git Server` switch
   inside the `Git Config` section:
   ![gitea-operator-ux](/images/operator-gitea-config.png)
   And setting the `Origin Repo` to the upstream git repository that needs to be
   imported in gitea.
2. By creating a Pattern CR and setting the `spec.gitSpec.originRepo` field to the upstream
   git repository. In this case the `spec.gitSpec.targetRepo` field, which is used by the pattern 
   to deploy the actual code, will be automatically overwritten pointing to the internal in-cluster
   git route. For example:
   ```yaml
   apiVersion: gitops.hybrid-cloud-patterns.io/v1alpha1
   kind: Pattern
   metadata:
     name: test-pattern
     namespace: openshift-operators
   spec:
     clusterGroupName: hub
     gitSpec:
       originRepo: https://github.com/validatedpatterns/multicloud-gitops
       targetRevision: main
   ```
   In the example above, since `originRepo` is not empty it will be used as the upstream git repository
   to clone from and that repository will be imported into gitea and `targetRepo` will be automatically
   constructed to point to the internal gitea.

## Configuration

Once the in-cluster gitea is enabled, its configuration will be done via a normal argo application
that can be seen in the cluster-wide argo:
![gitea-argo-application](/images/gitea-argocd-application.png)

The gitea interface can be accessed via the `gitea-route` inside the `vp-gitea` namespace or by clicking
the console link on the nine box:
![gitea-console-link](/images/gitea-console-link.png)

To access the gitea admin interface a secret called `gitea-admin-secret`
containing username and password are created inside the `vp-gitea` namespace.

## Repositories

Once logged in with the `gitea_admin` user whose password is contained in the `gitea-admin-secret`
you will see the repository that has been configured inside gitea:
![gitea-repository-list](/images/gitea-repository-list.png)

Clicking on the repository will show the actual code and the usual git related information (branch, tags, etc):
![gitea-repository-show](/images/gitea-repository-show.png)

## Gitea usage

To clone the gitea repository you can simply clone the repository via https:
```sh 
git -c http.sslVerify=false clone https://gitea-route-vp-gitea.apps.mcg-hub.aws.validatedpatterns.io/gitea_admin/multicloud-gitops.git
```
In order to avoid the `sslVerify=false` setting you need to download your clusters CA and import it into the git config.

You can create a token in gitea under `Settings` -> `Applications` -> `Manage
Access Tokens` that repository `Read and Write` permissions. With this token
you can clone it once with authentication and then push changes to the gitea
repository:
```sh
git -c http.sslVerify=false clone https://gitea_admin:<token>@gitea-route-vp-gitea.apps.mcg-hub.aws.validatedpatterns.io/gitea_admin/multicloud-gitops.git
git -c http.sslVerify=false push origin mytestbranch
```

Note: The conversion from gitea mirror to regular repository is needed unless the upstream [issue](https://github.com/go-gitea/gitea/issues/7609) gets implemented.
