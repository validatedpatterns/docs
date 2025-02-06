---
title: Application Demos
weight: 30
aliases: /industrial-edge/application/
---

# Demonstrating Industrial Edge example applications

## Prerequisites

Ensure you have administrator access to the data center cluster using one of the following methods:

* The `kubeadmin` login credentials
* The `kubeconfig` file (ensure the path is exported)

The steps followed so far should have successfully deployed the data center cluster, and optionally, a factory (edge) cluster.

With the infrastructure in place, it’s now time to see GitOps and DevOps in action through demonstrations that will modify both configuration data and deployed applications.

## Configuration changes with GitOps

There might be times where you need to change the configuration of some of the edge devices in one or more of your factories. In our example, we have various sensors at the factory. Modification can be made to these sensors using
`ConfigMaps`.

[![highleveldemodiagram](/images/industrial-edge/highleveldemodiagram-v2.png)](/images/industrial-edge/highleveldemodiagram-v2.png)

## Application changes using DevOps

The `line-dashboard` application has temperature sensors. In this demonstration you are going to make a simple change to that application, rebuild and redeploy
it. 

1. Edit the file `components/iot-frontend/src/app/app.component.html` in the `manuela-dev` repository there is a file

2. Change the
`<ion-title>IoT Dashboard</ion-title>` to for example,
`<ion-title>IoT Dashboard - DEVOPS was here!</ion-title>`. Do this in the
gitea web interface directly clicking on the editing icon for the file:

    [![gitea-iot-edit](/images/industrial-edge/gitea-iot-edit.png)](/images/industrial-edge/gitea-iot-edit.png)

3. Commit this change to your git repository so that the change will be picked up by OpenShift GitOps (ArgoCD).

    [![gitea-commit](/images/industrial-edge/gitea-commit.png)](/images/industrial-edge/gitea-commit-1.png)

4. Start the pipeline called `build-and-test-iot-frontend` that will do the following:

    1. Rebuild the image from the manuela-dev code
    2. Push the change on the hub datacenter in the manuela-tst-all namespace
    3. Create a PR in gitea

    4.1 Start the pipeline by running the following command in `industrial-edge` repository:

    ```sh
    make build-and-test-iot-frontend
    ```

The pipeline will look a bit like the following:

[![tekton-pipeline](/images/industrial-edge/pipeline-iot-frontend.png)](/images/industrial-edge/pipeline-iot-frontend.png)

After the pipeline completed the `manuela-test` application in Argo will eventually refresh and push the changes to the cluster and the line dash board route in the `manuela-tst-all` namespace will have picked up the changes. You might need to clear your browser cache to see the change:

[![linedashboard-devops](/images/industrial-edge/line-dashboard-devops.png)](/images/industrial-edge/line-dashboard-devops.png)

The pipeline will also have created a PR in gitea, such as the following one:

[![gitea-pipeline-pr](/images/industrial-edge/gitea-pipeline-pr.png)](/images/industrial-edge/gitea-pipeline-pr.png)

Verify that the change is correct on the datacenter in the `manuela-tst-all` line dashboard and if deemed correct, you can merge the PR in gitea which will roll out the change to the production factory!

## Application AI model changes with DevOps

1. On the OpenShift console click the nine-box and select `Red Hat OpenShift AI`. The AI console will open, appearing as follows:

    [![rhoai-console](/images/industrial-edge/rhoai-console-home.png)](/images/industrial-edge/rhoai-console-home.png)

2. Click the `Data Science Projects` on the left sidebar and choose the `ml-development` project. The project will open, containing a couple of workbenches and a model.:

    [![rhoai-ml-development](/images/industrial-edge/rhoai-ml-development.png)](/images/industrial-edge/rhoai-ml-development.png)

3. Click the `JupyterLab` workbench to open the notebook where this pattern's data analysis is performed. The `manuela-dev` code will be preloaded in the notebook. 

4. click the left file browser on `manuela-dev/ml-models/anomaly-detection/1-preprocessing.ipynb`:

    [![notebook-console](/images/industrial-edge/notebook-console.png)](/images/industrial-edge/notebook-console.png)

After opening the notebook successfully, walk through the demonstration by pressing play and iterating through the commands in the playbooks. Jupyter playbooks are interactive and you might make changes and also save those changes.

Running through all the six notebooks will automatically regenerate the anomaly model, prepare the data for the training and push the changes to the internal
gitea so the inference service can pick up the new model.
