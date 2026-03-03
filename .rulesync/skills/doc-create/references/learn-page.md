# Learn page reference

## Frontmatter

### Top-level learn page

```yaml
---
menu: learn
title: Page title in sentence case
weight: 10
aliases: /learn/page-name/
---
```

### Child learn page (nested under a parent)

```yaml
---
menu:
  learn:
    parent: Parent Menu Label
title: Page title in sentence case
weight: 20
aliases: /learn/page-name/
---
```

### Optional fields

| Field | When to use |
|---|---|
| `layout: default` | Only if the page needs a non-standard layout (e.g. landing pages like `quickstart.adoc`) |
| `aliases` | Add an alias matching the old URL if migrating content, or `/learn/<page-name>/` for clean URLs |

### Known parent menu labels

These parent labels exist in the current site — use them exactly as shown when creating child pages:

- `Patterns quick start`
- `Validated patterns frameworks`

## AsciiDoc body template

```asciidoc
---
menu: learn
title: Page title
weight: 10
---

:toc:
:imagesdir: /images
:_content-type: ASSEMBLY
include::modules/comm-attributes.adoc[]

[id="page-anchor-id"]
= Page title

Introductory paragraph explaining the purpose and scope of this page. Focus on what the user can accomplish.

[id="first-section"]
== First section heading

Content here. Use:

* Bulleted lists for related items.
* `[source,terminal]` blocks for commands.
* `.Prerequisites` and `.Procedure` labels for procedural sections.

[id="second-section"]
== Second section heading

Additional content.
```

### Procedural section example

```asciidoc
[id="deploying-the-component"]
== Deploying the component

.Prerequisites

* An OpenShift cluster with dynamic `StorageClass` provisioning.
* The `oc` CLI installed and authenticated.

.Procedure

. Clone the repository:
+
[source,terminal]
----
$ git clone <repo-url>
----

. Change to the project directory:
+
[source,terminal]
----
$ cd <project-dir>
----

. Deploy the pattern:
+
[source,terminal]
----
$ ./pattern.sh make install
----
```

### Concept section example

```asciidoc
[id="benefits-of-gitops"]
== Benefits of GitOps

GitOps provides the following advantages:

* **Declarative configuration**: The desired state is stored in Git.
* **Auditability**: Every change is tracked through Git history.
* **Automation**: Changes are automatically applied by the GitOps operator.
```

## Markdown body template

Use only when the user explicitly requests Markdown.

```markdown
---
menu: learn
title: Page title
weight: 10
---

# Page title

Introductory paragraph explaining the purpose and scope of this page.

## First section heading

Content here.

## Second section heading

Additional content.
```

## Naming conventions

- File names: lowercase, dash-separated (e.g. `getting-started-with-gitops.adoc`).
- Placed directly in `content/learn/` (flat structure, no subdirectories).
- Use descriptive names that reflect the content (e.g. `secrets-management.adoc`, not `secrets.adoc`).
