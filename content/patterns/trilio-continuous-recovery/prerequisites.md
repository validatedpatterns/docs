---
title: Prerequisites
weight: 10
aliases: /trilio-cr/prerequisites/
---

## Prerequisites

### Clusters

| Cluster | Role | Minimum size |
|---------|------|-------------|
| Hub | Primary; runs ACM, HashiCorp Vault, ArgoCD, Trilio | 3 worker nodes, 8 vCPU / 32 GB each |
| DR Spoke | Disaster Recovery target | 3 worker nodes, 8 vCPU / 32 GB each |

Both clusters must:
- Run Red&nbsp;Hat OpenShift 4.18 or later
- Have network access to the shared S3 bucket
- Be reachable by ACM on the hub

### S3 storage

A single S3-compatible bucket accessible from both clusters. Required values:
- Bucket name
- Bucket region (must match the bucket's actual region — always set this explicitly)
- Access key and secret key with read/write permissions on the bucket

### Trilio license

A valid Trilio for Kubernetes license key. This pattern supports Trilio for Kubernetes version 5.3.0 and later. Obtain a license from [trilio.io](https://trilio.io) or your Trilio representative.

### Tooling (hub workstation)

- `oc` CLI logged in to the hub cluster with cluster-admin
- `ansible-navigator` (for manual DR operations)
- `make`
- `git`
- `python3`
- `rhvp.cluster_utils` Ansible collection (for `make install`):

  ```bash
  ansible-galaxy collection install community.okd kubernetes.core \
    https://github.com/validatedpatterns/rhvp.cluster_utils/releases/download/v0.0.6/rhvp-cluster_utils-0.0.6.tar.gz
  ```
