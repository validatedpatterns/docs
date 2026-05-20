---
title: Scaffolding
weight: 60
aliases: /hybrid-mesh-platform/scaffolding/
---

# Scaffolding Industrial Edge on east and west

Developer Hub **Create** templates deploy new Industrial Edge instances to east or west spokes. This chapter is the operational follow-up to [Architecture](architecture) and [Getting Started](getting-started) — turn a running platform into additional factory instances without hand-editing GitOps repos.

[![Developer Hub](/images/hybrid-mesh-platform/product-developer-hub.png)](/images/hybrid-mesh-platform/product-developer-hub.png)

## What you need before scaffolding

| Requirement | How to verify |
| --- | --- |
| Developer Hub reachable | `https://developer-hub.<domain>` loads |
| Signed in as `platformadmin` (or catalog user) | Keycloak OIDC; user listed in `catalog-users.yaml` |
| Gitea org `ws-platformadmin` exists | PostSync Job `gitea-admin-setup` succeeded in namespace `gitea` |
| Spoke tokens synced | `oc get secret developer-hub-spoke-tokens -n developer-hub` |
| Templates catalog loaded | **Create** shows three Industrial Edge templates |

`platformadmin` is the Gitea root-equivalent user (`gitea_admin` is the server admin account). Workshop users receive orgs `ws-user1`, `ws-user2`, …; `platformadmin` uses **`ws-platformadmin`**.

## Software templates

Templates are static files in the pattern repository:

```
docs/assets/backstage/software-templates/
```

Published catalog URL (when GitHub Pages is enabled on the pattern repo):

```
https://maximilianopizarro.github.io/platform-hub-spoke-config/assets/backstage/software-templates/templates-catalog.yaml
```

| Template | Target | Result |
| --- | --- | --- |
| Industrial Edge: IoT Manufacturing (Multi-Cluster) | east or west | IoT namespace, sensors, Kafka, deployment, Tekton pipeline |
| Industrial Edge — Camel Routes (Kaoto + Continue AI) | east or west | Camel routes, DevSpaces devfile, Continue AI config |
| Industrial Edge — Delete Instance | east or west | Removes Argo CD Application + Gitea repo + notification |

After Argo CD syncs `developer-hub`, open **Catalog → Systems → industrial-edge** and use **Create** for the templates.

## Step-by-step — deploy on east

1. Open Developer Hub → **Create**.
2. Choose **Industrial Edge: IoT Manufacturing (Multi-Cluster)**.
3. Set **Instance Name** (for example `edge-factory-1`), **Owner** `platformadmin`, **Target Cluster** `east`.
4. Set **Hub cluster apps domain** (for example `apps.<hub-domain>`).
5. Run the template.

### Behind the scenes

| Step | Action |
| --- | --- |
| `fetch:template` | Skeleton from template integration (GitHub Pages assets) |
| `publish:github` | Repo `ws-platformadmin/edge-factory-1-east` on Gitea |
| `catalog:register` | New Component in Developer Hub catalog |
| `http:backstage:request` | Argo CD Application `gen-platformadmin-edge-factory-1-east` on cluster **east** |
| Notification | Sent to `user:default/platformadmin` |

Repeat with **Target Cluster** `west` for a west instance (`edge-factory-1-west` repo naming).

## Verify Topology and Kubernetes tabs

1. Open the new catalog entity (or platform `line-dashboard-east` for the reference stack).
2. **Topology** tab — requires `backstage.io/kubernetes-cluster: east` (or `west`) and `backstage.io/kubernetes-id` matching deployment labels.
3. **Kubernetes** tab — pods in `industrial-edge-tst-all` on the selected cluster.

If Topology is empty:

```bash
oc get secret developer-hub-spoke-tokens -n developer-hub -o jsonpath='{.data.EAST_SA_TOKEN}' | wc -c
oc get managedserviceaccount -n east
oc logs -n developer-hub -l app.kubernetes.io/name=backstage --tail=20 | grep -i kubernetes
```

Confirm `ManagedServiceAccount` and hub token sync Job completed ([Getting Started](getting-started#step-9-continue-ai-devspaces--kaoto)).

## Gitea organizations

| Org | Purpose |
| --- | --- |
| `developer-hub` | Platform-owned repos |
| `ws-<user>` | Per-user scaffold repos (for example `ws-platformadmin`) |
| `app-of-apps` | ApplicationSet-managed GitOps repos — delete repo to trigger Argo CD prune |

The `app-of-apps` org is created by the Gitea PostSync Job. Use it when wiring an ApplicationSet with a Gitea generator: each generated repo maps to one Argo CD Application; removing the repo lets prune clean up spoke resources.

## Quay vs internal registry

| Stage | Registry |
| --- | --- |
| Tekton buildah push | `image-registry.openshift-image-registry.svc:5000/<namespace>/:latest` |
| Deployment pull | Same internal image (no pull secret on OpenShift) |
| Catalog display | `quay.io/<org>/<repo>` annotation for metadata only |

On-prem Quay (`quay-registry.<domain>`) is for catalog metadata and optional mirror; default pipelines do not require Quay credentials unless you add an explicit push step.

## Delete an instance

1. **Create** → **Industrial Edge — Delete Instance**.
2. Enter the same **name**, **owner**, and **target cluster** used at create time.
3. Template deletes the Argo CD Application and Gitea repo.
4. Unregister the catalog entity manually if it still appears in the catalog UI.

## References

- [Getting Started](getting-started) — Developer Hub OIDC and spoke token sync
- [Industrial Edge](industrial-edge) — workload components per spoke
- [Hub Gateway](hub-gateway) — expose line-dashboard through hub ingress

**Next →** [Hub Gateway](hub-gateway) for cross-cluster HTTP routing, or [Observability](observability) to confirm metrics after workloads are running.
