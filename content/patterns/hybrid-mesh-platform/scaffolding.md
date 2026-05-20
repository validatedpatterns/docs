---
title: Scaffolding
weight: 60
aliases: /hybrid-mesh-platform/scaffolding/
---

# Scaffolding Industrial Edge on east and west

Developer Hub Create templates deploy new Industrial Edge instances to east or west spokes. This chapter is the operational follow-up to [Architecture](architecture) and [Getting Started](getting-started).

[![Developer Hub](/images/hybrid-mesh-platform/product-developer-hub.png)](/images/hybrid-mesh-platform/product-developer-hub.png)

## What you need before scaffolding

| Requirement | How to verify |
| --- | --- |
| Developer Hub reachable | `https://developer-hub.<domain>` |
| Signed in as `platformadmin` (or your catalog user) | Keycloak OIDC; user in `catalog-users.yaml` |
| Gitea org `ws-platformadmin` exists | PostSync Job `gitea-admin-setup` in namespace `gitea` |
| Spoke tokens synced | `oc get secret developer-hub-spoke-tokens -n developer-hub` |
| Templates catalog loaded | Create shows Industrial Edge templates |

`platformadmin` is the Gitea root-equivalent user. Workshop users get orgs `ws-user1`, `ws-user2`, …; `platformadmin` uses `ws-platformadmin`.

## Software templates

Templates are static files in the pattern repository under `docs/assets/backstage/software-templates/`:

| Template | Target | Result |
| --- | --- | --- |
| Industrial Edge | east or west | IoT namespace, sensors, Kafka, deployment, Tekton pipeline |
| Camel Kaoto | east or west | Camel routes, DevSpaces devfile, Continue AI config |
| Industrial Edge Delete | east or west | Removes ArgoCD Application + Gitea repo + notification |

## Step-by-step — deploy on east

1. Open Developer Hub → **Create**.
2. Choose **Industrial Edge: IoT Manufacturing (Multi-Cluster)**.
3. Set **Instance Name** (e.g. `edge-factory-1`), **Owner** `platformadmin`, **Target Cluster** `east`.
4. Set Hub cluster apps domain (e.g. `apps.<hub-domain>`).
5. Run the template.

Behind the scenes:

1. `fetch:template` — skeleton from template integration
2. `publish:github` — repo `ws-platformadmin/edge-factory-1-east` on Gitea
3. `catalog:register` — new Component in the catalog
4. `http:backstage:request` — ArgoCD Application `gen-platformadmin-edge-factory-1-east` on cluster east
5. Notification to `user:default/platformadmin`

## Verify Topology and Kubernetes tabs

1. Open the new catalog entity (or line-dashboard-east for the platform stack).
2. **Topology** tab — requires `backstage.io/kubernetes-cluster: east` and matching `backstage.io/kubernetes-id`.
3. **Kubernetes** tab — pods in `industrial-edge-tst-all` on cluster east.

If Topology is empty:

```bash
oc get secret developer-hub-spoke-tokens -n developer-hub -o jsonpath='{.data.EAST_SA_TOKEN}' | wc -c
oc get managedserviceaccount -n east
oc logs -n developer-hub -l app.kubernetes.io/name=backstage --tail=20 | grep -i kubernetes
```

## Gitea organizations

| Org | Purpose |
| --- | --- |
| `developer-hub` | Platform-owned repos |
| `ws-<user>` | Per-user scaffold repos (e.g. `ws-platformadmin`) |
| `app-of-apps` | ApplicationSet-managed GitOps repos |

## Quay vs internal registry

| Stage | Registry |
| --- | --- |
| Tekton buildah push | `image-registry.openshift-image-registry.svc:5000/<ns>/:latest` |
| Deployment pull | Same internal image (no pull secret on OpenShift) |
| Catalog display | `quay.io/<org>/<repo>` annotation only |

## Delete an instance

1. Create → **Industrial Edge — Delete Instance**.
2. Enter the same name, owner, and target cluster.
3. Template deletes the ArgoCD Application and Gitea repo; unregister the catalog entity manually if it still appears.

Next: [Hub Gateway](hub-gateway) for cross-cluster HTTP routing, or [Observability](observability) to confirm metrics after workloads are running.
