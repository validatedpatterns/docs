---
title: CR operations
weight: 30
aliases: /trilio-cr/cr-operations/
---

## Operations

### Monitoring DR status

```bash
# Hub — all phases
make dr-status

# Spoke — ConsistentSet and restore status (run on spoke context)
oc get configmap trilio-cr-status -n imperative -o yaml
```

### Automated DR lifecycle

The imperative framework runs continuously on a 10-minute schedule with no manual intervention required. The full lifecycle from a standing start (hub up, spoke just joined) to a completed Continuous Restore typically completes within 30–45 minutes.

**Hub job sequence:**

| Job | What it does | Skips when |
|-----|-------------|------------|
| `trilio-enable-cr` | Creates CR BackupPlan + ContinuousRestore Policy | CR BackupPlan already Available |
| `trilio-cr-backup` | Creates a backup against the CR BackupPlan | Available CR backup exists |
| `trilio-backup` | Creates a standard backup | Available backup exists |
| `trilio-restore-standard` | Restores to `wordpress-restore` on hub | Completed restore exists |
| `trilio-e2e-status` | Writes status ConfigMap; fails until all phases pass | — (always runs) |

**Spoke job sequence (per DR cluster):**

| Job | What it does | Skips when |
|-----|-------------|------------|
| `trilio-cr-status` | Validates ConsistentSet available; writes status ConfigMap | — (always runs; fails until Available) |
| `trilio-cr-restore` | Restores from latest ConsistentSet to `wordpress-restore` | Completed restore exists |

### Manual backup

To trigger a backup outside the automated schedule:

```bash
ansible-navigator run ansible/playbooks/dr-backup.yaml
```

### Manual DR restore

**Standard restore** (from a named backup):

```bash
ansible-navigator run ansible/playbooks/dr-restore.yaml \
  -e restore_method=backup \
  -e restore_namespace=<target-namespace>
```

**Continuous Restore** (from a pre-staged ConsistentSet on the DR cluster — accelerated RTO):

```bash
ansible-navigator run ansible/playbooks/dr-restore.yaml \
  -e restore_method=consistentset \
  -e restore_namespace=<target-namespace>
```

Both commands discover the cluster ingress domain automatically and apply the Route hostname transform.

### Offboarding a spoke

```bash
# Step 1 — on the hub context
make unlabel-spoke CLUSTER=<acm-cluster-name>

# Step 2 — on the spoke context
make offboard-spoke CLUSTER=<acm-cluster-name>
```

### Uninstalling the pattern

```bash
# On the hub context
make offboard-hub
```

> Save your HashiCorp Vault root token and unseal keys before running `offboard-hub`. They are stored in the `imperative` namespace which is removed during offboard.

---

## Ansible playbook reference

| Playbook | When to use | Key inputs |
|----------|-------------|------------|
| `dr-backup.yaml` | Trigger a manual backup on the hub | — |
| `dr-restore.yaml` | Manual restore (backup or ConsistentSet method) | `restore_method`, `restore_namespace`, `source_backup` (optional) |
| `validate-trilio.yaml` | Pre/post-change Trilio health validation | — |
| `offboard-spoke.yaml` | Remove spoke-side Trilio resources | `cluster_name` |
| `offboard-hub.yaml` | Full hub pattern teardown | — |

Playbooks are run by using `ansible-navigator`:

```bash
ansible-navigator run ansible/playbooks/<playbook>.yaml [-e key=value ...]
```
