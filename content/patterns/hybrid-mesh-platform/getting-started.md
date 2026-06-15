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

### OpenShift clusters

| Requirement | Value |
| --- | --- |
| **OpenShift version** | 4.17+ (tested on 4.20 on AWS) |
| **Topology** | **3 clusters** — one hub, one east spoke, one west spoke (single-cluster deployment is not supported by default) |
| **Storage class** | Dynamic provisioner required on all clusters (AWS gp3-csi or equivalent). Kafka, Gitea, Quay, and Vault all require `PersistentVolumeClaim`. |
| **Network** | All clusters must reach your Git fork (GitHub by default) and public container registries, or mirrored equivalents. |

### Hub cluster — additional requirements

| Operator / feature | Requirement |
| --- | --- |
| **OpenShift AI (RHOAI)** | Required for MaaS / vLLM inference. Needs Node Feature Discovery and GPU operator **only** if you enable GPU-accelerated models. CPU-based inference (Qwen3 / Granite on CPU) works without GPU. |
| **GPU (optional)** | NVIDIA or AMD GPU node for accelerated vLLM. Without GPU, enable `modelServing.cpuOnly: true` in `charts/region/hub/values.yaml`. |
| **OpenShift Lightspeed** | Requires `OLSConfig` CRD and an OpenAI-compatible endpoint (MaaS on hub or external). |
| **Vault** | HashiCorp Vault is deployed by the pattern operator as the secrets backend. |

### Workstation

- **`oc` CLI** logged into the hub as `cluster-admin` for ACM import
- **Helm 3** (`helm version`)
- **Git** client and a GitHub (or Gitea) account

### Network requirements (connected environments)

1. Access to public container registries (or mirrored equivalents) from all clusters
2. Access to your Git fork from all clusters

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
charts/all/                   → shared component Helm charts (50+ charts)
charts/region/hub/            → hub bootstrap + hub clusterGroup values
charts/region/east/           → east spoke bootstrap + clusterGroup values
charts/region/west/           → west spoke bootstrap + clusterGroup values
values-global.yaml            → pattern name and shared Git URL
values.yaml                   → root chart values (clustergroup subscription)
values-secret.yaml            → secrets (from values-secret.yaml.template; Vault + ESO)
pattern.sh                    → Validated Patterns install wrapper
```

The pattern uses a **dual GitOps strategy**:
- **PUSH** — hub `ApplicationSet` (`fleet-spoke-push`) deploys `charts/all/spoke-meta-push` to each spoke cluster via ACM placement
- **PULL** — each spoke's local Argo CD syncs its own `charts/region/east/` or `charts/region/west/` from Git autonomously

## Step 1: Fork the repository

Fork [hybrid-mesh-platform](https://github.com/maximilianoPizarro/hybrid-mesh-platform) so you can customize domains, secrets, and Git URLs.

Update `main.gitops.repoURL` in `values-global.yaml` and cluster domains in `overrides/values-aws-{hub,east,west}.yaml` (or your cloud-specific overrides).

## Step 2: Configure secrets and cluster domains

Copy the secrets template and edit before installation. **Do not commit `values-secret.yaml` to Git.**

```bash
cp values-secret.yaml.template values-secret.yaml
```

### Required secrets (values-secret.yaml)

The Validated Patterns secrets framework (Vault + External Secrets Operator) reads `values-secret.yaml` at install time and populates Vault. The following secrets are defined in the template:

| Secret name | Fields | When required |
| --- | --- | --- |
| `config-demo` | `secret` | Always (auto-generated if left as `onMissingValue: generate`) |
| `kairos-ai-credentials` | `api-key` | When Kairos SmartScaling AI features are enabled on spokes |
| `openshift-ai-maas-credentials` | `OPENAI_API_KEY`, `OPENAI_API_BASE` | When OpenShift AI / MaaS inference is enabled on the hub |
| `mcp-gateway-argocd` | `token` | When MCP Gateway is enabled (OpenShift Lightspeed integration) |
| `workshop-users` | `defaultPassword` | Workshop Showroom (demo only; use OAuth in production) |
| AWS credentials | `aws_access_key_id`, `aws_secret_access_key` | Only if using ACM ClusterPools to provision new clusters |

Fields marked `onMissingValue: generate` are auto-generated by Vault for demo environments. For production, set them to `onMissingValue: error` and provide values explicitly.

Set hub and spoke cluster domains in override files before install:

```bash
# Edit your cloud provider override (AWS example):
vi overrides/values-aws-hub.yaml
vi overrides/values-aws-east.yaml
vi overrides/values-aws-west.yaml
```

See [MIGRATION.md](https://github.com/maximilianoPizarro/hybrid-mesh-platform/blob/main/MIGRATION.md) for the mapping from legacy RHDP-injected secrets.

## Step 3: Install with Validated Patterns

From the hub cluster (logged in with `oc`):

```bash
./pattern.sh install
```

The Pattern operator (or utility container) deploys the root `clustergroup` Application on the hub. ACM `managedClusterGroups` in `charts/region/hub/values.yaml` register east and west spokes once they join the fleet.

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

For each cluster in the PlacementDecision, the hub ApplicationSet (`fleet-spoke-push`) creates an Application that:

- Uses repository path `charts/all/spoke-meta-push` (the PUSH meta chart) deployed to the spoke cluster
- The spoke's local Argo CD then pulls its own `charts/region/east/` or `charts/region/west/` from Git autonomously
- Deploys to remote cluster `{{name}}` via hub-stored cluster credentials

Adding a spoke with correct labels and a new `charts/region/south/` folder automatically generates a new Application when the Placement matches.

### Troubleshooting: no spoke Applications

| Check | Command / expectation |
| --- | --- |
| Managed clusters | `oc get managedcluster` — **Available** |
| Cluster names | Must be `east` and `west` (match repo folders) |
| Placement | `hub-spoke-placement` includes both regions |
| PlacementDecision | Decisions list `east`, `west` |
| GitOpsCluster | `hub-spoke-gitops` reconciled; clusters visible in Argo CD UI |
| RBAC | Role `applicationset-placementdecisions` for ApplicationSet controller |
| Spoke charts | `charts/region/east/` and `charts/region/west/` valid Helm charts with `Chart.yaml` |

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

## Verify the installation

Run these checks after all sync waves complete to confirm the pattern is healthy. Run each command from the hub cluster unless noted.

### Fleet and GitOps

```bash
# ACM: east and west must be Available
oc get managedcluster

# Hub clustergroup: all Applications Synced
oc get applications -n openshift-gitops

# ApplicationSet: spoke apps generated
oc get applicationset fleet-spoke-push -n openshift-gitops
oc get applications -n openshift-gitops | grep spoke-components
```

### Service Interconnect (Skupper)

```bash
# Hub VAN: sitesInNetwork must equal 3 (hub + east + west)
oc get site hub -n service-interconnect \
  -o jsonpath='sitesInNetwork={.status.sitesInNetwork}{"\n"}'

# Skupper listeners ready on hub
oc get listeners -n service-interconnect
```

### OpenShift Lightspeed (MCP Gateway)

```bash
# OLSConfig must be Available
oc get olsconfig cluster -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}{"\n"}'

# OpenShift Lightspeed pods running on hub
oc get pods -n openshift-lightspeed

# MCP Gateway pods running on hub
oc get pods -n mcp-gateway
```

### OpenShift AI / RHOAI

```bash
# DataScienceCluster components: all Managed / Ready
oc get datasciencecluster default-dsc \
  -o jsonpath='{range .status.installedComponents[*]}{.name}: {.managementState}{"\n"}{end}'

# Model serving pods (if enabled)
oc get pods -n rhods-model-mesh-serving 2>/dev/null || \
oc get pods -n modelmesh-serving 2>/dev/null
```

### Industrial Edge (run on each spoke)

```bash
# Switch to east or west context
oc config use-context east   # adjust to your kubeconfig context name

# Sensors, Kafka, and Camel K running
oc get pods -n industrial-edge-tst
oc get kafka dev-cluster -n industrial-edge-tst -o jsonpath='{.status.conditions[0].type}{"\n"}'

# Line dashboard accessible
oc get route line-dashboard -n industrial-edge-tst
```

### Console links (hub — 19 expected)

```bash
# Log in first so OAuth-protected links get a bearer token
oc login --token=<hub-token> --server=<hub-api-url>

# Expect 19 OK (HTTP 200) on a full hub install
MIN_OK_CODE=200 bash scripts/verify-console-links.sh
```

If any check fails, see the [extended troubleshooting guide](https://maximilianopizarro.github.io/hybrid-mesh-platform/validatedpatterns-docs/troubleshooting.html) and the [Validation Guide](https://maximilianopizarro.github.io/hybrid-mesh-platform/validation-guide.html).

## References

- [ACM documentation](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.16/html/about/welcome-to-red-hat-advanced-cluster-management-for-kubernetes)
- [OpenShift AI documentation](https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed)
- [OpenShift Lightspeed documentation](https://docs.redhat.com/en/documentation/openshift_lightspeed)
- [Multicloud GitOps Validated Pattern](/patterns/multicloud-gitops)
- [RHDP install playbook and extended docs](https://maximilianopizarro.github.io/hybrid-mesh-platform/validatedpatterns-docs/)
- [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)

**Next →** [Scaffolding](scaffolding) to deploy Industrial Edge instances from Developer Hub · [Architecture](architecture) for diagrams · [Observability](observability) once metrics are flowing.
