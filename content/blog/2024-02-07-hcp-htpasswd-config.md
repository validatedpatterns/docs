---
date: 2024-02-07
title: Adding htpasswd oAuth provider to HCP clusters
summary: How-to - Add htpasswd authentication to hosted controlplane clusters
author: Jonny Rickard
blog_tags:
- patterns
- how-to
---

# Configure HTPasswd OAuth provider for hosted clusters

## Overview 

In this blog, we're going to configure our hosted cluster to use `htpasswd` as its authentication provider.

There are several reasons that we would want to do this, but usually it comes down to understanding that the kubeadmin/root users aren't the right way to do things. HTPasswd is a simple but effective way to centrally manage users and provide access to cluster resources when bound to the proper RBAC. In a traditional OpenShift deployment the configuration of the htpasswd oauth is well documented, but with hosted control planes we have to dig a little bit for the answer. This blog walks through the configuration of the oauth provider, and also provids ways that you can verify the configuration works as intended. 

### Assumptions
> The procedures in this blog have been tested against OpenShift `4.13` and `4.14` hostedclusters.

This blog assumes that you have the following binaries installed on your machine:

- **hcp** <tab> | Creating and managing hosted clusters
- **htpasswd** <tab> | Creating and managing htpasswd configurations
- **oc** <tab> | Interacting with your OpenShift cluster

> **Warning:** When you add an idp configuration the kubeadmin password is no longer available. So if you forget the password that you created or you want that level of permissions you will need to generate and use the kubeconfig:

## Getting Started

> **NOTE:** The following steps should be performed on the HyperShift management cluster

### Create the kubeconfig for the hosted cluster

```shell
hcp create kubeconfig –name <clusterName> > /tmp/<clusterName>.kube

export KUBECONFIG=/tmp/<cluserName>.kube
```

First, using the `htpasswd` cli we need to create an htpasswd configuration with our users and their passwords.

`htpasswd -Bbc htpasswd.users admin password`

We're creating a file called htpasswd.users and adding a user called `admin` with the password of `password`.

Next, we need to create a secret in the same namespace as the hostedcluster resource.

> The default namespace is `clusters`

There is no required naming convention. However, for the sake of future you and others on your team that may be configuring their clusters with htpasswd appending the cluster name to the end of the secret is a simple and effective way to associate the secret to the hostedcluster.

### Create the secret for your hostedcluster

`oc create secret generic htpasswd-<clusterName> –from-file=htpasswd=./htpaaswd.users -n clusters`

Now we need to update the hostedcluster resource with the htpasswd OAuth provider:

### Apply OAuth configuration to hostedcluster resource

`oc edit hostedcluster <clustername> -n clusters`

Add the following to the hostedcluster resource:

```yaml
spec:
  configuration:
    oauth:
      identityProviders:
      - htpasswd:
          fileData:
            name: htpasswd-<clusterName> #secret name
        mappingMethod: claim
        name: htpasswd   #name of the oAuth entry
        type: HTPasswd
```

You can verify that the configuration is picking up the change correctly by looking at the pod status in clusters-<clustername>

Notice the time that the pods have been running, if you see that they have recently been restarted and are without error then this is a good indication that the configuration has been applied correctly.

```shell
oc get pods -n clusters-demo

oauth-openshift-54bc55789b-5j854                      2/2     Running   0          58s
oauth-openshift-54bc55789b-g6bls                      1/2     Running   0          26s
oauth-openshift-54bc55789b-jtf5m                      2/2     Running   0          91s
```

## Verification

> **WARNING:** The following steps are to be performed on the hostedcluster

Login using the credentials we created earlier. You can either login to the hosted cluster openshift console or to the api server. 

> Something to be aware of: When using the openshfit console the `htpasswd` provider will not be presented as a choice for logging in. This is because the `kubeadmin` user/password  is removed when the IDP is updated.

### api server login example:

```shell
hcp create kubeconfig –name <clusterName> > /tmp/<clusterName>.kube

export KUBECONFIG=/tmp/<clusterName>.kube

oc login $(oc whoami –show-server) -u admin -p password
```

### Apply RBAC to configured user(s)

You may notice that your user doesn't really have any permissions to the cluster. You will need to grant permissions to the user by applying a Role or ClusterRole. In this example, we are giving our adming user the `cluster-admin` clusterRole. 

> **NOTE:** You will likely not have admin access to your cluster so you will need to create and export the `kubeconfig` for your hosted cluster to apply the RBAC to your user

`oc adm policy add-cluster-role-to-user cluster-admin admin`

Once you have logged in using the htpasswd idp you can view the users and identities that OpenShift is aware of:

```shell
 oc get identity,users
NAME                                        IDP NAME   IDP USER NAME   USER NAME   USER UID
identity.user.openshift.io/htpasswd:admin   htpasswd   admin           admin       25dfddc5-66b4-47c2-8ba2-7b54b72eda04

NAME                           UID                                    FULL NAME   IDENTITIES
user.user.openshift.io/admin   25dfddc5-66b4-47c2-8ba2-7b54b72eda04               htpasswd:admin
```

## Summary

That's it! We took our out of the box hostedcluster and applied an HTPasswd OAuth provider and then applied a clusterRole to it. This is a simple approach for you and your team to share a cluster without having to share the kubeadmin username. Alternatively, if you wanted to use other OIDC authenticators like GitHub, Google ..etc you could follow along with the flow from this blog to accomplish. 
