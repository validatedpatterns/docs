---
title: Getting Started
weight: 10
aliases: /hybrid-mesh-platform/getting-started/
---

# Getting Started

Follow these steps to bootstrap the Hybrid Mesh Platform hub-spoke GitOps environment from the [platform-hub-spoke-config](https://github.com/maximilianopizarro/platform-hub-spoke-config) repository.

## You'll have when finished

After a successful hub deploy and spoke registration, expect:

| Component | Verification |
| --- | --- |
| ACM | `east` and `west` in `ManagedCluster` **Available** |
| Argo CD | Root Application **Synced**; ApplicationSet pushing `east/` and `west/` |
| Industrial Edge | Sensors, MQTT, Kafka, `line-dashboard` on each spoke |
| Skupper | Hub `sitesInNetwork: 3`; listeners **Ready** in `service-interconnect` |
| Grafana | Hub dashboards with `prometheus-east` / `prometheus-west` datasources |
| Developer Hub | Industrial Edge catalog + software templates under **Create** |
| Gitea | Route `gitea-gitea.<domain>`; orgs `ws-platformadmin`, `app-of-apps` |
| Quay | Route `quay-registry.<domain>` (optional image catalog) |

Then continue with [Scaffolding](scaffolding) to deploy a new edge instance on east or west.

## Prerequisites

- Red Hat OpenShift Container Platform **4.20** (reference version; 4.14+ supported per cluster)
- **Three clusters:** one hub, one east-region spoke, one west-region spoke (ACM labels drive placement)
- **Helm 3** on your workstation or CI runner (`helm version`)
- **Git** client and hosting account (GitHub in examples)
- **`oc` CLI** logged into the hub as cluster-admin for ACM import (recommended)
- Network access to GitHub (or your fork) and container registries from all clusters

### Network requirements (connected environments)

1. Access to public container registries (or mirrored equivalents)
2. Access to your Git repository (fork of `platform-hub-spoke-config`)

## Repository layout

```
.              → hub cluster (path: .)
east/          → east spoke cluster (path: east)
west/          → west spoke cluster (path: west)
components/    → shared component charts referenced by all clusters
```

Each cluster path is a self-contained Helm chart with its own `Chart.yaml`, `values.yaml`, and `templates/`.

## Step 1: Fork the repository

Fork [platform-hub-spoke-config](https://github.com/maximilianopizarro/platform-hub-spoke-config) so you can customize domains, secrets references, and Git URLs without coupling to upstream history.

Update `gitops.repoUrl` in:

- `values.yaml` (hub)
- `east/values.yaml`
- `west/values.yaml`

## Step 2: Configure cluster domains

Set DNS names for each cluster before install.

**Hub** (`values.yaml`):

- `deployer.domain` — hub apps domain (Grafana, Developer Hub, gateway)
- `clusters.hub.domain`, `clusters.east.domain`, `clusters.west.domain`

**East** (`east/values.yaml`):

- `deployer.domain` — east spoke apps domain
- `clusters.hub.domain` — hub domain for cross-cluster links

**West** (`west/values.yaml`):

- `deployer.domain` — west spoke apps domain
- `clusters.hub.domain` — hub domain for cross-cluster links

Validate Helm rendering before apply:

```bash
helm template test-hub . -f values.yaml --set deployer.domain=apps.hub.example.com
helm template test-east east/ -f east/values.yaml
helm template test-west west/ -f west/values.yaml
```

## Step 3: Install on the hub

The hub uses the repository root path (`.`):

```bash
helm install hybrid-mesh-platform . -f values.yaml --set deployer.domain=apps.hub.example.com
```

For production GitOps, create an Argo CD `Application` pointing at your fork on branch `main` (matching `gitops.revision`). Supply values via Helm parameters or a values ConfigMap pattern your organization prefers.

## Step 4: Import managed clusters in ACM

From the hub, import east and west using ACM **Import cluster** or automated klusterlet flows.

Apply labels used by placement rules:

```bash
# Example — adjust cluster names to match your environment
oc label managedcluster east region=east
oc label managedcluster west region=west
oc label managedcluster east cluster.open-cluster-management.io/clusterset=global
oc label managedcluster west cluster.open-cluster-management.io/clusterset=global
```

Ensure spoke credentials are stored per ACM requirements.

## Step 5: Register spokes as Argo CD cluster secrets

The ApplicationSet deploys spoke charts remotely. Register each spoke on the hub Argo CD instance:

```bash
helm upgrade field-content . \
  --set clusters.east.token=sha256~... \
  --set clusters.west.token=sha256~...
```

Or create secrets with label `argocd.argoproj.io/secret-type: cluster`.

Spoke cluster names in ACM and Argo CD must match folder names: **`east`** and **`west`**.

## Step 6: Verify ApplicationSet generates spoke applications

Confirm the ACM → GitOps chain:

1. `Placement` `hub-spoke-placement` selects `region=east` and `region=west`
2. `PlacementDecision` lists those clusters in `openshift-gitops`
3. `GitOpsCluster` `hub-spoke-gitops` registers clusters in Argo CD
4. ApplicationSet creates `east-spoke-components` and `west-spoke-components`
5. Each spoke Argo CD syncs child Applications (namespaces, operators, Industrial Edge, and others)

**Hub:**

```bash
oc get applications -n openshift-gitops
# Expect: east-spoke-components, west-spoke-components (Synced / Healthy)
```

**Each spoke:**

```bash
oc get applications -n openshift-gitops
# Expect: east-namespaces, east-operators, east-industrial-edge-tst, etc.
```

**PlacementDecision:**

```bash
oc get placementdecisions.cluster.open-cluster-management.io -n openshift-gitops \
  -l cluster.open-cluster-management.io/placement=hub-spoke-placement -o yaml
```

Healthy sync waves progress: **namespaces → operators → platform → observability → Industrial Edge workloads**.

## Deploy with ACM and GitOps

### ManagedClusterSet

Groups clusters for RBAC and placement. Downstream objects reference set membership — not hard-coded cluster names in Git.

### Placement

Selects clusters from a ManagedClusterSet using label selectors (for example `region=east`). ACM recomputes decisions as clusters join, leave, or change labels.

### PlacementDecision

Publishes the concrete cluster names that satisfied a Placement at a given time. The ApplicationSet `clusterDecisionResource` generator watches these decisions.

### GitOpsCluster

Associates Argo CD (`openshift-gitops`) with clusters chosen by placement — bridging ACM fleet selection and Argo CD cluster secrets.

### ApplicationSet with clusterDecisionResource

For each cluster in the PlacementDecision, the ApplicationSet creates an Application that:

- Uses repository path `east/` or `west/` (from `{{name}}`)
- Deploys to remote cluster `{{name}}` via hub-stored cluster credentials

Adding a spoke with correct labels and a new folder (for example `south/`) automatically generates a new Application when the Placement matches.

### Troubleshooting: no spoke Applications

| Check | Command / expectation |
| --- | --- |
| Managed clusters | `oc get managedcluster` — **Available** |
| Cluster names | Must be `east` and `west` (match repo folders) |
| Placement | `hub-spoke-placement` includes both regions |
| PlacementDecision | Decisions list `east`, `west` |
| GitOpsCluster | `hub-spoke-gitops` reconciled; clusters visible in Argo CD UI |
| RBAC | Role `applicationset-placementdecisions` for ApplicationSet controller |
| Spoke charts | `east/` and `west/` valid Helm charts with `Chart.yaml` |

## Step 7: Kiali multi-cluster (hub)

Hub Kiali shows mesh topology from east and west **without** Istio multi-cluster trust federation. Each spoke keeps its own control plane; hub Kiali uses remote secrets and links to spoke Kiali UIs.

### Automated token sync (default)

With `multiCluster.automateTokens: true` (hub) and `exportTokenForHub: true` (spokes):

1. Spoke PostSync Job exports `kiali-hub-export` ConfigMap with token
2. Hub PostSync Job reads ACM `ManagedCluster` apiUrl/caBundle and creates `kiali-multi-cluster-secret`
3. CronJobs renew tokens every 6 hours

### Manual tokens (optional)

```bash
oc create token kiali-service-account -n openshift-cluster-observability-operator --duration=8760h
helm upgrade field-content . \
  --set multiCluster.automateTokens=false \
  --set clusters.east.kialiToken=sha256~... \
  --set clusters.east.kialiCaData=LS0tLS1... \
  --reuse-values
```

With `auth.strategy: openshift`, users **Log in** per remote cluster the first time they open Kiali for that cluster.

## Step 8: Developer Hub (Keycloak OIDC)

Developer Hub uses cluster Keycloak (`sso.<domain>`) realm `backstage` — not GitHub OAuth.

```bash
SECRET=$(openssl rand -base64 24)
helm upgrade field-content . \
  --set keycloakOidcClientSecret="$SECRET" \
  --reuse-values
```

Or patch after deploy:

```bash
oc create secret generic developer-hub-oidc-auth \
  --from-literal=OIDC_CLIENT_SECRET="$SECRET" \
  -n developer-hub --dry-run=client -o yaml | oc apply -f -
```

Log in at `https://developer-hub.<domain>` (for example `platformadmin` / workshop password from your values).

## Step 9: Continue AI (DevSpaces + Kaoto)

Do not commit MaaS API keys to Git. Create the DevSpaces secret after deploy:

```bash
oc create secret generic continue-ai-config -n devspaces \
  --from-literal=CONTINUE_API_KEY='<your-maas-api-key>' \
  --from-literal=CONTINUE_API_BASE='https://litellm-prod.apps.maas.redhatworkshops.io/v1' \
  --from-literal=CONTINUE_MODEL='deepseek-r1-distill-qwen-14b' \
  --dry-run=client -o yaml | oc apply -f -
```

Industrial Edge catalog loads from an in-cluster ConfigMap. Software templates ship as static assets in the pattern repository under `docs/assets/backstage/software-templates/`.

### Developer Hub multi-cluster Topology

Spoke workloads appear in **Topology** / **Kubernetes** only when:

1. `developer-hub-spoke-tokens` Secret exists (token sync Job completed)
2. Catalog entities include `backstage.io/kubernetes-cluster: east` or `west`

```bash
oc get secret developer-hub-spoke-tokens -n developer-hub
oc get job -n developer-hub -l job-name=developer-hub-spoke-token-sync-hook
```

### Optional: Quay credentials (hub)

Never commit registry passwords to Git. Generate dockerconfig and pass via Helm at upgrade time if you enable Quay push from pipelines.

## References

- [ACM documentation](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.16/html/about/welcome-to-red-hat-advanced-cluster-management-for-kubernetes)
- [Multicloud GitOps Validated Pattern](/patterns/multicloud-gitops)
- [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)

**Next →** [Scaffolding](scaffolding) to deploy Industrial Edge instances from Developer Hub · [Architecture](architecture) for diagrams · [Observability](observability) once metrics are flowing.
