---
title: Scaffolding
weight: 70
aliases: /hybrid-mesh-platform/scaffolding/
---

# Scaffolding Industrial Edge on East and West

Developer Hub **Create** templates deploy new Industrial Edge instances to **east** or **west** spokes. This chapter is the operational follow-up to [Architecture](architecture) and [Getting Started](getting-started).

## What you need before scaffolding

| Requirement | How to verify |
| ----------- | ------------- |
| Developer Hub reachable | `https://developer-hub.<hub-apps-domain>` |
| Signed in as `platformadmin` (or your catalog user) | Keycloak OIDC; user in `catalog-users.yaml` |
| Gitea org `ws-platformadmin` exists | PostSync Job `gitea-admin-setup` in namespace `gitea` |
| Spoke tokens synced | `oc get secret developer-hub-spoke-tokens -n developer-hub` |
| Templates catalog loaded | **Create** shows templates (after GitHub Pages deploy) |
| Dev Spaces on target spoke | `oc get checluster -n devspaces` on east/west |

`platformadmin` is the Gitea root-equivalent user (`gitea_admin` is the admin account). Workshop users get orgs `ws-user1`, `ws-user2`, …; `platformadmin` uses **`ws-platformadmin`**.

## Software templates

Templates are static files under `docs/assets/backstage/software-templates/` and load from GitHub Pages:

```text
https://maximilianopizarro.github.io/hybrid-mesh-platform/assets/backstage/software-templates/templates-catalog.yaml
```

| Template | Target | Result |
| -------- | ------ | ------ |
| **Industrial Edge** | east or west | IoT namespace, sensors, Kafka, deployment, Tekton pipeline |
| **Camel Kaoto** | east or west | Camel routes, DevSpaces devfile, Continue AI config |
| **Camel CDC (Kaoto + Continue AI)** | east or west | Standalone CDC route; DevSpaces on **spoke** (`spokeAppsDomain`) |
| **Industrial Edge Delete** | east or west | Removes ArgoCD Application + Gitea repo + notification |
| **CNV VM Workshop** | hub | Virtual machine manifests in Gitea |

## Step-by-step — deploy on east

1. Open Developer Hub → **Create**.
2. Choose **Industrial Edge: IoT Manufacturing (Multi-Cluster)**.
3. Set **Instance Name** (e.g. `edge-factory-1`), **Owner** `platformadmin`, **Target Cluster** `east`.
4. Set **Hub cluster apps domain** (e.g. `apps.cluster-xqg4c.dynamic2.redhatworkshops.io`).
5. Run the template.

Behind the scenes:

1. `fetch:template` — skeleton from GitHub Pages (`maximilianopizarro.github.io` integration).
2. `publish:github` — repo `ws-platformadmin/edge-factory-1-east` on Gitea.
3. `catalog:register` — new Component in the catalog.
4. `http:backstage:request` — ArgoCD Application `gen-platformadmin-edge-factory-1-east` on cluster **east**.
5. Notification to `user:default/platformadmin`.

## Verify Topology and Kubernetes tabs

1. Open the new catalog entity (or **line-dashboard-east** for the platform stack).
2. **Topology** tab — requires `backstage.io/kubernetes-cluster: east` and `backstage.io/kubernetes-id` matching deployment labels.
3. **Kubernetes** tab — pods in `industrial-edge-tst-all` on cluster east.

If Topology is empty:

```bash
oc get secret developer-hub-spoke-tokens -n developer-hub -o jsonpath='{.data.EAST_SA_TOKEN}' | wc -c
oc get managedserviceaccount -n east
oc logs -n developer-hub -l app.kubernetes.io/name=backstage --tail=20 | grep -i kubernetes
```

## Gitea organizations

| Org | Purpose |
| --- | ------- |
| `developer-hub` | Platform-owned repos |
| `ws-<username>` | Per-user scaffold repos (e.g. `ws-platformadmin`) |
| `app-of-apps` | ApplicationSet-managed GitOps repos — delete repo to trigger ArgoCD prune |

The `app-of-apps` org is created by the Gitea PostSync Job. Use it when wiring an **ApplicationSet** with a Gitea generator: each generated repo maps to one Argo CD Application; removing the repo lets prune clean up spoke resources.

## Quay vs internal registry

| Stage | Registry |
| ----- | -------- |
| Tekton **buildah** push | `image-registry.openshift-image-registry.svc:5000/<namespace>/<app>:latest` |
| Deployment pull | Same internal image (no pull secret on OpenShift) |
| Catalog display | `quay.io/maximilianopizarro/<uniqueName>` annotation only |

On-prem **Quay** (`quay-registry.<hub-domain>`) is for public catalog metadata and optional mirror; pipelines do not require Quay credentials unless you add an explicit push step.

## DevSpaces and Continue AI

DevSpaces runs on **spokes only** — not the hub. Template output links use:

```text
https://devspaces.<spokeAppsDomain>/#https://gitea-gitea.<hub-domain>/ws-<user>/<repo>/raw/branch/main/devfile.yaml
```

Continue AI credentials are synced into `{username}-devspaces` by PostSync job `devspaces-continue-ai-sync` (reads `kairos-system/kairos-ai-credentials` on the spoke). Devfile `setup-continue` substitutes `CONTINUE_API_KEY` from the auto-mounted secret.

## Delete an instance

1. **Create** → **Industrial Edge — Delete Instance**.
2. Enter the same name, owner, and target cluster.
3. Template deletes the ArgoCD Application and Gitea repo; unregister the catalog entity manually if it still appears.

---

**Next →** [Hub Gateway](hub-gateway) for cross-cluster HTTP routing, or [Observability](observability) to confirm metrics after workloads are running.
