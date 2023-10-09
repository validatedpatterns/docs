---
date: 2022-10-12
title: Multi-cluster GitOps with Provisioning
summary: With validated patterns, you can easily create and configure complex cluster topologies
author: Andrew Beekhof
blog_tags:
- acm
- provisioning
- patterns
- GitOps
aliases: /2022/10/12/acm-provisioning/
---

# Multi-cluster GitOps with Provisioning

## Introduction

Validated Patterns are an opinionated GitOps environment that lowers the bar for
those creating repeatable and declarative deployments. It’s value is most
apparent when delivering demos and solutions that span multiple areas of our
portfolio.  Our skeleton allows folks to focus on what needs to be delivered
while we take care of how to do so using best practices. This is further
illustrated in the simplified way patterns use ACM to provision additional
clusters.

Not only do patterns allow a cluster to completely configure itself - including
elements traditionally handled with scripting and extending beyond the cluster,
but we can now also declaratively teach it about a set of clusters it should
provision and subsequently configure.

Let’s walk through an example using the Multi-Cloud GitOps pattern as an example…

## Preparation

If you've never deployed OpenShift before, you could try [ROSA](https://cloud.redhat.com/learn/getting-started-red-hat-openshift-service-aws-rosa/deploy-rosa-cluster)
the pay-as-you-go OpenShift managed service.

| Installing a validated pattern |
| ------------------------------ |
| [![Installing a validated pattern](https://img.youtube.com/vi/N6XPh-9XZAM/mqdefault.jpg "Installing a validated pattern")](https://youtu.be/N6XPh-9XZAM) |

Start by [deploying](https://validatedpatterns.io/multicloud-gitops/getting-started/) the Multi-cloud GitOps pattern on AWS.

Next, you'll need to create a fork of the [multicloud-gitops](https://github.com/validatedpatterns/multicloud-gitops/)
repo.  Go there in a browser, make sure you’re logged in to GitHub, click the
“Fork” button, and confirm the destination by clicking the big green "Create
fork" button.

Now you have a copy of the pattern that you can make changes to.  You can read
more about the Multi-cloud GitOps pattern on our [community
site](https://validatedpatterns.io/multicloud-gitops/)

Next, [install the Validated Patterns operator](https://validatedpatterns.io/infrastructure/using-validated-pattern-operator/) from Operator Hub.

And finally, click through to the installed operator, and select the `Create
instance` button and fill out the Create a Pattern form.  Most of the defaults
are fine, but make sure you update the GitSpec URL to point to your fork of
`multicloud-gitops`, rather than
`https://github.com/validatedpatterns/multicloud-gitops`.

### Providing your Cloud Credentials

Secrets must never be stored in Git.  Even in encrypted form, you likely also
publish metadata that may be exploited to launch spear phishing, and
waterholing attacks.

The Multi-Cloud GitOps pattern uses HashiCorp's Vault for secure secret
storage.

In order to provision additional clusters, the hub will need your cloud
credentials.  To do this you can either manually load the secrets into the
vault via the UI, or make use of the following process for loading them from a
machine you control.

| Loading provisioning secrets |
| ---------------------------- |
| [![Loading provisioning secrets](https://img.youtube.com/vi/LSDUTfZvcyA/mqdefault.jpg "Loading provisioning secrets")](https://youtu.be/LSDUTfZvcyA) |

First clone your fork of the repository onto your local machine, and copy the template to a location not controlled by Git (to avoid accidentally committing the contents)

```sh
git clone git@github.com:{yourfork}/multicloud-gitops.git
cp values-secret.yaml.template ~/values-secret.yaml
```

You will need to uncomment and provide values for the following keys in order to make use of the provisioning functionality:

```yaml
secrets:
  aws:                                       [1]
    aws_access_key_id: AKIAIOSFODNN7EXAMPLE
    aws_secret_access_key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

files:
  publickey: ~/.ssh/id_rsa.pub               [2]
  privatekey: ~/.ssh/id_rsa
  openshiftPullSecret: ~/.dockerconfigjson   [3]
```

_[1]_ A guide to finding the relevant AWS values can be found [here](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)
You might even have them in a `~/.aws/credentials` file.

_[2]_ The public/private key-pair is used to allow access to OpenShift nodes for triage purposes.

_[3]_ The openshiftPullSecret is how Red Hat knows you’ve got a licence to
install OpenShift.  To obtain one, go
[here](https://console.redhat.com/openshift/install/pull-secret), save the
contents, and provide that path in the secrets file.  The contents should start
with something like: `{"auths":{"cloud.openshift.com":{"auth":"...`.

Obtain the login command for your cluster and run it locally.
![console login](/images/console-login.png)

Ensure `podman` is installed, and load the secrets with:

```sh
./common/scripts/pattern-util.sh make load-secrets
```

These values will be used to create a number of secrets that ACM expects in
order to provision clusters.

| Loading Secrets into the Cluster |
| ------------------------- |
| [![Loading secrets into the cluster](https://img.youtube.com/vi/LSDUTfZvcyA/mqdefault.jpg "Loading secrets into the cluster")](https://youtu.be/LSDUTfZvcyA) |

## Define a Managed Cluster Group

Managed cluster groups are sets of clusters, grouped by function, that share a
common configuration set.  There is no limitation on the number of groups, or
the number of clusters within each group, however IIUC there is a scaling limit
of approximately 1000 clusters in total.

The following is the example we will use today:

```yaml
  managedClusterGroups:
    myFirstGroup:
      name: group-one
      labels:
      - name: clusterGroup
        value: group-one
```

`.name` is significant here and defines which site file (`values-{name}.yaml`) is
used as the cluster's bill-of-materials.  In the example above, you would need
to make sure that `values-group-one.yaml` existed at the top of the Git repo and
contained a list of all the namespaces, subscriptions, and applications that
should be delivered to the cluster.

`.labels` tells ACM how to decide which clusters get this site configuration.  If
you were building and [importing
clusters](https://validatedpatterns.io/industrial-edge/factory/) yourself,
these are the labels you would need to specify during the import process.  You
can specify different and/or additional labels, but the default is to use
`clusterGroup={name of the group}`

## Create a Cluster Pool

Validated Patterns use cluster pools to automatically provision and configure
sets of spoke clusters in cloud environments (so far with a focus on testing
AWS).  You can even configure the pools to maintain a number of spare
(hibernating) clusters, to provide rapid and cost-effective access to clusters
on-demand and at scale.

You can read more about cluster pools in the [ACM documentation](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.6/html/multicluster_engine/multicluster_engine_overview#managing-cluster-pools)

| Defining the cluster pool | Defining clusters |
| ------------------------- | ----------------- |
| [![Defining and scaling the cluster pool](https://img.youtube.com/vi/FaomChtlUE4/mqdefault.jpg "Defining and scaling the cluster pool")](https://youtu.be/FaomChtlUE4) | [![Defining clusters](https://img.youtube.com/vi/IJk3vTjMPCo/mqdefault.jpg "Defining clusters")](https://youtu.be/IJk3vTjMPCo) |

Each managed cluster group can have multiple pools, here is an example:

```yaml
      clusterPools:
        myFirstPool:
          name: aws-ap
          openshiftVersion: 4.10.18
          baseDomain: blueprints.rhecoeng.com
          platform:
            aws:
              region: ap-southeast-2
          size: 1
          clusters:
          - tokyo
          - sydney
          - jakarta
```

The most important thing to change is `.baseDomain`, which will need to
correspond to a route53 domain associated with your account.  We allow multiple
pools per group so that the same cluster configuration can be delivered to
multiple regions.

You can specify as many clusters as your AWS limits will support.  Feel free to
choose something different than tokyo, sydney, and jakarta.

If `.size` is omitted, the pool will automatically resize based on the number of
clusters specified.  Specifying no clusters will define the pool, but not
provision any clusters.

## Delivering Applications and Configuration to Clusters

| Delivering Configuration Changes |
| -------------------------------- |
| [![Updating the managed cluster configuration](https://img.youtube.com/vi/oorZnch-ggY/mqdefault.jpg "Updating the managed cluster configuration")](https://youtu.be/oorZnch-ggY) |

## Deprovisioning Clusters

As the provisioning data only exists on the ACM hub cluster, it is important to ensure any managed clusters are deprovisioned _before_ the hub itself is destroyed.  In general this involves scaling down the pool(s), and removing the entries in the `clusters:` list.

You can see the process in action below:

| Deprovisioning clusters |
| ----------------------- |
| [![Deprovisioning clusters](https://img.youtube.com/vi/ik5LR-ouPdo/mqdefault.jpg "Deprovisioning clusters")](https://youtu.be/ik5LR-ouPdo) |

## Conclusion

Once entrusted with your cloud credentials, all patterns can drive the creation and
subsequent configuration of complex cluster topologies (including hub-of-hubs!).
