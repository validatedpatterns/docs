---
date: 2024-02-07
title: Adding htpasswd oAuth provider to HCP clusters
summary: How-to - Add htpasswd authentication to hosted controlplane clusters
author: Jonny Rickard
blog_tags:
- patterns
- how-to
---

# Add htpasswd oAuth provider to Hosted Control Plane hosted cluster

## Overview 

In this blog, we're going to configure our hosted cluster to use `htpasswd` as its authentication provider.

There are a number of reasons why we would want to do this, but it usually comes down to understanding that kubeadmin/root aren't really our usernames! HTPasswd is a simple but effective way to centrally manage users and provide access to cluster resources when bound to the proper RBAC. In a traditional OpenShift deployment the configuration of the htpasswd oauth is well documented, but with hosted control planes we have to dig a little bit for the answer. This blog walks through the configuration of the oauth provider, and also provids ways that you can verify the configuration works as intended. 

**Warning:** When you add an idp configuration the kubeadmin password is no longer available. So if you forget the password that you created or you want that level of permissions you will need to generate and use the kubeconfig:

```shell
hcp create kubeconfig –name <clusterName> > /tmp/<clusterName>.kube

export KUBECONFIG=/tmp/<cluserName>.kube
```

The first thing we need to do is create our users and add them to a file. This file will later be consumed as a secret.

`htpasswd -Bbc htpasswd.users admin password`

What we are doing here is creating a file called htpasswd.users and adding a user called admin with the password of password. 

Next, on the Hosting Cluster (Management) we need to create a secret in the clusters namespace. It isn’t required to append the cluster name to the secret, it just helps with identification if you have multiple users deploying multiple clusters:

`oc create secret generic htpasswd-<clusterName> –from-file=htpasswd=./htpaaswd.users -n clusters`

Next we need to update the hostedcluster resource and add the htpasswd identity provider.

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

```shell
oc get pods -n clusters-demo

oauth-openshift-54bc55789b-5j854                      2/2     Running   0          58s
oauth-openshift-54bc55789b-g6bls                      1/2     Running   0          26s
oauth-openshift-54bc55789b-jtf5m                      2/2     Running   0          91s
```

## Verification

**Note:** 
The following steps are to be performed on the hosted cluster, NOT the management cluster


Login using the credentials we created earlier. You can either login to the hosted cluster openshift console or to the api server. 

### api server login example:

```shell
hcp create kubeconfig –name <clusterName> > /tmp/<clusterName>.kube

export KUBECONFIG=/tmp/<clusterName>.kube

oc login $(oc whoami –show-server) -u admin -p password
```

Prior to logging in for the first time there are no identities or users present even though oAuth has been configured.  You will also need to give your user permissions to the cluster otherwise you won’t be able to do anything without the kubeconfig. 

Add htpasswd user `admin` to the `cluster-admin` clusterRole. 

`oc adm policy add-cluster-role-to-user cluster-admin admin`

Verify the identities and users are present (after login to console or api):

```shell
 oc get identity,users
NAME                                        IDP NAME   IDP USER NAME   USER NAME   USER UID
identity.user.openshift.io/htpasswd:admin   htpasswd   admin           admin       25dfddc5-66b4-47c2-8ba2-7b54b72eda04

NAME                           UID                                    FULL NAME   IDENTITIES
user.user.openshift.io/admin   25dfddc5-66b4-47c2-8ba2-7b54b72eda04               htpasswd:admin
```

That's it - nothig too complicated. The biggest things are understanding where to place the secret for the htpasswd config and how to define the oauth section of the hostedcluster resource. With this in place we are able to centrally manage users using htpasswd and control access via rbac versus using kubeadmin and the admin kubeconfig. 