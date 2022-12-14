---
menu:
  learn:
    parent: Infrastructure
title: OpenShift General Sizing
weight: 31
aliases: /infrastructure/ocp-cluster-general-sizing/
---

# OpenShift General Sizing

## Recommended node host practices

The OpenShift Container Platform node configuration file contains important options. For example, two parameters control the maximum number of pods that can be scheduled to a node:  `podsPerCore`  and  `maxPods`.

When both options are in use, the lower of the two values limits the number of pods on a node. Exceeding these values can result in:

- Increased CPU utilization.
- Slow pod scheduling.
- Potential out-of-memory scenarios, depending on the amount of memory in the node.
- Exhausting the pool of IP addresses.
- Resource overcommitting, leading to poor user application performance.

In Kubernetes, a pod that is holding a single container actually uses two containers. The second container is used to set up networking prior to the actual container starting. Therefore, a system running 10 pods will actually have 20 containers running.

**podsPerCore** sets the number of pods the node can run based on the number of processor cores on the node. For example, if  **podsPerCore**  is set to  `10`  on a node with 4 processor cores, the maximum number of pods allowed on the node will be  `40`.

```yaml
kubeletConfig:
  podsPerCore: 10
```

Setting  **podsPerCore**  to  `0`  disables this limit. The default is  `0`.  **podsPerCore**  cannot exceed  `maxPods`.

**maxPods**  sets the number of pods the node can run to a fixed value, regardless of the properties of the node.

```yaml
 kubeletConfig:
    maxPods: 250
```

For more information about sizing and Red Hat standard host practices see the [Official OpenShift Documentation Page](https://docs.openshift.com/container-platform/4.8/scalability_and_performance/recommended-host-practices.html) for recommended host practices.

## Control plane node sizing

The control plane node resource requirements depend on the number of nodes in the cluster. The following control plane node size recommendations are based on the results of control plane density focused testing. The control plane tests create the following objects across the cluster in each of the namespaces depending on the node counts:

- 12 image streams
- 3 build configurations
- 6 builds
- 1 deployment with 2 pod replicas mounting two secrets each
- 2 deployments with 1 pod replica mounting two secrets
- 3 services pointing to the previous deployments
- 3 routes pointing to the previous deployments
- 10 secrets, 2 of which are mounted by the previous deployments
- 10 config maps, 2 of which are mounted by the previous deployments

| Number of worker nodes |  Cluster load (namespaces) |  CPU cores |  Memory (GB)
| :-------- | :---------- | :------------ | :------------- |
| 25  | 500  | 4  | 16
| 100 | 1000 | 8  | 32
| 250 | 4000 | 16 | 96

On a cluster with three masters or control plane nodes, the CPU and memory usage will spike up when one of the nodes is stopped, rebooted or fails because the remaining two nodes must handle the load in order to be highly available. This is also expected during upgrades because the masters are cordoned, drained, and rebooted serially to apply the operating system updates, as well as the control plane Operators update. To avoid cascading failures on large and dense clusters, keep the overall resource usage on the master nodes to at most half of all available capacity to handle the resource usage spikes. Increase the CPU and memory on the master nodes accordingly.

The node sizing varies depending on the number of nodes and object counts in the cluster. It also depends on whether the objects are actively being created on the cluster. During object creation, the control plane is more active in terms of resource usage compared to when the objects are in the  `running`  phase.

If you used an installer-provisioned infrastructure installation method, you cannot modify the control plane node size in a running OpenShift Container Platform 4.5 cluster. Instead, you must estimate your total node count and use the suggested control plane node size during installation.

The recommendations are based on the data points captured on OpenShift Container Platform clusters with OpenShiftSDN as the network plug-in.

In OpenShift Container Platform 4.5, half of a CPU core (500 millicore) is now reserved by the system by default compared to OpenShift Container Platform 3.11 and previous versions. The sizes are determined taking that into consideration.

For more information about sizing and Red Hat standard host practices see the [Official OpenShift Documentation Page](https://docs.openshift.com/container-platform/4.8/scalability_and_performance/recommended-host-practices.html) for recommended host practices.

## Recommended etcd practices

For large and dense clusters, etcd can suffer from poor performance if the keyspace grows excessively large and exceeds the space quota. Periodic maintenance of etcd, including defragmentation, must be performed to free up space in the data store. It is highly recommended that you monitor Prometheus for etcd metrics and defragment it when required before etcd raises a cluster-wide alarm that puts the cluster into a maintenance mode, which only accepts key reads and deletes. Some of the key metrics to monitor are  `etcd_server_quota_backend_bytes`  which is the current quota limit,  `etcd_mvcc_db_total_size_in_use_in_bytes`  which indicates the actual database usage after a history compaction, and  `etcd_debugging_mvcc_db_total_size_in_bytes`  which shows the database size including free space waiting for defragmentation. Instructions on defragging etcd can be found in the  `Defragmenting etcd data`  section.

Etcd writes data to disk, so its performance strongly depends on disk performance. Etcd persists proposals on disk. Slow disks and disk activity from other processes might cause long fsync latencies, causing etcd to miss heartbeats, inability to commit new proposals to the disk on time, which can cause request timeouts and temporary leader loss. It is highly recommended to run etcd on machines backed by SSD/NVMe disks with low latency and high throughput.

Some of the key metrics to monitor on a deployed OpenShift Container Platform cluster are p99 of etcd disk write ahead log duration and the number of etcd leader changes. Use Prometheus to track these metrics.  `etcd_disk_wal_fsync_duration_seconds_bucket`  reports the etcd disk fsync duration,  `etcd_server_leader_changes_seen_total`  reports the leader changes. To rule out a slow disk and confirm that the disk is reasonably fast, 99th percentile of the  `etcd_disk_wal_fsync_duration_seconds_bucket`  should be less than 10ms.

For more information about sizing and Red Hat standard host practices see the [Official OpenShift Documentation Page](https://docs.openshift.com/container-platform/4.8/scalability_and_performance/recommended-host-practices.html) for recommended host practices.
