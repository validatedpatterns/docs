# Pattern page set reference

A pattern page set lives in `content/patterns/<pattern-name>/` and consists of an index page plus standard subpages.

## Index page: `_index.adoc`

### Frontmatter

```yaml
---
title: Pattern Title
date: 2025-10-24
tier: sandbox
summary: One-sentence description of what this pattern does.
rh_products:
  - Red Hat OpenShift Container Platform
industries:
  - General
partners:
  - Partner Name
aliases: /pattern-name/
pattern_logo: pattern-name.png
links:
  github: https://github.com/validatedpatterns/pattern-name
  install: getting-started
  bugs: https://github.com/validatedpatterns/pattern-name/issues
  feedback: https://docs.google.com/forms/d/e/1FAIpQLScI76b6tD1WyPu2-d_9CCVDr3Fu5jYERthqLKJDUGwqBg7Vcg/viewform
---
```

### Required fields

| Field | Description |
|---|---|
| `title` | Human-readable pattern name |
| `date` | Publication date (`YYYY-MM-DD`) |
| `tier` | `sandbox`, `tested`, or `maintained` |
| `summary` | One-sentence description |
| `rh_products` | List of Red Hat products |
| `industries` | List of target industries |
| `links.github` | GitHub repository URL |
| `links.install` | Slug of the getting-started page (no extension) |
| `links.bugs` | GitHub issues URL |
| `links.feedback` | Feedback form URL (use the standard Google Form URL above) |

### Optional fields

| Field | When to use |
|---|---|
| `partners` | Pattern involves partner technology |
| `pattern_logo` | Logo image filename (placed in `static/images/`) |
| `ci` | CI identifier (maintained patterns only) |
| `validated` | Set to `false` for unvalidated sandbox patterns |
| `variant_of` | Parent pattern name if this is a variant (e.g. `variant_of: multicloud-gitops`) |
| `links.arch` | Architecture diagram URL |

### AsciiDoc body

```asciidoc
:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

Overview paragraph describing the pattern, its purpose, and the problem it solves. Focus on what the user can accomplish.

== Background

Explain the business or technical context that motivates this pattern.

== Next steps

* link:getting-started[Getting started]
* link:cluster-sizing[Cluster sizing]
```

---

## Standard subpages

### `getting-started.adoc` (weight 10)

```yaml
---
title: Getting started
weight: 10
aliases: /pattern-name/getting-started/
---
```

```asciidoc
:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

[id="deploying-pattern-name"]
== Deploying the pattern

.Prerequisites

* An OpenShift cluster
** To create an OpenShift cluster, go to the https://console.redhat.com/[Red Hat Hybrid Cloud console] and select *Services -> Containers -> Create cluster*.
** The cluster must have a dynamic `StorageClass` to provision `PersistentVolumes`.
** link:../cluster-sizing[Cluster sizing] requirements.
* https://validatedpatterns.io/learn/quickstart/[Install the tooling dependencies].

.Procedure

. Fork the https://github.com/validatedpatterns/pattern-name[pattern-name] repository on GitHub.

. Clone the forked repository:
+
[source,terminal]
----
$ git clone git@github.com:<your-organization>/pattern-name.git
----

. Change to the pattern directory:
+
[source,terminal]
----
$ cd pattern-name
----

. Deploy the pattern:
+
[source,terminal]
----
$ ./pattern.sh make install
----

[id="next-steps"]
== Next steps

* link:../ideas-for-customization[Ideas for customization]
* link:../troubleshooting[Troubleshooting]
```

### `cluster-sizing.adoc` (weight 20)

```yaml
---
title: Cluster sizing
weight: 20
aliases: /pattern-name/cluster-sizing/
---
```

```asciidoc
:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

[id="cluster-sizing"]
== Cluster sizing for pattern-name

The minimum requirements for running this pattern are listed in the following table.

.Minimum cluster requirements
[options="header"]
|===
| Node role | Count | CPU | Memory | Storage
| Control plane | 3 | 4 vCPU | 16 GB | 100 GB
| Worker | 3 | 8 vCPU | 32 GB | 200 GB
|===

[NOTE]
====
These are minimum requirements. Production deployments may require additional resources depending on workload.
====
```

### `ideas-for-customization.adoc` (weight 30)

```yaml
---
title: Ideas for customization
weight: 30
aliases: /pattern-name/ideas-for-customization/
---
```

```asciidoc
:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

[id="ideas-for-customization"]
== Ideas for customizing the pattern

This pattern can be extended and adapted for different use cases.

=== Adding additional applications

You can deploy additional applications by editing the `values-hub.yaml` file and adding entries under the `applications` section.

=== Modifying the GitOps configuration

You can adjust the ArgoCD application settings by modifying the Helm chart values in the pattern repository.

[id="next-steps"]
== Next steps

* link:../getting-started[Getting started]
* link:../troubleshooting[Troubleshooting]
```

### `troubleshooting.adoc` (weight 40)

```yaml
---
title: Troubleshooting
weight: 40
aliases: /pattern-name/troubleshooting/
---
```

```asciidoc
:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

[id="troubleshooting"]
== Troubleshooting the pattern

[id="common-issues"]
=== Checking the deployment status

To verify that all components deployed successfully, run:

[source,terminal]
----
$ oc get pods -A | grep -v Running | grep -v Completed
----

[id="reviewing-logs"]
=== Reviewing application logs

To check the logs of a specific application pod:

[source,terminal]
----
$ oc logs -n <namespace> <pod-name>
----

[id="known-issues"]
=== Known issues

List any known issues and workarounds here.
```

---

## Naming conventions

Two naming styles are used across existing patterns:

| Style | Example | When to use |
|---|---|---|
| Short names | `getting-started.adoc` | Preferred for new patterns |
| Prefixed names | `mcg-getting-started.adoc` | When the pattern has a well-known abbreviation |

If using prefixed names, apply the prefix consistently to all subpages.

## Markdown variants

When the user explicitly requests Markdown, use `.md` extensions and adapt the body:

- Replace AsciiDoc attributes with standard Markdown syntax.
- Use `#`, `##`, `###` headings instead of `=`, `==`, `===`.
- Use fenced code blocks with language identifiers instead of `[source,...]` blocks.
- Use standard Markdown lists instead of AsciiDoc ordered (`.`) and continuation (`+`) syntax.
- Use `_index.md` for the index page.
- Hugo shortcodes (`{{< note >}}`, `{{< warning >}}`) replace AsciiDoc admonitions (`[NOTE]`, `[WARNING]`).
