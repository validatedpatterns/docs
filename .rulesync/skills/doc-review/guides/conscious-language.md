# Conscious Language

Format applicability: [All]
Severity: **Must-fix**

## Rule

Replace non-inclusive terminology with inclusive alternatives. When possible, rewrite documentation to avoid the problematic terms entirely. Align with your product team's agreed-upon replacements.

## Blacklist / Whitelist

| DON'T | DO (preferred) | DO (alternatives) |
|---|---|---|
| blacklist | blocklist | denylist |
| whitelist | allowlist | passlist |

### Examples

| DON'T | DO |
|---|---|
| Heat blacklists any servers in the list from receiving updated deployments. | Heat excludes any servers in the list from receiving updated deployments. |
| Add a new rule to whitelist a custom binary. | Add a new rule to allow a custom binary. |

## Master / Slave

| DON'T | DO (alternatives) |
|---|---|
| master / slave | primary / secondary |
| master / slave | source / replica |
| master / slave | initiator, requester / responder |
| master / slave | controller, host / device, worker, proxy |
| master / slave | director / performer |
| master / slave | controller / port interface (in networking) |
| master (alone) | primary, main, original |

### Examples

| DON'T | DO |
|---|---|
| A Ceph Monitor maintains the master copy of the cluster map. | A Ceph Monitor maintains the primary copy of the cluster map. |
| Copy the public key to the slave node. | Copy the public key to the secondary node. |
