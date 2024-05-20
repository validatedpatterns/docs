---
 date: 2024-01-26
 title: More Secrets Options Now Available with Validated Patterns
 summary: Validated Patterns now supports alternatives to both HashiCorp Vault and the External Secrets Operator
 author: Martin Jackson
 blog_tags:
 - patterns
 - secrets
---

# More Secrets Options Now Available with Validated Patterns

## Overview

One of the things about the kubernetes application management experience that
we wanted to explore and improve as part of the Validated Patterns initiative
was the secrets handling in GitOps. So we worked out a scheme that stored
secret material in a dedicated secrets store, using the External Secrets Operator
to project that secret material into the applications using ESO's powerful and
convenient abstraction and templating features. At that time, HashiCorp Vault
was well supported and popular in the community, as was using ESO to retrieve
secrets from it. All of the major hyperscaler keystores are supported (AWS,
Azure, GCP), but multi- or hybrid- cloud solutions that can be "self-contained"
are either less well supported or the solutions themselves lean towards SaaS
offerings.

Almost two years later, the secrets landscape has shifted somewhat. As a Red
Hat project, Validated Patterns initiative gravitates towards Red Hat-supported
solutions, and neither HashiCorp Vault nor ESO are currently Red Hat supported.
Meanwhile, the only backend we provided a code path to drive with ESO was Vault.

This nullifies one of the major reasons we wanted to use ESO in the first place -
namely, the ability to easily swap out secrets backends in case Vault was not
usable for some reason. Earlier in 2023, one of our engineers did a proof of
concept of ESO support using the AWS Secrets Manager backend - demonstrating that
ESO delivered on its promise of multiple secret store support. Adapting ESO was
the easy part - the hard part is building more abstraction into the VP secrets
handling code that runs on pattern install.

To this end, we decided we would expand secrets support by introducing at least
one new backend - and we chose the kubernetes backend, because it is self-contained
(that is, it can be run on-prem and requires no new products or projects to be
installed), and is a useful vehicle for introducing an abstraction layer for
validated patterns secret parsing. In addition, dealing with kubernetes secrets
objects directly has the side effect of enabling us to provide a mechanism for
users to inject their secrets directly into their patterns, bypassing the need
to use any secrets manager or ESO at all. This also provides benefits to installations
where only commercially supported solutions can be installed, since ESO is
currently not commercially supported by any entity.

In a nutshell, the new features depend on an abstraction of secret file parsing, so
that the secrets are held in memory in a datastructure that is then processed and
loaded by the appropriate backend code.

Users of the pattern framework will be able to change secrets backends as straightforwardly
as we can make possible. The only other change the user will need to make (to use another
ESO backend) is to use the backend's mechanism to refer to keys. (For example: in Vault,
keys have have names like `secret/data/global/config-demo`; in the Kubernetes backend
it would just be the secret object name that's being used to store the secret material,
such as `config-demo`).

## Chart changes

The clusterSecretStore related chart elements have moved to
values-global.yaml, specifically `global.secretStore.backend`. For example, from
multicloud-gitops:

```yaml
global:
  pattern: multicloud-gitops
  options:
    useCSV: false
    syncPolicy: Automatic
    installPlanApproval: Automatic
  secretStore:
    backend: kubernetes
```

Previously, the `secretStore` setting was done per-chart; but ordinarily this
setting will hold for the entire cluster, which may include many charts. Because
of this, we will move these settings in our charts. (Older configs will not
break if they still use vault; and it is still an option to override each
chart if you want to do that.)

Individual secret keys used for ESO lookups will need to be overridden or changed
to use the kubernetes backend.

This values-global setting is also used by the Ansible workflow to decide which
backend to inject secrets into.

## The "vault" Backend - Unchanged Interface, New plumbing

The vault support now has a new code path to follow, but supports exactly the same
features in the same ways it always has. Vault is still the default backend for
patterns, and all existing patterns should be able to adopt the new code path without
making any changes. Any other experience is a bug we will fix.

All of the defaults for the new code path are designed to work with existing
vault-based configurations; the new features are entirely optional and we do not
expect breakage or regressions to existing vault-based configurations.

## The "kubernetes" Backend *new*

New features have been introduced to the secrets structure to support the use of the
Kubernetes ESO backend. See the below details for the new options and how they are processed
by the `kubernetes` parsing strategy.

## The "none" Backend *new*

New features have been introduced to the secrets structure to support not using an ESO
ESO backend, but rather injecting secrets objects directly into the pattern. This violates
the spirit of GitOps by not recording the details of the deployment in a versioned way.
However users might want or need to make this tradeoff for different reasons. See the below
details for the new options and how they are processed by the `none` parsing strategy.

At present, any external secret objects will need to be deleted from the repository to use
the `none` backend - since the ArgoCD application will not sync when a non-existing CRD is
referenced.

## How to Use a non-default Backend

We have provided Makefile targets to switch between backends. These targets edit the pattern
configuration files in-place; in keeping with the GitOps philosophy they change the files in
git that control how the application is deployed.

These Makefile targets are:

```text
  secrets-backend-vault                Edits values files to use default Vault+ESO secrets config
  secrets-backend-kubernetes           Edits values file to use Kubernetes+ESO secrets config
  secrets-backend-none                 Edits values files to remove secrets manager + ESO
```

Run the makefile target in your repo to effect the necessary changes. If the command makes changes,
it will display them in `git diff` format, and it will be up to you to commit and push the result
to effect the change. Nothing will change on your cluster until you commit and push.

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

New features have been added at both the file level and the per-secret level
to support the new backends:

### Top-level Additions

#### `secretStoreNamespace`

example:
```yaml
---
version: "2.0"
secretStoreNamespace: 'validated-patterns-secrets'

secrets:
```

A new top-level key has been introduced in the secrets file:
`secretStoreNamespace`. This defaults to `validated-patterns-secrets`. This is
the namespace that ESO uses as its special secret store, which serves the same
architectural purpose as vault does in the default installation. (Secrets are
installed into this namespace as Kubernetes secrets objects, and ESO allows for
them to be copied or templated out using ESO mechanisms).

#### `defaultAnnotations`

example:

```yaml
defaultAnnotations:
  validatedpatterns.io/pattern: 'myPattern'
```

This data structure is a hash, or dictionary. These labels will be applied to all
secrets objects unless they have per-secret annotations set. Labels are only added to
kubernetes based secrets objects (using the `kubernetes` or `none`) backends. The
vault loader ignores these settings.

#### `defaultLabels`

example:

```yaml
defaultLabels:
  patternType: 'edge'
  patternEnvironment: 'production'
```

This data structure is a hash, or dictionary. These labels will be applied to all
secrets objects unless they have per-secret labels set. Labels are only added to
kubernetes based secrets objects (using the `kubernetes` or `none`) backends. The
vault loader ignores these settings.

### Per-secret Additions

#### `targetNamespaces`

example:

```yaml
secrets:
  - name: config-demo
    targetNamespaces:
      - config-demo
    fields:
```

This option is ignored by `vault` and `kubernetes` backends, and only used by the `none` backend.
Normally, you will only need to add your secret to one namespace at a time. However, if you do need
to copy a secret that is identical except for the namespace it goes into, you can add multiple
`targetNamespaces` each namespace specified will get a copy of the secret.

There is not a default target namespace for the none backend, so omitting this field from a config
parsed for the `none` backend is an error.

#### `labels`

example:
```yaml
secrets:
  - name: config-demo
    labels:
      patternType: 'edge'
      patternEnvironment: 'production'
    fields:
```

In this case, these labels will only be applied to any `config-demo` secret objects created
by the framework. This option is only used by the `none` and `kubernetes` backends and
ignored by the `vault` backend. If `defaultLabels` are specified at the top level of the
file, per-secrets labels will override them.

#### `annotations`

example:

```yaml
secrets:
  - name: config-demo
    annotations:
      validatedpatterns.io/pattern: 'myPattern'
    fields:
```

In this case, this annotation will only be applied to any `config-demo` secret objects created
by the framework. This option is only used by the `none` and `kubernetes` backends and
ignored by the `vault` backend. If `defaultAnnotations` are specified at the top level of the
file, per-secrets annotations will override them.

## Under the Hood - Python and Ansible Code

The main changes here were to factor out the code that did the file parsing and actual secret
loading into different modules. The `parse_secrets_info` module now reads all of the file contents
and renders all of the secrets it can before turning the process over to an appropriate secrets
loader.

### The process_secrets playbook

The `process_secrets` understands the backend configured for the different backends from values-global,
and follows the appropriate strategy.

### parse_secrets_info Ansible Module

`parse_secrets_info` understands the different backends, and parses the secrets file into an in-memory
structure that can then be handed over to a loader specific to the backend. There is an additional
script, `common/scripts/process_secrets/display-secrets-info.sh <secrets_file> <backend_type>` that
can be used to view how the secrets are parsed. This will display secrets on the terminal, so use
with caution. It creates a `parsed_secrets` structure that should be generally useful, as well as
`vault_policies` (Specifically for Vault support). Additionally, it creates a `kubernetes_secret_objects`
structure suitable to hand over to the Ansible k8s.core collection directly.

### vault_load_parsed_secrets Ansible Module

`vault_load_parsed_secrets` is responsible for setting up the commands to load the secrets into vault,
and running them.

### The k8s_secret_utils Ansible Role

`k8s_secret_utils` is used for loading both the `kubernetes` and `none` backends. It

### Changes to to vault_utils Ansible Role

Some code has been factored out of `vault_utils` and now lives in roles called `cluster_pre_check` and
`find_vp_secrets` roles. A new task file has been added, `push_parsed_secrets.yaml` that knows how to use
the `parsed_secrets` structure generated by `parse_secrets_info`. The existing code in the other task files
remains.

## Developing a new backend

To provide support for an additional backend, the framework will need changes to:

- The `golang-external-secrets` chart (to support the new provider)
- The shell and ansible framework for loading (understanding the new backend name and
  developing behaviors for it).

## Conclusion

The Validated Patterns framework strives to offer solutions to real-world problems, and we hope you will find
these new features useful. If you run into problems, we will do our best to
[help](https://github.com/validatedpatterns/common/issues)!
