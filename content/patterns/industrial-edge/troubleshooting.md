---
title: Troubleshooting
weight: 40
aliases: /industrial-edge/troubleshooting/
---

# Troubleshooting

## Our [Issue Tracker](https://github.com/validatedpatterns/industrial-edge/issues)

## Installation-phase Failures

The framework for deploying the applications and their operators has been made easy for the user
by using OpenShift GitOps for continuous deployment (Argo CD). It takes time to deploy everything.
You may have to go back and forth between the OpenShift cluster console and the
OpenShift GitOps console to check on applications and operators being up and in
a ready state.

The applications deployment for the main data center are as follows. First
OpenShift GitOps operator will deploy. See the OpenShift Console to see that it
is running. Then OpenShift GitOps takes over the rest of the deployment. It
deploys the following applications:

- Advanced Cluster Management operator in the application `acm`. this will manage the edge clusters
- Red Hat OpenShift AI in the application `data-science-cluster` and `data-science-project` for the data science components.
- OpenShift Pipelines is deployed in the application `pipelines`
- AMQ Streams is deployed to manage data coming from factories and stored in a data lake.
- The data lake uses S3 based storage and is deployed in the `production-data-lake` application
- Testing at the data center is managed by the `manuela-test` application

Make sure that all these applications are `Healthy` 💚 and `Synced` ✅ in the
OpenShift GitOps console. If in a state other than `Healthy` (`Progressing,
Degraded, Missing, Unknown'`) then it's time to dive deeper into that
application and see what has happened.

The applications deployed on the factory (edge) cluster are as follows. After a
successful importing [1] a factory cluster to the main ACM hub, you should
check in the factory cluster's OpenShift UI to see if the projects
`open-cluster-manager-agent` and `open-cluster-manager-agent-addons` are
running. When these are deployed then OpenShift GitOps operator will be
deployed on the cluster. From there OpenShift GitOps deploys the following
applications:

- `stormshift` sets up application and AMQ integration components
- `golang-external-secrets` sets up the bits to be able to get secrets from the data center.

[1] ACM has different ways of describing this process based on which tool you are using. Attach, Join, Import are terms associated with bringing a cluster under the management of a hub cluster.

### Subscriptions not being installed

#### Symptom: Install seems to "freeze" at a specific point.  Expected operators do not install in the cluster

**Cause:** It is possible an operator was requested to be installed that isn't
allowed to be installed on this version of OpenShift.

**Resolution:**
In general, use the project-supplied `global.options.UseCSV` setting of
`False`.  This requests the current, best version of the operator available.
If a specific CSV (Cluster Service Version) is requested but unavailable, that
operator will not be able to install at all, and when an operator fails to
install, that may have a cascading effect on other operators.

## Potential (Known) Operational Issues

### Pipeline Failures

#### Symptom: Intermittent failures in Pipeline stages

Some sample errors:

```text
level=error msg="Error while applying layer: ApplyLayer io: read/write on closed pipe stdout: {\"layerSize\":7301}\n stderr: "
error creating build container: Error committing the finished image: error adding layer with blob
```

```text
time="2021-09-29T18:48:27Z" level=fatal msg="Error trying to reuse blob sha256:235f9e6f3559c04d5ee09b613dcab06dbc03ceb93b65ce364afe35c03fd53574 at destination: failed to read from destination repository martjack/iot-software-sensor: 500 (Internal Server Error)
```

```text
I1006 22:07:47.908257      14 request.go:645] Throttling request took 1.195150708s, request: GET:https://172.30.0.1:443/apis/autoscaling.openshift.io/v1?timeout=32s
PipelineRun started: seed-iot-software-sensor-run-cpzzv
Waiting for logs to be available...
E1006 22:08:27.106369      14 runtime.go:78] Observed a panic: "send on closed channel" (send on closed channel)
goroutine 487 [running]:
k8s.io/apimachinery/pkg/util/runtime.logPanic(0x1b40ee0, 0x1fe47b0)
 /workspace/pkg/mod/k8s.io/apimachinery@v0.19.7/pkg/util/runtime/runtime.go:74 +0x95
k8s.io/apimachinery/pkg/util/runtime.HandleCrash(0x0, 0x0, 0x0)
 /workspace/pkg/mod/k8s.io/apimachinery@v0.19.7/pkg/util/runtime/runtime.go:48 +0x89
panic(0x1b40ee0, 0x1fe47b0)
```

When this happens, the pipeline may not entirely stop running.  It is safe to
stop/cancel the pipeline run, and desirable to do so, since multiple pipelines
attempting to change the repository at the same time could cause more failures.

**Resolution:** Run `make seed` in the root of the repository OR re-run the failed pipeline segment (e.g. seed-iot-frontend or seed-iot-consumer).

We're looking into better long-term fixes for a number of the situations that can cause these situations as [#40](https://github.com/validatedpatterns/industrial-edge/issues/40).

#### Symptom: Error in "push-*" pipeline tasks

**Cause:** Multiple processes or people were trying to make changes to the repository at the same time.  The state of the repository changed in the middle of the process in such a way that the update was not a "fast-forward" in git terms.

**Resolution:** Re-run the failed pipeline segment OR run `make seed` from the root of your fork of the industrial-edge repository.

It is also possible that multiple pipelines were running at the same time and were making conflicting changes. We recommend running one pipeline at a time.

#### Symptom: Pipelines application perpetually "progressing" and not showing green/healthy. May show "degraded"

**Cause:** Most likely the application is missing the images that are built by the seed pipeline.

**Resolution:** Run `make seed` from the root of your forked repository directory, which will build the images and deploy them to both test and production.

#### Symptom: There is a "spinny" next to one of the resources in the app that never resolves

**Cause:** Check for a PersistentVolumeClaim that is not in use.

**Resolution:** Delete the unused PVC

### ArgoCD not syncing

#### Symptom: ArgoCD shows an error and "Unknown" sync status

**Cause:** A change has been made in the repository that renders invalid YAML

**Resolution:** Fix the issue as identified by the error message, and commit and push the fix OR revert the last one.

Certain changes might invalidate objects in ArgoCD, and this will prevent
ArgoCD from deploying the change related to that commit.  The error message for
that situation might look like this (this particular change removed the Image
details from the kustomization.yaml file, and we resolved it by re-adding the
image entries:

```text
rpc error: code = Unknown desc = Manifest generation error (cached): `/bin/bash -c helm template . --name-template ${ARGOCD_APP_NAME:0:52} -f https://github.com/claudiol/industrial-edge/raw/deployment/values-global.yaml -f https://github.com/claudiol/industrial-edge/raw/deployment/values-datacenter.yaml --set global.repoURL=$ARGOCD_APP_SOURCE_REPO_URL --set global.targetRevision=$ARGOCD_APP_SOURCE_TARGET_REVISION --set global.namespace=$ARGOCD_APP_NAMESPACE --set global.pattern=industrial-edge --set global.valuesDirectoryURL=https://github.com/claudiol/industrial-edge/raw/deployment --post-renderer ./kustomize` failed exit status 1: Error: error while running post render on files: error while running command /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst/kustomize. error output: ++ dirname /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst/kustomize + BASE=/tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst + '[' /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst = /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst ']' + BASE=./ + cat + echo / /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst / /tmp/https:__github.com_claudiol_industrial-edge/charts/datacenter/manuela-tst + ls -al total 44 drwxr-xr-x. 3 default root 166 Oct 6 20:59 . drwxr-xr-x. 7 default root 98 Oct 6 20:28 .. -rw-r--r--. 1 default root 1105 Oct 6 20:28 Chart.yaml -rw-r--r--. 1 default root 22393 Oct 6 20:59 helm.yaml -rw-r--r--. 1 default root 98 Oct 6 20:59 kustomization.yaml -rwxr-xr-x. 1 default root 316 Oct 6 20:28 kustomize -rw-r--r--. 1 default root 348 Oct 6 20:28 system-image-builder-role-binding.yaml drwxr-xr-x. 7 default root 115 Oct 6 20:28 templates -rw-r--r--. 1 default root 585 Oct 6 20:28 values.yaml + kubectl kustomize ./ Error: json: cannot unmarshal object into Go struct field Kustomization.images of type []image.Image : exit status 1 Use --debug flag to render out invalid YAML
```
