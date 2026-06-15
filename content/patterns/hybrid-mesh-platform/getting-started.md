---
title: Getting Started
weight: 10
aliases: /hybrid-mesh-platform/getting-started/
---

# Getting Started

Follow these steps to bootstrap the Hybrid Mesh Platform hub-spoke GitOps environment from the [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) Validated Patterns repository (fork of [multicloud-gitops](https://github.com/validatedpatterns/multicloud-gitops)).

## You'll have when finished

After a successful hub deploy and spoke registration, expect:

| Component | Verification |
| --- | --- |
| ACM | `east` and `west` in `ManagedCluster` **Available** |
| Argo CD | Hub `clustergroup` **Synced**; east/west spokes pull their clusterGroup from Git via ACM |
| Industrial Edge | Sensors, MQTT, Kafka, `line-dashboard` on each spoke |
| Skupper | Hub `sitesInNetwork: 3`; listeners **Ready** in `service-interconnect` |
| Grafana | Hub dashboards with `prometheus-east` / `prometheus-west` datasources |
| Developer Hub | Industrial Edge catalog + software templates under **Create** |
| Gitea | Route `gitea-gitea.<domain>`; orgs `ws-platformadmin`, `app-of-apps` |
| Quay | Route `quay-registry.<domain>` (optional image catalog) |

Then continue with [Scaffolding](scaffolding) to deploy a new edge instance on east or west.

## Platform operators (reference)

The hub chart deploys **ACM**, **OpenShift GitOps**, **ACS**, Service Mesh, Skupper, and related operators before application workloads.

[![OpenShift GitOps — Argo CD Applications on the hub](/images/hybrid-mesh-platform/product-argocd-openshift-gitops.png)](/images/hybrid-mesh-platform/product-argocd-openshift-gitops.png)

### Advanced Cluster Management (ACM)

ACM must show **`east`** and **`west`** as **Available** managed clusters before the ApplicationSet can push spoke charts.

[![ACM multicluster fleet management](/images/hybrid-mesh-platform/workshop-acm-multicluster.png)](/images/hybrid-mesh-platform/workshop-acm-multicluster.png)

_ACM fleet overview: ManagedCluster registration, placement rules, and GitOpsCluster binding for hub-spoke delivery._

[![ACM fleet view — east and west registered on the hub](/images/hybrid-mesh-platform/ACM.png)](/images/hybrid-mesh-platform/ACM.png)

_OpenShift Console — ACM All Clusters view showing east and west as Available managed clusters._

Verify:

```bash
oc get managedcluster
oc get multiclusterhub -n open-cluster-management
```

Spoke names must match repository folders (`east`, `west`). Placement labels drive ApplicationSet targeting — see [Step 4](#step-4-import-managed-clusters-in-acm) and [Deploy with ACM and GitOps](#deploy-with-acm-and-gitops).

### Advanced Cluster Security (ACS)

ACS Central runs on the hub; **SecuredCluster** agents install on hub and both spokes. All three clusters appear in the Central UI when init bundles are applied.

[![ACS Central — hub, east, and west clusters](/images/hybrid-mesh-platform/ACS.png)](/images/hybrid-mesh-platform/ACS.png)

_ACS Central showing all three clusters registered. SecuredCluster agents report compliance and runtime events._

[![ACS Central — policies and vulnerability views](/images/hybrid-mesh-platform/ACS-2.png)](/images/hybrid-mesh-platform/ACS-2.png)

_ACS vulnerability management and policy enforcement across Industrial Edge container images._

#### Generating SecuredCluster init bundles

Generate one init bundle per cluster from Central (do not commit secrets to Git):

```bash
roxctl -e central.stackrox:443 --password "$ROX_ADMIN_PASSWORD" --insecure-skip-tls-verify \
  central init-bundles generate <cluster-name> --output-secrets - | oc apply -n stackrox -f -
```

Use cluster names **`hub`**, **`east`**, and **`west`**. Namespace **`stackrox`** must stay **off** Service Mesh ambient — see [Architecture — ACS](architecture#advanced-cluster-security-acs).

## Prerequisites

- Red Hat OpenShift Container Platform **4.20** (reference version; 4.14+ supported per cluster)
- **Three clusters:** one hub, one east-region spoke, one west-region spoke (ACM labels drive placement)
- **Helm 3** on your workstation or CI runner (`helm version`)
- **Git** client and hosting account (GitHub in examples)
- **`oc` CLI** logged into the hub as cluster-admin for ACM import (recommended)
- Network access to GitHub (or your fork) and container registries from all clusters

### Network requirements (connected environments)

1. Access to public container registries (or mirrored equivalents)
2. Access to your Git repository (fork of `hybrid-mesh-platform`)

### Cluster sizing (AWS — OpenShift 4.20)

Tested on **demo.redhat.com** with the following provisioning parameters:

| Cluster | Workers | vCPU/worker | Memory/worker | Total capacity |
| --- | --- | --- | --- | --- |
| **Hub** | 3 | 8 | 32 GiB | 24 vCPU / 96 GiB |
| **East spoke** | 3 | 4 | 16 GiB | 12 vCPU / 48 GiB |
| **West spoke** | 3 | 4 | 16 GiB | 12 vCPU / 48 GiB |

Hub estimated workload: ~12.5 CPU / ~29 GiB (ACM, ACS Central, Developer Hub, data lake Kafka 3-replica, Service Mesh, OpenShift AI, hub gateway).

Spoke estimated workload: ~5.5 CPU / ~11 GiB (Industrial Edge, factory Kafka, ACS SecuredCluster, Service Mesh ambient).

For constrained environments, use `values-lite.yaml` on the hub to disable heavy components (OpenShift AI, ACS, Grafana dashboards, hub gateway).

See [Cluster sizing](cluster-sizing) for metadata-driven minimum and recommended sizes across cloud providers.

## Repository layout

```
charts/all/           → component Helm charts (hub and spoke apps)
values-global.yaml    → pattern name and shared Git URL
values-hub.yaml       → hub clusterGroup (namespaces, subscriptions, applications, managedClusterGroups)
values-east.yaml      → east spoke clusterGroup
values-west.yaml      → west spoke clusterGroup
values-secret.yaml    → secrets (from values-secret.yaml.template; Vault + ESO)
pattern.sh            → Validated Patterns install wrapper
```

Spokes **pull** their `clusterGroup` from Git via ACM labels (`clusterGroup=east` / `clusterGroup=west`) — no hub-push ApplicationSet to spoke Argo CD.

## Step 1: Fork the repository

Fork [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) so you can customize domains, secrets, and Git URLs.

Update `main.gitops.repoURL` in `values-global.yaml` and cluster domains in `overrides/values-aws-{hub,east,west}.yaml` (or your cloud-specific overrides).

## Step 2: Configure secrets and cluster domains

Copy and edit secrets:

```bash
cp values-secret.yaml.template values-secret.yaml
```

Set hub and spoke cluster domains in override files before install. See [MIGRATION.md](https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/MIGRATION.md) for the mapping from legacy RHDP-injected secrets.

## Step 3: Install with Validated Patterns

From the hub cluster (logged in with `oc`):

```bash
./pattern.sh install
```

The Pattern operator (or utility container) deploys the root `clustergroup` Application on the hub. ACM `managedClusterGroups` in `values-hub.yaml` register east and west spokes once they join the fleet.

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
- [RHDP install playbook and extended docs](https://maximilianopizarro.github.io/hybrid-mesh-platform/validatedpatterns-docs/)
- [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)

**Next →** [Scaffolding](scaffolding) to deploy Industrial Edge instances from Developer Hub · [Architecture](architecture) for diagrams · [Observability](observability) once metrics are flowing.
