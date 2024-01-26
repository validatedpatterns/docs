---
 date: 2024-01-16
 title: More Secrets Options Now Available with Validated Patterns
 summary: Validated Patterns now supports alternatives to both HashiCorp Vault and the External Secrets Operator
 author: Martin Jackson
 blog_tags:
 - patterns
 - secrets
---

# More Secrets Options Now Available with Validated Patterns

## Overview

## The "vault" Backend - Unchanged Interface, New plumbing

## The "kubernetes" Backend *new*

## The "none" Backend *new*

## How to Use a non-default Backend

## Using the old system - The `legacy-load-secrets` Makefile target

The existing vault-utils codepath is available via the `legacy-load-secrets`
Makefile target. If secrets loading fails, or you just want to use the other
system, you can run `make legacy-load-secrets` after `make install` and it will
run those scripts and the Ansible playbooks and roles associated with them.

## Deprecation of v1.0 Secrets

The v1.0 secrets format has not been used in the Validated Patterns framework
for over a year now. The v2.0 framework is a strict superset of the v1.0
framework. Support for the v1.0 framework is still available via the
`legacy-load-secrets` code path, but this may be removed in the future.

## Updates to the Secrets v2.0 Schema

### Top-level Additions

#### `secretStoreNamespace`

#### `defaultAnnotations`

#### `defaultLabels`

### Per-secret Additions

#### `targetNamespaces`
#### `labels`
#### `annotations`

## Under the Hood - Python and Ansible Code

### The process_secrets playbook
### parse_secrets_info Ansible Module
### vault_load_parsed_secrets Ansible Module
### The k8s_secret_utils Ansible Role
### Changes to to vault_utils Ansible Role

## Developing a new backend
