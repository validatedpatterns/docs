---
title: Cockroach
date: 2022-12-14
tier: sandbox
Summary: A multicloud pattern using cockroachdb and submariner, deployed via RHACM.
rh_products:
- Red Hat OpenShift Container Platform
- Red Hat Advanced Cluster Management
links:
  github: https://github.com/validatedpatterns/cockroachdb-pattern/
  install: https://github.com/validatedpatterns/cockroachdb-pattern?tab=readme-ov-file#how-to-deploy
  bugs: https://github.com/validatedpatterns/cockroachdb-pattern/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
---

# Cockroach
## About Multi-Region CockroachDB Gitops

**Disclaimer: This pattern was last reviewed in 2022. Your experience may vary. If you successfully deploy this pattern, please consider contributing an update.**


A multicloud pattern using cockroachdb and submariner, deployed via RHACM.

[Repo](https://github.com/validatedpatterns/cockroachdb-pattern)

# Multi-Region CockroachDB Gitops

The pattern deploys CockroachDB across multi OpenShift clusters that are spread across different geographic regions and hosted on clouds like  [Azure](https://portal.azure.com/), [AWS](https://aws.amazon.com/) or [GKE](https://cloud.google.com/kubernetes-engine). It deploys a CockroachDB [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
into each separate cluster, and links them by deploying [Submariner add-on](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.5/html/add-ons/add-ons-overview#submariner) on the hub cluster.

If you've followed a link to this repository, but are not really sure what it contains
or how to use it, head over to [Multicloud GitOps](http://validatedpatterns.io/multicloud-gitops/)
for additional context and installation instructions.

## Prerequisites

1. An OpenShift cluster (Go to [the OpenShift console](https://console.redhat.com/openshift/create)). See also [sizing your cluster](../cluster-sizing).
1. A GitHub account (and, optionally, a token for it with repositories permissions, to read from and write to your forks)
1. The helm binary, see [here](https://helm.sh/docs/intro/install/)
1. Atleast two OpenShift clusters deployed in different regions or across different clouds. Clusters should be deployed with different IP CIDR ranges.

| Cluster  |  Pod CIDR |  Service CIDR |
|---|---|---|
| cluster1 | 10.128.0.0/14 | 172.30.0.0/16 |
| cluster2 | 10.132.0.0/14 | 172.31.0.0/16 |
| cluster3 | 10.140.0.0/14 | 172.32.0.0/16 |

ACM does not support configuring Submariner add-on for OpenShift clusters deployed in Azure cloud. Additonal steps are required to configure Submariner on Azure cluster. Before deploying cockroachdb-pattern ensure the following steps have been completed for Azure clusters.

### Prepare Azure Clusters for Submariner

Submariner Gateway nodes need to be able to accept traffic over UDP ports (4500 and 4490 by default). Submariner also uses UDP port 4800 to encapsulate traffic from the worker and master nodes to the Gateway nodes, and TCP port 8080 to retrieve metrics from the Gateway nodes. Additionally, the default OpenShift deployment does not allow assigning an elastic public IP to existing worker nodes, which may be necessary on one end of the tunnel connection.

subctl cloud prepare is a command designed to update your OpenShift installer provisioned infrastructure for Submariner deployments, handling the requirements specified above.

Run the command for cluster1:

```sh
az ad sp create-for-rbac --sdk-auth > my.auth
export KUBECONFIG=cluster1/auth/kubeconfig
subctl cloud prepare azure --ocp-metadata cluster1/metadata.json --auth-file my.auth
```

For more information on how to prepare Azure OpenShift cluster for Submariner deployment, refer to the [submariner](https://submariner.io/getting-started/quickstart/openshift/azure/#prepare-azure-clusters-for-submariner) documentation.

If you do not have a running Red Hat OpenShift cluster, you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## How to deploy

1. Fork the [cockroachdb-pattern](https://github.com/validatedpatterns/cockroachdb-pattern) repository on GitHub.  It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Clone the forked copy of this repository.

    ```sh
    git clone git@github.com:your-username/cockroachdb-pattern.git
    ```

1. Create a local copy of the Helm values file that can safely include credentials

    DO NOT COMMIT THIS FILE

    You do not want to push personal credentials to GitHub.

    ```sh
    cp values-secret.yaml.template ~/values-secret.yaml
    vi ~/values-secret.yaml
    ```

1. Customize the deployment for your cluster

   ```sh
   git checkout -b my-branch
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push origin my-branch
   ```

1. You can deploy the pattern using the [validated pattern operator](/infrastructure/using-validated-pattern-operator/). If you do use the operator then skip to Validating the Environment below.

1. Preview the changes

    ```sh
    make show
    ```

1. Login to your hub cluster using oc login or exporting the KUBECONFIG

    ```sh
    oc login
    ```

    or set KUBECONFIG to the path to your `kubeconfig` file. For example:

    ```sh
    export KUBECONFIG=~/my-ocp-env/hub/auth/kubconfig
    ```

1. Apply the changes to your cluster

    ```sh
    make install
    ```

1. Check the operators have been installed

    ```text
    OpenShift Console Web UI -> Installed Operators
    ```

1. Check all applications are synchronised
    Under the project `cockroachdb-pattern-hub` click on the URL for the `hub`gitops`server`. The Vault application is not synched.

1. Check all the managed clusters have been imported.
    Go to the routes and search for `multi` within `All Projects`. Click the link to launch ACM console. Under the clusters verify if all the managed clusters have been imported. Click on Cluster add-ons and verify if the Submariner add-on has been installed.

1. Login to your managed cluster `cluster1` using oc login or exporting the KUBECONFIG as described in step 1.

1. Select the project cockroachdb

    ```sh
    oc project cockroachdb
    ```

1. Check the pods are running and the crete-certs and init-cockroachdb-xxxxx have completed.

    ```sh
    NAME                        READY   STATUS      RESTARTS   AGE
    cockroachdb-0               1/1     Running     0          77s
    cockroachdb-1               1/1     Running     0          77s
    cockroachdb-2               1/1     Running     0          77s
    cockroachdb-client-secure   1/1     Running     0          77s
    create-certs                0/1     Completed   0          77s
    init-cockroachdb-jhnns      0/1     Completed   0          77s
    ```

1. Verify if the cockroach db is replicated across clusters.

   a. Launch cockroachdb cmdLine

    ```sh
    kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ```

   b. Create DB, tables and populate data

    ```sh
    CREATE DATABASE IF NOT EXISTS foo;
    CREATE TABLE IF NOT EXISTS foo.bar (k STRING PRIMARY KEY, v STRING); 
    UPSERT INTO foo.bar VALUES ('Kuber', 'netes'), ('Cockroach', 'DB');
    SELECT CONCAT(k, v) FROM foo.bar;
    ```

    Output:

    ```sh
    root@cockroachdb-public:26257/defaultdb> SELECT CONCAT(k, v) FROM foo.bar;
    concat
    ---------------
    CockroachDB
    Kubernetes
    (2 rows)
    ```

   c. Login to second managed cluster `cluster2` using oc login or exporting the KUBECONFIG as described above.

   d. Select the project cockroachdb

    ```sh
    oc project cockroachdb
    ```

   e. Launch cockroachdb cmdLine

    ```sh
    kubectl exec -it cockroachdb-client-secure -- ./cockroach sql --certs-dir=/cockroach-certs --host=cockroachdb-public
    ```

   f. Verify the table and data is replicated

    ```sh
    SELECT CONCAT(k, v) FROM foo.bar;
    ```

    Output:

    ```sh
    root@cockroachdb-public:26257/defaultdb> SELECT CONCAT(k, v) FROM foo.bar;
    concat
    ---------------
    CockroachDB
    Kubernetes
    (2 rows)
    ```
