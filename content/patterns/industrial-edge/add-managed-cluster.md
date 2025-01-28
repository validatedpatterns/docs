---
title: Adding a managed cluster
weight: 10
aliases: /industrial-edge/getting-started/
---

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
