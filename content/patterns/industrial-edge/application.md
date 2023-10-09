---
title: Application Demos
weight: 30
aliases: /industrial-edge/application/
---

# Demonstrating Industrial Edge example applications

## Background

Up until now the Industrial Edge 2.0 validated patterns has focused primarily on successfully deploying the architectural pattern. Now it is time to see GitOps and DevOps in action as we go through a number of demonstrations to change both configuration information and the applications that we are deploying.

If you have already deployed the data center and optionally a factory (edge) cluster, then you have already seen several applications deployed in the OpenShift GitOps console. If you haven't done this then we recommend you deploy the data center after you have setup the Quay repositories described below.

## Prerequisite preparation

### Quay public registry setup

In the [Quay.io](https://quay.io) registry please ensure you have the following repositories and that they are set for public access. Replace your-org with the name of your organization or Quay.io username.

* _your-org_/iot-software-sensor
* _your-org_/iot-consumer
* _your-org_/iot-frontend
* _your-org_/iot-anomaly-detection
* _your-org_/http-ionic

These repositories are needed in order to provide container images built at the data center to be consumed by the factories (edge).

### Local laptop/workstation

Make sure you have `git` and OpenShift's `oc` command-line clients.

### OpenShift Cluster

Make sure you have the `kubeadmin` administrator login for the data center cluster. Use this or the `kubeconfig` (export the path) to provide administrator access to your data center cluster. It is not required that you have access to the edge (factory) clusters. GitOps and DevOps will take care of the edge clusters.

### GitHub account

You will need to login into GitHub and be able to fork two repositories.

* validatedpatterns/industrial-edge
* validatedpatterns-demos/manuela-dev

## Configuration changes with GitOps

There will may be times where you need to change the configuration of some of the edge devices in one or more of your factories. In our example, we have various sensors at the factory. Modification can be made to these sensors using `ConfigMaps`.

[![highleveldemodiagram](/images/industrial-edge/highleveldemodiagram.png)](/images/industrial-edge/highleveldemodiagram.png)

In this demonstration we will turn on a temperature sensor for sensor #2. We will first do this in the data center because this will demonstrate the power of GitOps without having to involve the edge/factory.  However if you do have an factory joined using Advanced Cluster Management, then the changes will make their way out to the factory. But it is not necessary for the demo as we have a complete test environment on the data center.

Make sure you are able to see the dashboard application in a tab on your browser. You can find the URL for the dashboard application by looking at the following in your OpenShift console.

[![network-routing-line-dashboard](/images/industrial-edge/network-routing-line-dashboard.png)](/images/industrial-edge/network-routing-line-dashboard.png)

Select Networking->Routes on the left-hand side of the console. Using the Projects pull-down, select `manuela-tst-all`. Click on the URL under the Location column for the route Name `line-dashboard`. this will launch the line-dashboard monitoring application in a browser tab. The URL will look like:

`line-dashboard-manuela-tst-all.apps.*cluster-name*.*domain*`

Once the the application is open in your browser, click on the “Realtime Data” Navigation on the left and wait a bit. Data should be visualized as received. Note that there is only vibration data shown! If you wait a bit more (usually every 2-3 minutes), you will see an anomaly and alert on it.

[![app-line-dashboard-before](/images/industrial-edge/app-line-dashboard-before.png)](/images/industrial-edge/app-line-dashboard-before.png)

Now let's turn on the temperature sensor. Using you favorite editor, edit the following file:

```sh
industrial-edge/charts/data-center/manuela-test/templates/machine-sensor/machine-sensor-2-configmap.yaml
```

Change `SENSOR_TEMPERATURE_ENABLED: "false"` to `SENSOR_TEMPERATURE_ENABLED: "true"`.

Then change and commit this to your git repository so that the change will be picked up by OpenShift GitOps (ArgoCD).

```sh
git add industrial-edge-charts/data/center/manuela-test/templates/machine-sensor/machine-sensor-2-configmap.yaml
git commit -m "Turned on temprature sensor for machine sensor #2"
git push
```

You can track the progress of this commit/push in your OpenShift GitOps console in the `manuela-test-all` application. You will notice components regarding machine-sensor-2 getting sync-ed. You can speed this up by manually pressing the Refresh button.

[![argocd-line-dashboard](/images/industrial-edge/argocd-line-dashboard.png)](/images/industrial-edge/argocd-line-dashboard.png)

The dashboard app should pickup the change automatically, once data from the temperature sensor is received.
Sometimes a page/tab refreshed is needed for the change to be picked up.

[![app-line-dashboard](/images/industrial-edge/app-line-dashboard.png)](/images/industrial-edge/app-line-dashboard.png)

## Application changes using DevOps

The `line-dashboard` application has temperature sensors. In this demonstration we are going to make a simple change to that application, rebuild and redeploy it. In the `manuela-dev` repository there is a file `components/iot-consumer/index.js`. This JavaScript program consumes message data coming from the line servers and one of functions it performs is to check the temperature to see if it has exceeded a threshold. There is three lines of code in there that does some Celsius to Fahrenheit conversion.

Depending on the state of your `manuela-dev` repository this may or may not be commented out. Ideally for the demonstration you would want it  uncommented and therefore effective.  What this means is that while the labels on the frontend application are showing Celsius, the data is actually in Fahrenheit. This is a good place to start because that data won't make any sense.

[![fahrenheit-temp](/images/industrial-edge/fahrenheit-temp.png)](/images/industrial-edge/fahrenheit-temp.png)

Machines running over 120C is not normal.  However examining the code explains why. There is an erroneous conversion taking place. What must happen is we remove or comment out this code.

[![uncommented-code](/images/industrial-edge/uncommented-code.png)](/images/industrial-edge/uncommented-code.png)

If you haven't deployed the uncommented code it might be best to prepare that before the demonstration. After pointing out the problem, comment out the code.

[![commented-code](/images/industrial-edge/commented-code.png)](/images/industrial-edge/commented-code.png)

Now that the erroneous conversion code has been commented out it is is time rebuild and redeploy. First commit and push the code to the repository. While in the directory for your `manuela-dev` repository run the following commands. The `components/iot-consumer/index.js` file should be the only changed file.

```sh
git add components/iot-consumer/index.js
git commit -m "commented out C to F temp conversion"
git push
```

Now its time to kick off the CI pipeline. Due to the need for GitHub secrets and Quay secrets as part of this process, we currently can't use the OpenShift console's Pipelines to kick off the pipeline in the demo environment. Instead, use the command-line. While in the `industrial-edge` repository directory, run the following:

```sh
make build-and-test
```

This build takes some time because the pipeline is rebuilding all the images. You can monitor the pipeline's progress in the Openshift console's pipelines section.

Alternatively you can can try and run the shorter `build-iot-consumer` pipeline run in the OpenShift console. This should just run and test the specific application.

[![build-and-test-pipeline](/images/industrial-edge/build-and-test-pipeline.png)](/images/industrial-edge/build-and-test-pipeline.png)

You can also see some updates happening in the `manuela-tst` application in OpenShift GitOps (ArgoCD).

When the pipeline is complete check the `lines-dashboard` application again in the browser. More reasonable, Celsius, temperatures are displayed. (Compare with above.)

[![celsius-temp](/images/industrial-edge/celsius-temp.png)](/images/industrial-edge/celsius-temp.png)

The steps above have successfully applied the change to the Manuela test environment at the data center. In order for these changes to be pushed out to the factories it must be accepted and pushed to the Git repository. Examine the project in GitHub. There is a new Pull Request (PR) called **Pull request created by Tekton task github-add-pull-request**. Select that PR and merge the pull request.

[![tekton-pull-request](/images/industrial-edge/tekton-pull-request.png)](/images/industrial-edge/tekton-pull-request.png)

OpenShift GitOps will see the new change and apply it out to the factories.

## Application AI model changes with DevOps

After a successful deployment of Industrial Edge 2.0, check to see that Jupyter Hub is running. To do this go to project `manuela-ml-workspace` check that `jupyterhub` pods are up and running.

[![jupyerhub-pods](/images/industrial-edge/jupyterhub-pods.png)](/images/industrial-edge/jupyterhub-pods.png)

Then, in the same project `manuela-ml-namespace`, select Networking/Routes and click on the URL associated with `jupyterhub` in the Location column.

[![jupyterhub-url](/images/industrial-edge/jupyterhub-url.png)](/images/industrial-edge/jupyterhub-url.png)

This will bring you to a web page at an address in the following format:

* `jupyterhub-manuela-ml-workspace.apps.*clustername*.*your-domain*`

Options for different types of Jupyter servers are shown. There are two options that are useful for this demo.

* Standard Data Science. Select this notebook image for simpler notebooks like `Data Analyses.ipynb`
* Tensorflow Notebook Image. Select this notebook image for more a complex notebook that require Tensorflow. E.g. `Anomaly Detection-using-TF-and-Deep-Learning.ipynb`

At the bottom of the screen there is a `Start server` button. Select the type of Notebook server image and press `Start server`.

[![jupyterhub-init-console](/images/industrial-edge/jupyterhub-init-console.png)](/images/industrial-edge/jupyterhub-init-console.png)

Selecting Tensorflow notebook image:

[![jupyter-tf-server](/images/industrial-edge/jupyter-tf-server.png)](/images/industrial-edge/jupyter-tf-server.png)

On the next screen upload the following files from `manuela-dev/ml-models/anomaly-detection`:

* One of the Jupyter notebooks
  * `Data-Analyses.ipynb` for a somewhat simpler demo
  * `Anomaly Detection-using-TF-and-Deep-Learning.ipynb` for a Tensorflow demo.
* raw-data.cvs

[![upload-ml-files](/images/industrial-edge/upload-ml-files.png)](/images/industrial-edge/upload-ml-files.png)

Open the notebook by double clicking on the notebook file (ending in `.ipynb`)

[![anomaly-detection-notebook](/images/industrial-edge/anomaly-detection-notebook.png)](/images/industrial-edge/anomaly-detection-notebook.png)

After opening the notebook successfully, walk through the demonstration by pressing play and iterating through the commands in the playbook. Jupyter playbooks are interactive and you may make changes and also save those changes. Also, some steps in the notebook take milliseconds, however, other steps can take a long time (up to an hour), so check on the completion of steps.

Remember that changes to the notebook will require downloading, committing, and pushing that notebook to the git repository so that it gets redeployed to the factories.

## Turning on event streaming between the edge and the datacenter

There is one other area that has not been completed for the overall validated pattern. The unfinished part is the streaming of events from the factory back to the datacenter and adding that data to the data lake for data scientists to apply their "magic".

The automation for this is complete. However, there are certificates and/or keys that need to be replaced in the following files for the datacenter and factory templates:

```text
industrial-edge/charts/datacenter/kafka/templates/kafka-tls-certificate-and-key.yaml
industrial-edge/charts/factory/templates/factory-kafka-cluster/kafka-tls-certificate-and-key.yaml
industrial-edge/charts/factory/templates/factory-mirror-maker/kafka-tls-certificate.yaml
```

See the Yaml files for more details.

After updating these files with the proper certs/keys, apply the changes to the OpenShift cluster using `oc apply`.
