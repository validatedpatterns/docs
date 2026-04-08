---
title: Troubleshooting
weight: 40
aliases: /trilio-cr/troubleshooting/
---

## Troubleshooting

### Trilio operator not installing

```bash
oc get subscription k8s-triliovault -n trilio-system -o yaml
oc get installplan -n trilio-system
```

Check that the `certified-operators` CatalogSource is healthy:

```bash
oc get catalogsource -n openshift-marketplace
```

### TrilioVaultManager not reaching Deployed or Updated

```bash
oc get triliovaultmanager -n trilio-system -o yaml
oc logs -n trilio-system -l app=k8s-triliovault-operator --tail=50
```

Common cause: the license Secret has not been created yet. Check External Secrets Operator (ESO) ExternalSecret status:

```bash
oc get externalsecret -n trilio-system
```

### BackupTarget stuck in Failed

```bash
oc get target -n trilio-system -o yaml
```

Common causes:
- S3 credentials are incorrect or the Secret has not been created by ESO yet
- `backupTarget.region` does not match the bucket's actual region — always set it explicitly

### No ConsistentSets appearing on the spoke

1. Verify the EventTarget pod is running: `oc get pods -n trilio-system | grep event`
2. Verify the spoke BackupTarget is Available: `oc get target -n trilio-system`
3. Verify at least one Available backup exists on the hub using the CR BackupPlan: `oc get backup -n wordpress`
4. Check that hub and spoke are running the same Trilio version: `oc get csv -n trilio-system`

### Imperative jobs stuck in Init:Error

```bash
# View logs from the failing init container
oc logs -n imperative <pod-name> -c <init-container-name>

# List init containers in order
oc get pod <pod-name> -n imperative -o jsonpath='{.spec.initContainers[*].name}'
```

The init container name matches the job name (e.g., `trilio-backup`). Each init container runs one playbook; a failure stops all subsequent jobs.

### Spoke ArgoCD not syncing after values-secondary.yaml changes

The spoke application has no automated sync. Kick it manually on the spoke context:

```bash
oc patch application.argoproj.io main-trilio-continuous-restore-secondary \
  -n openshift-gitops --type merge \
  -p '{"operation":{"sync":{}}}'
```

### BackupTarget or TrilioVaultManager perpetually OutOfSync in ArgoCD

Trilio continuously writes status fields to its own Custom Resources. ArgoCD detects these writes as drift and marks the application `OutOfSync` — even though the configuration is correct. This is expected behavior and does not indicate a problem.

The Helm chart includes a `ServerSideDiff=true` annotation on Trilio CR templates to suppress this. If you see persistent `OutOfSync` without any configuration changes, verify the annotation is present:

```bash
oc get application trilio-operand -n openshift-gitops -o jsonpath='{.spec.syncPolicy}'
```

### Secrets written to Vault after ArgoCD has already synced

If ESO ExternalSecrets were created before the Vault secrets were populated, they may be in a `SecretSyncedError` state. Force an immediate re-sync:

```bash
oc annotate externalsecret trilio-s3-credentials -n trilio-system \
  force-sync=$(date +%s) --overwrite
oc annotate externalsecret trilio-license -n trilio-system \
  force-sync=$(date +%s) --overwrite
```

Wait 30 seconds and re-check:

```bash
oc get externalsecret -n trilio-system
```

### Vault root token — how to extract

The Vault root token and unseal keys are stored in the `vaultkeys` Secret in the `imperative` namespace. Extract the root token:

```bash
VAULT_TOKEN=$(oc get secret vaultkeys -n imperative \
  -o jsonpath='{.data.vault_data_json}' | \
  base64 -d | python3 -c "import sys,json; print(json.load(sys.stdin)['root_token'])")
echo $VAULT_TOKEN
```

> Save the root token and unseal keys before running `offboard-hub` — the `imperative` namespace is deleted during offboard and the Secret is lost.

---

## Operational notes

### Secret values must be plain text

Secrets written to HashiCorp Vault must be plain text values, not Base64-encoded. ESO handles Base64 encoding when creating Kubernetes Secrets. If values are pre-encoded, ESO double-encodes them and Trilio receives garbled data, causing the BackupTarget to stay in `Failed` state.

### TrilioVaultManager healthy states

Both `Deployed` and `Updated` are healthy TrilioVaultManager states. `Updated` indicates a recent upgrade completed successfully. Monitoring scripts and health checks should accept either value.

### Imperative job update lag

When a configuration change is pushed to Git, there is a delay before the imperative CronJob picks it up:

1. ArgoCD polls Git every ~3 minutes and updates the ConfigMap
2. The CronJob runs every 10 minutes — the next pod starts at the next scheduled tick
3. The pod must mount the updated ConfigMap before the playbook runs

**Total lag: typically 15–30 minutes from `git push` to effect.** This is normal behavior, not a failure.
