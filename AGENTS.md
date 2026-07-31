# AGENTS.md

This file helps AI agents understand the structure, tooling, and conventions of the
Validated Patterns documentation repository so they can make correct, buildable changes.
For creating or reviewing documentation content, use the skills under `.rulesync/skills/`
(see [AI documentation skills](#ai-documentation-skills)).

## Project Overview

This is the documentation site for [validatedpatterns.io](https://validatedpatterns.io),
built with **Hugo** (static site generator) and the **PatternFly** theme. Content is
authored in both **AsciiDoc** (rendered by Asciidoctor with Rouge syntax highlighting) and
**Markdown** (rendered by Goldmark). There is no JavaScript framework, no TypeScript, and
no `package.json` at the repository root.

## Repository Layout

```
content/          Site content organized by section (blog/, ci/, contribute/, learn/, patterns/, search/)
modules/          Reusable AsciiDoc modules and pattern metadata (included via include::)
layouts/          Hugo templates, partials (layouts/partials/), and shortcodes (layouts/shortcodes/)
archetypes/       Hugo content scaffolds for new pages (blog, learn, contribute, pattern)
themes/patternfly/  Vendored PatternFly theme — do NOT edit
static/           Static assets (CSS, JS, images, videos)
assets/           Hugo asset pipeline (images)
utils/            Ruby scripts (e.g. flatten_yaml.rb for pattern metadata)
.rulesync/skills/ AI agent skills for creating and reviewing documentation (source of truth)
config.yaml       Main Hugo configuration
Makefile          Build, serve, and test commands
```

## AI documentation skills

This repository includes agent skills under `.rulesync/skills/`. These are the **required**
workflows for creating and reviewing documentation. Do **not** free-form invent page
structure, frontmatter, or style rules when these skills apply — read the skill file first
and follow it precisely.

Skills may also be synced into editor-specific locations (for example `.claude/skills/` or
Cursor skills) via [rulesync](https://www.npmjs.com/package/rulesync). Prefer the skill when
it is available in the agent environment; if it is not loaded, read the source files under
`.rulesync/skills/` directly and execute the same workflow.

| Skill | Path | Use when |
|---|---|---|
| **doc-create** | `.rulesync/skills/doc-create/SKILL.md` | Creating, drafting, scaffolding, or generating new documentation (learn pages, pattern page sets, tutorials, guides, or other new `.adoc`/`.md` site content) |
| **doc-review** | `.rulesync/skills/doc-review/SKILL.md` | Reviewing, proofreading, linting, or auditing existing documentation for Red Hat/IBM style compliance |

### Mandatory routing for documentation requests

1. **Generate / create / write / scaffold / draft new docs** → Use **doc-create**.
   - Read `.rulesync/skills/doc-create/SKILL.md` immediately.
   - Follow its steps (resolve content type, gather inputs, use references, generate files).
   - Load the applicable reference under `.rulesync/skills/doc-create/references/` before writing.
   - After generation, perform the style review step described in that skill (using
     `.rulesync/skills/doc-review/guides/` as instructed).

2. **Review / check / fix style / audit docs** → Use **doc-review**.
   - Read `.rulesync/skills/doc-review/SKILL.md` immediately.
   - Follow its two-pass guide selection and review/fix workflow.
   - Load only the relevant guides from `.rulesync/skills/doc-review/guides/`.

3. If the user asks for both creation and review, run **doc-create** first, then
   **doc-review** on the generated files (or complete the inline review step inside
   doc-create, then offer a fuller doc-review pass if useful).

4. Do not skip these skills just because the user did not name them. Trigger phrases
   include “generate documentation”, “create a page”, “write docs for”, “scaffold a
   pattern”, “review this doc”, “check style”, and similar requests.

## Building and Serving Locally

All build commands use Podman to run a container with Hugo and Asciidoctor pre-installed.

| Command | Purpose |
|---|---|
| `make serve` | Build and serve locally at http://localhost:4000 (preferred) |
| `make build` | Build the site into `public/` |
| `make test` | Build and run link checking (htmltest) |
| `make clean` | Remove generated files |

The container image is `quay.io/validatedpatterns/homepage-container:main`.

Alternatively, install Hugo and Asciidoctor locally and run `hugo server` (serves at
http://localhost:1313).

## Content Authoring Conventions

### Formats

Both `.adoc` (AsciiDoc) and `.md` (Markdown) files are used throughout the site. Either
format is acceptable for new content. When editing existing content, match the format
already used in that section.

- AsciiDoc is predominant in `learn/`, `contribute/`, and `modules/`.
- Markdown is common in `patterns/` and `blog/`.

### Frontmatter

All content files use YAML frontmatter between `---` delimiters. Fields vary by section:

**Patterns** (`content/patterns/<name>/_index.md` or `_index.adoc`):

```yaml
---
title: Pattern Name
date: 2025-10-24
summary: Short description of the pattern
tier: sandbox          # sandbox | tested | maintained
rh_products:
  - Red Hat OpenShift Container Platform
industries:
  - General
partners:
  - Partner Name
links:
  install: getting-started
  bugs: https://github.com/...
  feedback: https://docs.google.com/...
---
```

**Blog** (`content/blog/`):

```yaml
---
title: Blog Post Title
date: 2024-07-12
summary: Short description
author: Author Name
blog_tags:
  - patterns
  - git
---
```

**Learn / Contribute**:

```yaml
---
title: Page Title
layout: default
menu: learn
weight: 10
---
```

### Naming Conventions

- **Index pages**: Must be `_index.md` or `_index.adoc`.
- **File names**: Lowercase, dash-separated (e.g. `getting-started.adoc`, `cluster-sizing.md`).
- **Directory names**: Lowercase, dash-separated (e.g. `multicloud-gitops`, `rag-llm-cpu`).

### Markdown Conventions

- Standard Goldmark-rendered Markdown (Hugo's default).
- Use Hugo shortcodes for alerts and UI elements (see Hugo Shortcodes below).
- Use fenced code blocks with language identifiers (e.g. ` ```yaml `, ` ```bash `).
- Raw HTML is technically allowed (unsafe Goldmark rendering is enabled) but discouraged.

### AsciiDoc Conventions

- Every `.adoc` file should declare a `:_content-type:` attribute: `ASSEMBLY`, `CONCEPT`,
  `PROCEDURE`, or `REFERENCE` (per Red Hat modular documentation conventions).
- Reuse content via `include::modules/<module>.adoc[leveloffset=+1]`.
- Use `[source,terminal]` for shell commands and `[source,yaml]`, `[source,go]`, etc. for
  code blocks.
- Shared attributes (product names, abbreviations) are defined in
  `modules/comm-attributes.adoc`. Use these instead of hard-coding brand names.

### Hugo Shortcodes

These shortcodes are available in both `.md` and `.adoc` files (defined in
`layouts/shortcodes/`):

| Shortcode | Purpose |
|---|---|
| `note` | Info alert box (accepts `title` param and body content) |
| `warning` | Warning alert box |
| `danger` | Danger alert box |
| `button` | Link button (`text`, `url`, `color-class` params) |
| `iframe` | Embedded iframe |
| `rawhtml` | Raw HTML pass-through |

### Archetypes

Use `hugo new` with archetypes in `archetypes/` to scaffold new content (blog posts,
learn pages, contribute pages, or full pattern page sets).

## Writing Style Guidelines

See `modules/doc-guidelines.adoc` for the full documentation style guide.
When reviewing or fixing style in existing files, use the **doc-review** skill
(`.rulesync/skills/doc-review/SKILL.md`) rather than applying these rules ad hoc.

- Follow the [Red Hat Supplementary Style Guide](https://redhat-documentation.github.io/supplementary-style-guide/ssg.md) and [IBM Style](https://www.ibm.com/docs/en/ibm-style).
- Use present tense, active voice, and second person ("you").
- Sentence-style capitalization in titles and headings.
- Use gerund-form headings for procedures ("Creating", "Managing", "Using").
- Use noun phrases for non-procedure headings.
- Use **bold** for clickable UI elements.
- Use `monospace` for code, file paths, IP addresses, ports, HTTP verbs, and status codes.

## Quality Checks

| Check | Command | Config |
|---|---|---|
| Link checking | `make htmltest` | `.htmltest.yml` |
| Spellcheck | `make spellcheck` | `.spellcheck.yml`, `.wordlist.txt` |
| Super-Linter | `make super-linter` | `.github/workflows/superlinter.yml` |
| Secret scanning | (runs in CI) | `.github/linters/.gitleaks.toml` |
| Prose linting (Vale) | (runs in CI on PRs) | `utils/vale-pr-comments.sh` |

When adding new technical terms that fail spellcheck, add them to `.wordlist.txt` (sorted,
lowercase, no duplicates). Run `make lintwordlist` to normalize the file.

## CI/CD Workflows

| Workflow | File | Trigger |
|---|---|---|
| Deploy to GitHub Pages | `.github/workflows/gh-pages.yml` | Push to `main` |
| Super-Linter | `.github/workflows/superlinter.yml` | Push and pull request |
| Link checking | `.github/workflows/htmltest.yml` | Scheduled daily |
| Pattern metadata sync | `.github/workflows/metadata-docs.yml` | workflow_call from pattern repos |

## Things to Avoid

- Do **not** edit files under `themes/patternfly/` (vendored theme).
- Do **not** edit or commit files under `public/` (generated build output, gitignored).
- Do **not** commit `.vale.ini` or `.vale/` (gitignored, local-only config).
- Do **not** hard-code brand or product names that are already defined as attributes in
  `modules/comm-attributes.adoc`; use the AsciiDoc attributes instead.
- Do **not** invent documentation scaffolds or style-review workflows when
  **doc-create** or **doc-review** applies — use those skills instead.
