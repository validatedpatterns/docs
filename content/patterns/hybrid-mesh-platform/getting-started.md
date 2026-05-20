---
title: Getting Started
weight: 10
aliases: /hybrid-mesh-platform/getting-started/
---

# Getting Started

Follow these steps to bootstrap the Hybrid Mesh Platform hub-spoke GitOps platform from the [platform-hub-spoke-config](https://github.com/maximilianopizarro/platform-hub-spoke-config) repository.

## You'll have when finished

After a successful hub deploy and spoke registration, expect:

- ACM — `east` and `west` in `ManagedCluster` Ready state
- Argo CD — root Application synced; ApplicationSet pushing `east/` and `west/` charts
- Industrial Edge — sensors, MQTT, Kafka, line-dashboard on each spoke
- Skupper — hub `sitesInNetwork: 3`; listeners Ready in `service-interconnect`
- Grafana — hub dashboards with east/west Prometheus datasources
- Developer Hub — Industrial Edge catalog + software templates under Create
- Gitea — route `gitea-gitea.<domain>`; orgs `ws-platformadmin`, `app-of-apps`
- Quay — route `quay-registry.<domain>` (optional image catalog)

Then continue with [Scaffolding](scaffolding) to deploy a new edge instance on east or west.

## Prerequisites

- Red Hat OpenShift Container Platform **4.20** (or 4.14 or newer) on each cluster (hub + two spokes is the reference layout).
- Three clusters: one hub, one east-region spoke, one west-region spoke (labels determine placement).
- Helm 3 installed locally or in a CI runner (`helm version`).
- Git client and a Git hosting account (GitHub is used in examples).
- Optional: `oc` CLI logged into the hub as a cluster-admin for ACM import flows.

## Repository layout

```
.              → hub cluster (path: .)
east/          → east spoke cluster (path: east)
west/          → west spoke cluster (path: west)
components/    → shared component charts referenced by all clusters
```

Each cluster path is a self-contained Helm chart with its own `Chart.yaml`, `values.yaml`, and `templates/`.

## Step 1: Fork the repository

Fork [platform-hub-spoke-config](https://github.com/maximilianopizarro/platform-hub-spoke-config) so you can customize domains, secrets references, and configuration without coupling to upstream history.

Update `gitops.repoUrl` in `values.yaml`, `east/values.yaml`, and `west/values.yaml` to your fork URL.

## Step 2: Configure cluster domains

Set DNS names for each cluster:

**Hub** (`values.yaml`):

- `deployer.domain` — hub apps domain
- `clusters.hub.domain`, `clusters.east.domain`, `clusters.west.domain`

**East** (`east/values.yaml`):

- `deployer.domain` — east spoke apps domain
- `clusters.hub.domain` — hub domain for cross-cluster links

**West** (`west/values.yaml`):

- `deployer.domain` — west spoke apps domain
- `clusters.hub.domain` — hub domain for cross-cluster links

Validate rendering:

```bash
helm template test-hub . -f values.yaml --set deployer.domain=apps.hub.example.com
helm template test-east east/
helm template test-west west/
```

## Step 3: Install on the hub

The hub uses the repository root path (`.`):

```bash
helm install hybrid-mesh-platform . -f values.yaml --set deployer.domain=apps.hub.example.com
```

Create an Argo CD `Application` that points at this chart on branch `main`, matching `gitops.revision`, and supply value files via Helm parameters or a values ConfigMap pattern your org prefers.

## Step 4: Import managed clusters in ACM

From the hub, import east and west clusters using ACM's Import cluster flow or klusterlet automation.

Apply labels used by placement rules:

- `cluster.open-cluster-management.io/clusterset=global`
- Region labels: `region=east` and `region=west`

Ensure spoke kubeconfigs or credentials are stored per ACM requirements.

## Step 5: Register spokes as Argo CD cluster secrets

The ApplicationSet deploys spoke charts remotely. Register each spoke cluster:

```bash
helm upgrade field-content . \
  --set clusters.east.token=sha256~... \
  --set clusters.west.token=sha256~...
```

Or create cluster secrets directly with `oc apply` using label `argocd.argoproj.io/secret-type: cluster`.

## Step 6: Verify ApplicationSet generates spoke applications

On the hub, confirm the remote GitOps flow:

1. `Placement` selects labeled spokes (`region=east`, `region=west`).
2. `GitOpsCluster` binds clusters to Argo CD instances.
3. ApplicationSet pushes each spoke's chart (`east/`, `west/`) to the remote cluster.
4. Each spoke's Argo CD syncs child Applications locally.

Check from the hub:

```bash
oc get applications -n openshift-gitops
# Should show east-spoke-components, west-spoke-components
```

Check from each spoke:

```bash
oc get applications -n openshift-gitops
# Should show east-namespaces, east-operators, east-industrial-edge-tst, etc.
```

Healthy sync waves progress: namespaces → operators → platform → observability → Industrial Edge workloads.

## Deploy with ACM and GitOps

This section explains how Red Hat ACM primitives cooperate with OpenShift GitOps (Argo CD) to drive hub-spoke deployment from Git.

### ManagedClusterSet

A ManagedClusterSet groups clusters for RBAC and placement. Cluster membership in a set is what downstream objects reference—not individual cluster names embedded in static YAML.

### Placement

Placement selects clusters from a ManagedClusterSet using label selectors. Example: select `region=east` for east-only workloads.

### PlacementDecision

ACM publishes PlacementDecision objects listing concrete cluster names that satisfied a Placement. GitOps integrations watch these decisions to know where to apply manifests without hardcoding kube-apiserver URLs in Git.

### GitOpsCluster

A GitOpsCluster resource associates Argo CD with clusters chosen by placement. Together, `Placement` → `PlacementDecision` → `GitOpsCluster` avoids brittle per-cluster Application YAML checked into Git.

### ApplicationSet with clusterDecisionResource

The ApplicationSet uses a `clusterDecisionResource` generator that reads ACM PlacementDecision objects. For each cluster selected by the Placement, the ApplicationSet creates an Application that deploys the cluster's dedicated Helm chart folder to the remote spoke.

- `{{name}}` — cluster name (e.g. `east`, `west`), used as both the repository `path` and `destination.name`
- Adding a new spoke with correct labels and a matching folder automatically generates a new Application

### Remote deployment model

Each cluster has its own Argo CD instance. The hub's ApplicationSet pushes the per-cluster chart to each spoke's `openshift-gitops` namespace. The spoke's Argo CD then manages the child Applications locally.

Industrial Edge components exist **only** in spoke charts. The hub chart never includes them.

### Troubleshooting: no spoke Applications

| Check | Action |
| --- | --- |
| Placement | `hub-spoke-placement` selects spokes (`region` in `east` \| `west`) |
| PlacementDecision | `oc get placementdecisions.cluster.open-cluster-management.io -n openshift-gitops -l cluster.open-cluster-management.io/placement=hub-spoke-placement` |
| Managed clusters | `oc get managedcluster` — Imported / Available |
| Cluster names | Spokes must be named `east` and `west` matching folder names |
| Argo CD secrets | Each spoke registered as cluster secret on hub |
| GitOpsCluster | `hub-spoke-gitops` reconciled |
| RBAC | `applicationset-placementdecisions` role for ApplicationSet controller |
| Spoke folders | `east/` and `west/` exist with valid Helm charts |

## Step 7: Kiali multi-cluster (hub)

Hub Kiali can show mesh topology from east and west without Istio trust federation.

With `multiCluster.automateTokens: true` (hub) and `exportTokenForHub: true` (spokes), Argo CD PostSync hook Jobs sync tokens automatically. CronJobs renew tokens every 6 hours.

To disable automation:

```bash
oc create token kiali-service-account -n openshift-cluster-observability-operator --duration=8760h
helm upgrade field-content . \
  --set multiCluster.automateTokens=false \
  --set clusters.east.kialiToken=sha256~... \
  --reuse-values
```

## Step 8: Developer Hub (Keycloak OIDC)

Developer Hub uses the cluster Keycloak instance with realm `backstage`.

```bash
SECRET=$(openssl rand -base64 24)
helm upgrade field-content . \
  --set keycloakOidcClientSecret="$SECRET" \
  --reuse-values
```

Log in at `https://developer-hub.<domain>` with your catalog users.

## Step 9: Continue AI (DevSpaces + Kaoto templates)

After deploy, create the DevSpaces secret (do not commit API keys to Git):

```bash
oc create secret generic continue-ai-config -n devspaces \
  --from-literal=CONTINUE_API_KEY='<your-maas-api-key>' \
  --from-literal=CONTINUE_API_BASE='https://litellm-prod.apps.maas.redhatworkshops.io/v1' \
  --from-literal=CONTINUE_MODEL='deepseek-r1-distill-qwen-14b' \
  --dry-run=client -o yaml | oc apply -f -
```

### Developer Hub multi-cluster Topology

Spoke workloads appear in Topology / Kubernetes only when:

1. `ManagedServiceAccount` + token sync Job completed (`developer-hub-spoke-tokens` Secret exists)
2. Catalog entities have `backstage.io/kubernetes-cluster: east` or `west`

```bash
oc get secret developer-hub-spoke-tokens -n developer-hub
oc get job -n developer-hub -l job-name=developer-hub-spoke-token-sync-hook
```

## References

- [ACM Architecture](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.16/html/about/welcome-to-red-hat-advanced-cluster-management-for-kubernetes)
- [Multicloud GitOps Validated Pattern](/patterns/multicloud-gitops)
- [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)
