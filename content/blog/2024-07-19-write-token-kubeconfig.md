---
 date: 2024-07-19
 title: Writing a Kubeconfig File if You Need One
 summary: Validated Patterns now supports creating a kubeconfig file for token-based authentication
 author: Martin Jackson
 blog_tags:
 - patterns
 keywords:
 - kubeconfig
 - kubernetes authentication
 - token authentication
 - openshift
 - validated patterns
 - cluster access
---

# Writing a Kubeconfig File if You Need One

## Overview

One of the questions that we occasionally get is how Patterns can work without full admin privileges. This means
authenticating to a cluster without the initial kubeadmin kubeconfig file. This file is intended to be used to perform
initial setup tasks as the 'kubeadmin' or 'kube:admin' user, and then for that user to be removed once the cluster
has its permanent authentication mechanism set up (such as Oauth2 to GitHub, among many other possibilities).

But what if a user did not have the Kubeconfig file for some reason? We did not have another mechanism for them to use
the Pattern framework. This feature is intended to fill that gap, and to work towards enabling the use of Patterns
when the initial Kubeconfig is not available for some reason.

Note that in standard OpenShift installation scenarios, even for our managed offerings like ARO (managed OpenShift on
Azure) and ROSA (managed OpenShift on AWS), users are given the standard starter Kubeconfig and kubeadmin password
files, so if you have that Kubeconfig file, by all means use it to install Validated Patterns.

If, however, you want to install a Validated Pattern, and you do not have the Kubeconfig file, but you do have a
username/password OR you already have a valid token for that username, this feature can create a Kubeconfig file for you at `~/.kube/config` (the default location for such files).

## Why

This feature grew out of an interest in creating a generic mechanism to enable use of all of the Pattern tooling, and
the best way to do that (at the time of writing) is to create a kubeconfig file that contains the token and cluster
info. The Kubernetes Ansible module allows for logging in to a OpenShift cluster with username/password, but then does
not store the resulting token. The best way to use this information in Ansible without changing all of the Ansible code
or adding extra complexities (such as using [module_defaults](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_module_defaults.html)) is to craft a Kubeconfig file with the token, cluster and context information. This allows the token to be used by other tools like `oc`/`kubectl`. The Ansible Kubernetes module will also authenticate using
a valid Kubeconfig file in `~/.kube/config`, so this feature will create that file if it does not already exist.

## How to get started

1. Make sure you do not currently have a `~/.kube/config` file. The process will look for it and exit if one already exists.
2. Set and export the following environment variables in your shell:

* `K8S_AUTH_HOST`: Cluster API address. Mandatory.
* `K8S_AUTH_USERNAME`: Username. Optional; defaults to `kubeadmin`.
* `K8S_AUTH_PASSWORD`: Password to use to obtain token. Mandatory if token is not specified.
* `K8S_AUTH_TOKEN`: An existing, valid authentication token for the cluster. If specified, the Kubeconfig file will be written with it, after validation is done that the config is valid.
* `K8S_AUTH_VERIFY_SSL`: Whether to validate SSL when communicating with the cluster. Optional; defaults to `false`.
* `K8S_AUTH_SSL_CA_CERT`: A filename containing the full CA chain for the cluster. Optional.

3. Run `./pattern.sh make token-kubeconfig`. This will generate `~/.kube/config` if it does not already exist. This file can be used by the rest of the pattern tooling.

Optionally, if you do not want to write ~/.kube/config, you can invoke the script directly with an argument to specify which file to write the kubeconfig out to. For example: `./pattern.sh common/scrtips/write-token-kubeconfig.sh ~/testfile` will write the kubeconfig to ~/testfile. It will still not overwrite an existing file.
