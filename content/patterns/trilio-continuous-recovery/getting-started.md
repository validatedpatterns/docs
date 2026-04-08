---
title: Getting started
weight: 20
aliases: /trilio-cr/getting-started/
---

# Deploying the pattern

## Deployment

### 1. Clone the repository

```bash
git clone https://github.com/trilio-demo/trilio-continuous-restore
cd trilio-continuous-restore
```

### 2. Configure S3 bucket details

Edit `values-hub.yaml` and `values-secondary.yaml` to set your S3 bucket name and region:

```yaml
# In both values-hub.yaml and values-secondary.yaml, under the trilio-operand app overrides:
overrides:
  - name: backupTarget.bucketName
    value: <your-bucket-name>
  - name: backupTarget.region
    value: <your-bucket-region>   # for example, us-east-1
```

### 3. Populate secrets

Create `values-secret.yaml` from the template:

```bash
cp values-secret.yaml.template ~/values-secret-trilio-continuous-restore.yaml
```

Edit `~/values-secret-trilio-continuous-restore.yaml` and fill in your credentials:

```yaml
secrets:
  - name: trilio-license
    vaultPrefixes:
    - global
    fields:
    - name: key
      value: <your-trilio-license-key>   # single unbroken line, no escape characters

  - name: trilio-s3
    vaultPrefixes:
    - global
    fields:
    - name: accessKey
      value: <your-s3-access-key>
    - name: secretKey
      value: <your-s3-secret-key>
```

> Always update secrets in your home directory, never in the repo's `values-secret.yaml.template` so that secrets are never committed to git.

### 4. Install the pattern

```bash
./pattern.sh make install
```

This command:
1. Bootstraps HashiCorp Vault and loads secrets from `~/values-secret-trilio-continuous-restore.yaml`
2. Installs the Validated Patterns operator on the hub
3. Creates the `ValidatedPattern` CR which triggers ArgoCD to deploy all hub components

Monitor progress in the ArgoCD UI or by running:

```bash
oc get application -n openshift-gitops
```

All applications should reach `Synced / Healthy` within 10–15 minutes.

**Alternative: manual secret population by using `oc`**

To write or rotate secrets directly in HashiCorp Vault without re-running `./pattern.sh make install`:

```bash
# Extract Vault root token
VAULT_TOKEN=$(oc get secret vaultkeys -n imperative \
  -o jsonpath='{.data.vault_data_json}' | \
  base64 -d | python3 -c "import sys,json; print(json.load(sys.stdin)['root_token'])")

# Write Trilio license
oc exec -n vault vault-0 -- env VAULT_TOKEN=$VAULT_TOKEN \
  vault kv put secret/global/trilio-license key="<your-license-key>"

# Write S3 credentials
oc exec -n vault vault-0 -- env VAULT_TOKEN=$VAULT_TOKEN \
  vault kv put secret/global/trilio-s3 accessKey="<key>" secretKey="<secret>"
```

You can also reload secrets from `~/values-secret-trilio-continuous-restore.yaml` by running:

```bash
./pattern.sh make load-secrets
```

### 5. Verify hub deployment

Check that Trilio is healthy:

```bash
oc get triliovaultmanager -n trilio-system
# STATUS should be Deployed or Updated

oc get target -n trilio-system
# STATUS should be Available
```

Check the end-to-end DR status (updated automatically by the imperative framework):

```bash
make dr-status
```

Initial run: `trilio-enable-cr` and `trilio-backup` complete within the first two CronJob cycles (~20 minutes). Standard restore follows. All phases `PASS` indicates the hub is fully operational.

---

## Spoke (DR cluster) onboarding

### 1. Import the DR cluster into ACM

Import the DR cluster through the ACM console or the `oc` CLI. Note the cluster name assigned during import.

### 2. Label and onboard

```bash
make onboard-spoke CLUSTER=<acm-cluster-name>
```

This labels the cluster with `clusterGroup=secondary`, which triggers ACM to deploy the spoke configuration through ArgoCD.

After running `make onboard-spoke`, kick the spoke-side ArgoCD application to sync immediately (run on the spoke cluster context):

```bash
oc patch application.argoproj.io main-trilio-continuous-restore-secondary \
  -n openshift-gitops --type merge \
  -p '{"operation":{"sync":{}}}'
```

### 3. Monitor spoke onboarding

```bash
make spoke-status CLUSTER=<acm-cluster-name>
```

Expected progression:
1. Trilio operator installs (OLM subscription)
2. TrilioVaultManager deploys (ESO delivers S3 + license secrets)
3. BackupTarget becomes Available (EventTarget pod starts)
4. ConsistentSets begin appearing as hub backups are detected (~10–20 minutes after the hub's CR backup completes)
5. Spoke imperative restore runs automatically after the first ConsistentSet is Available

The full spoke onboarding sequence typically takes 15–25 minutes from label application to a running TrilioVaultManager. The imperative restore adds another 30–45 minutes on top of that for the first ConsistentSet to appear and the restore to complete.

### Known: trilio-operand OutOfSync on spoke after onboarding

ArgoCD may show `trilio-operand` as `OutOfSync / Missing` immediately after spoke onboarding. This is a CRD timing issue — ArgoCD attempts to sync the TrilioVaultManager CR before the Trilio operator has finished registering its Custom Resource Definitions (CRDs).

The `SkipDryRunOnMissingResource=true` sync option is set in `values-secondary.yaml` to handle this automatically. If the issue persists after 5–10 minutes, manually refresh the ArgoCD application:

```bash
oc patch application trilio-operand -n main-trilio-continuous-restore-secondary \
  --type merge -p '{"operation":{"sync":{}}}'
```
