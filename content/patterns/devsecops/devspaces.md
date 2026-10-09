---
title: OpenShift DevSpaces
weight: 50
aliases: /devsecops/devspaces/
---

# DevSpaces

## Introduction

This pattern also includes [OpenShift DevSpaces](https://access.redhat.com/products/red-hat-openshift-dev-spaces) as a way to model the inner loop for developers.

In order to allow developers to push code changes back to the SCM, it's necessary to configure a secret.

You should put the secret in the `~/values-secret-multicluster-devsecops.yaml` file (or the file you are using for secrets). The secret you add should look like this:

```yaml
   - name: github-devspaces
     fields:
     - name: client-secret
       value: xxx
     - name: client-id
       value: yyy
```

The name of the secret and of the fields cannot be changed. The values must be generated following the approach described [here](https://www.eclipse.org/che/docs/stable/administration-guide/configuring-oauth-2-for-github/#setting-up-the-github-oauth-app). Just obtain the secret values. Do not manually create the secret in the cluster and described in the following section of the docs.

At the moment only github is tested.