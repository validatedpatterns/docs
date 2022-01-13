---
layout: default
title: Getting Started
grand_parent: Patterns
parent: Medical Edge
nav_order: 3
---

# Demonstrating Medical Diagnosis at the edge example application deployment  
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

1. An OpenShift cluster ( Go to https://console.redhat.com/openshift/create )
1. A github account (and a token for it with repos permissions, to read from and write to your forks)
1. Storage set up in your public/private cloud for the x-ray images
1. The helm binary, see https://helm.sh/docs/intro/install/

The use of this blueprint depends on having at least one running Red Hat OpenShift cluster. It is desirable to have a cluster for deploying the GitOps management hub assets and a seperate cluster(s) for the medical egde facilities.

If you do not have a running Red Hat OpenShift cluster you can start one on a
public or private cloud by using [Red Hat's cloud
service](https://console.redhat.com/openshift/create).

## Setting up the storage for OpenShift Data Foundation

Red Hat OpenShift Data Foundation relies on underlying object based storage provided by cloud providers. This storage will need to be public. The following links provide information on how to create the cloud storage required for this validated pattern on several cloud providers. 
* [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html)
* [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal) 
* [GCP Cloud Storage](https://cloud.google.com/storage/docs/quickstart-console)

There are some utilities that have been created for the validated patterns effort to speed the process. 

If you are using the utilities then you first you need to set some environment variables for your cloud provider keys.

For AWS (replace with your keys):
```
export AWS_ACCESS_KEY_ID=AKXXXXXXXXXXXXX
export AWS_SECRET_ACCESS_KEY=gkXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Then we need to create the S3 bucket and copy over the data from the validated patterns public bucket to the created bucket for your demo. You can do this on the cloud providers console or use the scripts provided on `validated-patterns-utilities` repo.  

```
python s3-create.py -b mytest-bucket -r us-west-2 -p
python s3-sync-buckets.py -s com.validated-patterns.xray-source -t mytest-bucket -r us-west-2
```

The output should look similar to this edited/compressed output.

![Bucket setup](/videos/bucket-setup.svg)](/videos/bucket-setup.svg)

There is some key information you will need to take note of that is required by the 'values-global.yaml' file. You will need the URL for the buckeyt and it's name. At the very end of the `values-global.yaml` file you will see a section for `s3:` were these values need to be changed.

# How to deploy

1. Fork this repo on GitHub. It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes.

1. Clone the forked copy of this repo.

   ```sh
   git clone git@github.com:<your-username>/medical-diagnosis.git
   ```

1. Create a local copy of the Helm values file that can safely include credentials

  DO NOT COMMIT THIS FILE

  You do not want to push personal credentials to GitHub.
   ```sh
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```
  When you edit the file you can make changes to the various DB passwords if you wish. 

1. Customize the deployment for your cluster. Remember to use the data optained from the cloud storage creation (S3, Blob Storage, Cloud Storage) as part of the data to be updated in the yaml file. There are comments in the file highlightiung what what chnages need to be made.

   ```sh
   vi values-global.yaml
   git add values-global.yaml
   git commit values-global.yaml
   git push
   ```

1. Preview the changes that will be made to the Helm charts.
   ```sh
   make show
   ```

1. Login to your cluster using oc login or exporting the KUBECONFIG

   ```sh
   oc login
   ```

   or set KUBECONFIG to the path to your `kubeconfig` file. For example:

   ```sh
   export KUBECONFIG=~/my-ocp-env/auth/kubconfig
   ```

1. Apply the changes to your cluster

   ```sh
   make install
   ```

   If the install fails and you go back over the instructions and see what was missed and change it, then run `make update` to continue the installation.

1. This takes some time. Especially for the OpenShift Data Foundation operator components to install and synchronize. The `make install` provides some progress updates during the install. It can take up to twentry minutes. Compare your `make install` run progress with the following video showing a successful install. 

[![Demo](/videos/xray-deployment.svg)](/videos/xray-deployment.svg)

1. Check that the operators have been installed in the UI.

   ```
   OpenShift UI -> Installed Operators
   ```
   The main operator to watch is the OpenShift Data Foundation.

1. You can also check on the progress OpenShift GitOps. Obtain the ArgoCD urls 
   and passwords. 

   The URLs and login credentials for ArgoCD change depending on the pattern
   name and the site names they control.  Follow the instructions below to find
   them, however you choose to deploy the pattern.

   Display the fully qualified domain names, and matching login credentials, for
   all ArgoCD instances:

   ```sh
   ARGO_CMD=`oc get secrets -A -o jsonpath='{range .items[*]}{"oc get -n "}{.metadata.namespace}{" routes; oc -n "}{.metadata.namespace}{" extract secrets/"}{.metadata.name}{" --to=-\\n"}{end}' | grep gitops-cluster`
   CMD=`echo $ARGO_CMD | sed 's|- oc|-;oc|g'`
   eval $CMD

   ```

   The result should look something like:

   ```sh
   NAME                       HOST/PORT                                                                                         PATH      SERVICES                   PORT    TERMINATION            WILDCARD
   hub-gitops-server          hub-gitops-server-industrial-edge-hub.apps.mycluster.mydomain.com          hub-gitops-server   https   passthrough/Redirect   None
   # admin.password
   2F6kgITU3DsparWyC

   NAME                    HOST/PORT                                                                                   PATH   SERVICES                PORT    TERMINATION            WILDCARD
   region-one-gitops-server      region-one-gitops-server-industrial-edge-region-one.apps.mycluster.mydomain.com          region-one-gitops-server   https   passthrough/Redirect   None
   # admin.password
   K4ctDIm3fH7ldhs8p

   NAME                      HOST/PORT                                                                              PATH   SERVICES                  PORT    TERMINATION            WILDCARD
   cluster                   cluster-openshift-gitops.apps.mycluster.mydomain.com                          cluster                   8080    reencrypt/Allow        None
   kam                       kam-openshift-gitops.apps.mycluster.mydomain.com                              kam                       8443    passthrough/None       None
   openshift-gitops-server   openshift-gitops-server-openshift-gitops.apps.mycluster.mydomain.com          openshift-gitops-server   https   passthrough/Redirect   None
   # admin.password
   WNklRCD8EFg2zK034
   ```

   The most important ArgoCD instance to examine at this point is `multicloud-gitops-hub`. This is where all the applications for the hub can be tracked.


1. Check all applications are synchronised

## Viewing the Grafana based dashboard.

1. First we need to accept SSL certificates on the browser for the dashboard. In the OpenShift console go to the Routes for project openshift-stroage. Click on the URL for the s3-rgw. 
[![Storage Routes](/images/medical-edge/storage-route.png)](/images/medical-edge/storage-route.png))

Make sure that you see some XML and not an access denied message.

[![Storage Routes](/images/medical-edge/storage-rgw-route.png)](/images/medical-edge/storage-rgw-route.png))

1. While still looking at Routes, change the project to `xraylab-1`. Click on the URL for the `image-server`. Make sure you do not see an access denied message. You ought to see a `Hello World` message.

[![Storage Routes](/images/medical-edge/grafana-routes.png)](/images/medical-edge/grafana-routes.png))

1. Turn on the image file flow. There are two ways to go about this.

   Go to the OpenShift UI and change the view from Administrator to Developer and select Topology. From there select the `xraylab-1` project.

[![Xraylab-1 Topology](/images/medical-edge/dev-topology.png)](/images/medical-edge/dev-topology.png))

   Right click on the `image-generator` pod icon and select `Edit Pod count`. 

 [![Pod menu](/images/medical-edge/dev-topology-menu.png)](/images/medical-edge/dev-topology-menu.png))
 
   Up the pod count from `0` to `1` and save.  

 [![Pod count](/images/medical-edge/dev-topology-pod-count.png)](/images/medical-edge/dev-topology-pod-count.png))

   Go to the OpenShift UI under Workloads, select Deploymentconfigs for Project xraylab-1. Click on `image-generator` and increase the pod count to 1.

[![Image Pod](/images/medical-edge/start-image-flow.png)](/images/medical-edge/start-image-flow.png))

# More reading

## General Hybrid Cloud Patterns reading

For more general patterns documentation please refer to the hybrid cloud patterns docs [here](http://hybrid-cloud-patterns.io/).

## Editing the diagrams.

To edit the diagrams in Draw.io you can load them [here](https://redhatdemocentral.gitlab.io/portfolio-architecture-tooling/index.html?#/portfolio-architecture-examples/projects/edge-medical-diagnosis.drawio) and save a local copy
