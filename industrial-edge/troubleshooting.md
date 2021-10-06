---
layout: default
title: Troubleshooting
grand_parent: Patterns
parent: Industrial Edge
nav_order: 2
---

# Troubleshooting
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Failed Installation

### Install loop does not complete

#### Symptom: `make install` does not complete in a timely fashion (~10 minutes from start).  Status messages keep scrolling.

#### Cause: One of the conditions for installation has not been completed.  See below for details.

#### Resolution: Re-run the failing step outside the loop.  See below for how.

It is safe to exit the loop (via Ctrl-C, for example) and run the operations separately.

The industrial edge pattern runs two post-install operations after creating the main ArgoCD applications: 

- Extracting the secret from the datacenter ArgoCD instance for use in the Pipelines

This depends on the installation of both the cluster-wide GitOps operator, and the installation of an instance in the datacenter namespace.  The logic is controlled [here](https://github.com/hybrid-cloud-patterns/industrial-edge/blob/main/Makefile) (where the parameters are set) and [here](https://github.com/hybrid-cloud-patterns/common/blob/main/Makefile), which does the interactions with the cluster (to extract the secret and create a resource in manuela-ci).

This task runs first, and if it does not complete, the seed pipeline will not start either.  Things to check:

- Check to make sure the operators are installing in your cluster correctly.
- Ensure you have enough capacity in your cluster to run all the needed resources.

You can attempt to run the extraction outside of `make install`.  Ensure that you have logged in to the cluster (via `oc login` or by exporting a suitable KUBECONFIG:

- Run `make argosecret` in the base directory of your industrial-edge repo fork.

*Running the "seed" pipeline to populate the image registries for the manuela-tst-all namespace and the edge/factory
namespaces (manuela-stormshift-messaging, manuela-line-dashboard etc.).*

It is important that the seed pipeline run and complete because the applications will be "degraded" until they can deploy the images, and seed is what populates the images in the local cluster registries and instructs the applications to use them.

The seed pipeline depends on the Pipelines operator to be installed, as well as the `tkn` Task.  The script checks for
both.  (`make install` calls the `sleep-seed` target, which checks for the resources before trying to kick off a seed pipeline run.

- Run `make seed` in the base directory of your industrial edge repo fork.  This kicks off the pipeline without checking for its dependencies.

This target does *not* ensure that the seed pipeline completes.  See below on how to re-run seed if the seed pipeline
fails for any reason.  It is safe to run the seed pipeline multiple times - each time it runs it will update the image targets for each of the images in both test (manuela-tst-all) and production (manuela-stormshift-messaging etc).

### Pipeline Failures

#### Symptom: "User not found" error in first stage of pipeline run
#### Cause: Despite the message, the error is most likely that you don't have a fork of [manuela-dev](https://github.com/hybrid-cloud-patterns/manuela-dev).
#### Resolution: Fork [manuela-dev](https://github.com/hybrid-cloud-patterns/manuela-dev) into your namespace in GitHub and run `make seed`.

#### Symptom: Intermittent failures in Pipeline stages.  Some sample errors:
```
level=error msg="Error while applying layer: ApplyLayer io: read/write on closed pipe stdout: {\"layerSize\":7301}\n stderr: "
error creating build container: Error committing the finished image: error adding layer with blob
```
```
time="2021-09-29T18:48:27Z" level=fatal msg="Error trying to reuse blob sha256:235f9e6f3559c04d5ee09b613dcab06dbc03ceb93b65ce364afe35c03fd53574 at destination: failed to read from destination repository martjack/iot-software-sensor: 500 (Internal Server Error)
```

When this happens, the pipeline may not entirely stop running.  It is safe to stop/cancel the pipeline run, and 
desirable to do so, since multiple pipelines attempting to change the repo at the same time could cause more failures.

#### Resolution: We are investigating long-term causes and fixes for these problems.  In most cases, running `make seed` in
the root of the repo OR re-run the entire failed pipeline segment (e.g. seed-iot-frontend or seed-iot-consumer).

#### Symptom: Error in "push-*" pipeline tasks

#### Cause: Multiple processes or people were trying to make changes to the repo at the same time.  The state of the repo changed in the middle of the process in such a way that the update was not a "fast-forward" in git terms.

#### Resolution: Re-run the failed pipeline segement OR run `make seed` from the root of your fork of the industrial-edge repo.

### ArgoCD not syncing

#### Symptom:  Applications show "not in sync" status in ArgoCD
#### Cause: There is a discrepancy between what the git repo says the application should have, and how that state is realized in ArgoCD.
#### Resolution:

Symptom:
Cause:
Resolution:

Symptom:
Cause:
Resolution:

### Subscriptions not being installed

#### Symptom: Install seems to "freeze" at a specific point.  Expected operators do not install in the cluster.
#### Cause: It is possible an operator was requested to be installed that isn't allowed to be installed on this version of OpenShift.
#### Resolution:

In general, use the project-supplied `global.options.UseCSV` setting of `False`.  This requests the current, best version of the operator available.  If a specific CSV (Cluster Service Version) is requested but unavailable, that operator will not be able to install at all, and when an operator fails to install, that may have a cascading effect on other operators.

## Broken functionality

### Pipelines application not in sync

Symptom:
Cause:
Resolution:
