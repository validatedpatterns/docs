---
name: doc-create
description: Create new documentation pages for the validatedpatterns.io site. Supports learn pages and pattern page sets. Generates AsciiDoc files with correct frontmatter, structure, and style-compliant content. Use when creating new docs, pages, patterns, or learn content.
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

## Step 4: Quick style check

Before presenting the result, read these high-impact style guides from `../doc-review/guides/` and verify the generated content complies:

| Priority | Guide | Key check |
|---|---|---|
| 1 | `titles-and-headings.md` | Gerund headings for procedures, noun phrases for concepts |
| 2 | `capitalization.md` | Sentence-style capitalization in all headings |
| 3 | `minimalism.md` | No self-referential text, no fluff, concise sentences |
| 4 | `passive-voice.md` | Active voice in instructions |
| 5 | `future-tense.md` | Present tense throughout |
| 6 | `contractions.md` | No contractions |
| 7 | `avoid-these-words.md` | No banned words |
| 8 | `conscious-language.md` | Inclusive terminology |

Fix any violations in the generated files before presenting them.

## Step 5: Full style review with doc-review

After generating the files, run the **doc-review** skill against all created files for a comprehensive review using the full set of 24 style guides. This catches issues beyond the quick check in Step 4 (e.g. phrasal verbs, comma usage, possessives, link text, UI element formatting, command-line conventions, and format-specific rules).

Invoke the doc-review skill with the path to the created files:
- For a learn page: pass the single file path (e.g. `content/learn/page-name.adoc`).
- For a pattern page set: pass the pattern directory (e.g. `content/patterns/pattern-name/`).

Apply must-fix issues automatically. Present recommended improvements to the user for their decision.

### Output summary

After generating and validating, present:
1. A file list with full paths and a one-line description of each file.
2. Any style fixes that were applied during generation and review.
3. Suggested next steps (e.g. adding images, creating reusable modules, running `make serve` to preview).
