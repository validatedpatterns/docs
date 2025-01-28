---
title: Getting Started
weight: 10
aliases: /industrial-edge/getting-started/
---

# Deploying the Industrial Edge Pattern

# Prerequisites

1. An OpenShift cluster (Go to [the OpenShift
   console](https://console.redhat.com/openshift/create)). Cluster must have a
   dynamic StorageClass to provision PersistentVolumes. See also [sizing your
   cluster](../../industrial-edge/cluster-sizing).
1. (Optional) A second OpenShift cluster for edge/factory

The use of this pattern depends on having at least one running Red Hat
OpenShift cluster. It is desirable to have a cluster for deploying the data
center assets and a separate cluster(s) for the factory assets.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## Prerequisites

For installation tooling dependencies, see [Patterns quick start](/learn/quickstart)

The Industrial Edge pattern installs an in-cluster gitea instance by default. This 
means that there is no need to fork the pattern's git repository and that ArgoCD will point
directly at the in-cluster git repository. Changes should be done there and not on github.
See this [post](https://validatedpatterns.io/blog/2024-07-12-in-cluster-git/) for more information.

# How to deploy

1. Clone the [industrial-edge](https://github.com/validatedpatterns/industrial-edge) repository on GitHub.

1. On your laptop or bastion host login to your cluster by using the `oc login` command or by exporting the `KUBECONFIG` file.

   ```sh
   oc login
   ```

   or

   ```sh
   export KUBECONFIG=~/my-ocp-cluster/auth/kubeconfig
   ```

1. Deploy the industrial edge pattern:

   ```sh
   cd <path-to-cloned-github-repository>
   ./pattern.sh make install
   ```
 The `make install` target deploys the Validated Patterns Operator, all the resources that are defined in the `values-datacenter.yaml`

# Validating the Environment

1. Verify that the following Operators are installed on the HUB cluster:

   ```text
   $ oc get operators.operators.coreos.com -A
   NAME                                                  AGE
   advanced-cluster-management.open-cluster-management   3h8m
   amq-broker-rhel8.manuela-tst-all                      3h8m
   amq-streams.manuela-data-lake                         3h8m
   amq-streams.manuela-tst-all                           3h8m
   camel-k.manuela-data-lake                             3h8m
   camel-k.manuela-tst-all                               3h8m
   mcg-operator.openshift-storage                        3h7m
   multicluster-engine.multicluster-engine               3h4m
   ocs-client-operator.openshift-storage                 3h7m
   ocs-operator.openshift-storage                        3h7m
   odf-csi-addons-operator.openshift-storage             3h7m
   odf-operator.openshift-storage                        3h8m
   odf-prometheus-operator.openshift-storage             3h7m
   openshift-gitops-operator.openshift-operators         3h11m
   openshift-pipelines-operator-rh.openshift-operators   3h8m
   patterns-operator.openshift-operators                 3h12m
   recipe.openshift-storage                              3h7m
   rhods-operator.redhat-ods-operator                    3h8m
   rook-ceph-operator.openshift-storage                  3h7m
   ```

   **Note: The list above was taken on OpenShift 4.16. It might change slightly depending on the OpenShift version being used (e.g. odf has less operator components on OpenShift 4.15 and earlier)**

1. Access the ArgoCD environment

   You can find the ArgoCD application links listed under the nine box **Red
   Hat applications** in the OpenShift Container Platform web console.

   ![ArgoCD Links](/images/industrial-edge/nine-box.png)

   The most important ArgoCD instance to examine at this point is the
   `Datacenter ArgoCD`. This is where all the applications for the datacenter,
   including the test environment, can be tracked.

1. Check that all applications are synchronised. It should look like the following:

   ![ArgoCD Apps](/images/industrial-edge/datacenter-argocd-apps.png)

## Next Steps

By default, Red Hat Advanced Cluster Management (RHACM) manages the `clusterGroup` applications that are deployed on all clusters.

Add a `managedClusterGroup` for each cluster or group of clusters that you want to manage by following this procedure.

## Procedure

1. By default the `factory` applications defined in the `values-factory.yaml` file are deployed on all clusters imported into ACM and that have the label `clusterGroup=factory`. 

2. In the left navigation panel of the web console associated with your deployed hub cluster, click **local-cluster**. Select **All Clusters**. The RHACM web console is displayed.

3. In the **Managing clusters just got easier** window, click **Import an existing cluster**.

    - Enter the cluster name (you can get this from the login token string, for example: `https://api.<cluster-name>.<domain>:6443`).
    - You can leave the **Cluster set** blank.
    - In the **Additional labels** dialog box, enter the `key=value` as `clusterGroup=factory`.
    - Choose **KubeConfig** as the "Import mode".
    - In the **KubeConfig** window, paste your KubeConfig content. Click **Next**.

4. You can skip the **Automation** screen. Click **Next**.

5. Review the summary details and click **Import**.

6. Once the data center and the factory have been deployed you will want to check out and test the Industrial Edge 2.0 demo code. You can find that [here](../application/). The argo applications on the factory cluster will look
like the following:

   ![ArgoCD Factory Apps](/images/industrial-edge/factory-apps.png)

# Uninstalling

We currently do not support uninstalling this pattern.

# Help & Feedback

[Help & Feedback](https://groups.google.com/g/validatedpatterns) - [Report Bugs](https://github.com/validatedpatterns/industrial-edge/issues)

# Uninstalling

We currently do not support uninstalling this pattern.

# Help & Feedback

[Help & Feedback](https://groups.google.com/g/validatedpatterns) - [Report Bugs](https://github.com/validatedpatterns/industrial-edge/issues)
