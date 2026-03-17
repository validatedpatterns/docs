---
name: doc-create
description: Create new documentation pages for the validatedpatterns.io site. Supports learn pages and pattern page sets. Generates AsciiDoc files with correct frontmatter, structure, and style-compliant content. Use this skill whenever the user wants to write, draft, scaffold, generate, or create new documentation pages — whether for learn content, patterns, tutorials, or guides. Triggers on requests like "create a new page", "write docs for", "scaffold a pattern", "add a learn page", "generate documentation", or any task involving new .adoc/.md content for the site, even if the user does not name this skill explicitly.
argument-hint: <content-type> <topic-or-name>
---

Create new documentation for the validatedpatterns.io Hugo site. Follow the workflow below precisely.

---

## Step 1: Resolve content type and gather inputs

- If `$ARGUMENTS` is empty, ask the user what content type (`learn` or `pattern`) and topic to create.
- If `$ARGUMENTS` contains a content type and topic, use them directly.

### Learn pages

Collect:
- **title** (required): Page title in sentence-style capitalization.
- **parent menu** (optional): If this is a child page, the parent menu label (e.g. "Patterns quick start"). Leave empty for top-level learn pages.
- **weight** (required): Sort order (10, 20, 30, ...).
- **topic summary**: Brief description of what the page covers — used to generate content.

### Pattern page sets

Collect:
- **pattern name** (required): Lowercase, dash-separated directory name (e.g. `my-new-pattern`).
- **title** (required): Human-readable pattern title.
- **date** (required): Publication date in `YYYY-MM-DD` format.
- **summary** (required): One-sentence pattern description.
- **tier** (required): `sandbox`, `tested`, or `maintained`.
- **rh_products** (required): List of Red Hat products used.
- **industries** (required): List of target industries.
- **partners** (optional): List of partner organizations.
- **GitHub repo URL** (required): Used to populate `links.github` and `links.bugs`.
- **Additional subpages** (optional): Beyond the standard set (getting-started, cluster-sizing, ideas-for-customization, troubleshooting).

## Step 2: Determine format and naming

- **Always use AsciiDoc (`.adoc`)** unless the user explicitly requests Markdown (`.md`).
- File names: lowercase, dash-separated (e.g. `getting-started.adoc`, `cluster-sizing.adoc`).
- Pattern directories: `content/patterns/<pattern-name>/` with `_index.adoc` and subpages.
- Learn pages: `content/learn/<page-name>.adoc`.

## Step 3: Generate files from templates

Read the applicable reference file before generating content:

- **Learn page**: Read [references/learn-page.md](references/learn-page.md) for frontmatter schema, menu hierarchy, and body structure.
- **Pattern page set**: Read [references/pattern-set.md](references/pattern-set.md) for index frontmatter schema, standard subpages, and body templates.

### Generation rules

1. Create files using the template structure, substituting the gathered metadata.
2. For patterns, create the full standard page set:
   - `_index.adoc` — pattern overview
   - `getting-started.adoc` (weight 10) — prerequisites and deployment procedure
   - `cluster-sizing.adoc` (weight 20) — resource requirements
   - `ideas-for-customization.adoc` (weight 30) — customization suggestions
   - `troubleshooting.adoc` (weight 40) — common issues and solutions
   - Plus any additional subpages requested by the user.
3. For AsciiDoc files, always include these attributes at the top of the body:
   ```
   :toc:
   :imagesdir: /images
   :_content-type: ASSEMBLY
   include::modules/comm-attributes.adoc[]
   ```
4. **Write real content** based on the topic — not just placeholder comments. Draft substantive sections that the user can refine. Use shared AsciiDoc attributes from `modules/comm-attributes.adoc` instead of hard-coding product names.
5. Use `[id="section-id"]` anchors before major AsciiDoc sections.

## Step 4: Style review using doc-review guides

After generating the files, perform a comprehensive style review using the doc-review guide files. Read the relevant guides from `../doc-review/guides/` and check the generated content against them. The two-pass approach from doc-review applies here: scan the generated content first, then load only the guides whose rules are relevant.

**Important**: Because skills cannot invoke other skills directly, perform the review inline by reading the guide files yourself rather than trying to call the doc-review skill. The guides live at `../doc-review/guides/` relative to this skill's directory.

For each generated file:
1. Scan for likely violations (contractions, passive voice, title case, banned words, etc.).
2. Read the matching guide files from `../doc-review/guides/`.
3. Apply must-fix issues automatically.
4. Present recommended improvements to the user for their decision.

## Step 5: Present results

After generating and validating, present:
1. A file list with full paths and a one-line description of each file.
2. Any style fixes that were applied during generation and review.
3. Suggested next steps (e.g. adding images, creating reusable modules, running `make serve` to preview).
