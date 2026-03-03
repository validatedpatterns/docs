---
name: doc-review
description: Review and fix documentation files against Red Hat/IBM Style Guide rules. Supports both AsciiDoc (.adoc) and Markdown (.md, .markdown) files with format-aware rule application.
argument-hint: <file-or-directory>
claudecode:
  allowed-tools:
    - Glob
    - Grep
    - Read
    - Edit
---

Review the documentation file(s) at `$ARGUMENTS` for compliance with the Red Hat/IBM Style Guide. Follow the workflow below precisely.

---

## Step 1: Resolve targets

- If `$ARGUMENTS` is empty, ask the user which file(s) or directory to review.
- If `$ARGUMENTS` is a **directory**, recursively glob for all `*.adoc`, `*.md`, and `*.markdown` files.
- If `$ARGUMENTS` is a **file**, use it directly.
- If no matching files are found, inform the user and stop.

## Step 2: Detect format and load rules

For each file, detect the format by extension:

| Extension | Format |
|---|---|
| `.adoc` | AsciiDoc |
| `.md`, `.markdown` | Markdown |

**Read each applicable guide file** listed below for the detailed rules, DO/DON'T examples, and severity levels before reviewing.

### Universal guides — apply to ALL formats

| # | Guide file | Topic |
|---|---|---|
| 1 | `guides/anthropomorphism.md` | No human traits for products |
| 2 | `guides/passive-voice.md` | Prefer active voice |
| 3 | `guides/future-tense.md` | Prefer present tense |
| 4 | `guides/phrasal-verbs.md` | Replace with single-word verbs |
| 5 | `guides/contractions.md` | Avoid contractions |
| 6 | `guides/avoid-these-words.md` | Full banned words table |
| 7 | `guides/conscious-language.md` | Inclusive terminology (blocklist/allowlist, primary/secondary) |
| 8 | `guides/colons-and-semicolons.md` | Colon and semicolon usage |
| 9 | `guides/commas-restrictive-nonrestrictive.md` | Which vs. that, comma rules |
| 10 | `guides/possessives-and-apostrophes.md` | No 's on product/brand names |
| 11 | `guides/titles-and-headings.md` | Gerunds for procedures, nouns for concepts |
| 12 | `guides/capitalization.md` | Sentence-style capitalization |
| 13 | `guides/incomplete-sentences.md` | Complete sentences before lists |
| 14 | `guides/parallelism.md` | Consistent grammatical structure in lists |
| 15 | `guides/unordered-lists.md` | Bulleted list conventions |
| 16 | `guides/single-step-procedures.md` | Bullet not numbered for single steps |
| 17 | `guides/optional-and-conditional-steps.md` | "Optional:" and "If" prefixes |
| 18 | `guides/inline-links.md` | Link text, "about" not "on", no "Click here" |
| 19 | `guides/screen-captures.md` | Avoid unnecessary screenshots |
| 20 | `guides/ui-elements.md` | Bold GUI names, correct verbs per element |
| 21 | `guides/command-line.md` | Command verbs, monospace, replaceable values |
| 22 | `guides/minimalism.md` | Conciseness, scannability, customer focus, removing fluff |

### Format-specific guides — apply ONLY to matching format

| # | Guide file | Applies to | Topic |
|---|---|---|---|
| 23 | `guides/asciidoc-specific.md` | AsciiDoc only | Admonitions, attributes, user-replaceable values, module descriptions, cross-references. **SKIP entirely for Markdown files.** |
| 24 | `guides/markdown-specific.md` | Markdown only | Heading syntax, bold/italic, links, images, code blocks, list conventions. **SKIP entirely for AsciiDoc files.** |

## Step 3: Review (Phase 1)

For each file, read the entire file and identify all style violations. Organize findings using this format:

---

### Documentation review: `<filename>`

**Format detected**: AsciiDoc | Markdown
**Summary**: X issues found (Y must-fix, Z recommended)

#### Must-fix issues

**Rule name** (N issues)

1. **Line N**: `problematic text` → `suggested fix`
   _Guide: guide-file-name.md_

#### Recommended improvements

**Rule name** (N issues)

1. **Line N**: `problematic text` → `suggested fix`
   _Guide: guide-file-name.md_

---

### Severity classification

- **Must-fix**: Violations of core style rules — anthropomorphism, passive voice in instructions, future tense (when present works), banned words marked "Never", incorrect which/that usage, possessives on product names, title case headings, non-parallel lists, incomplete sentences, "Click here" links, conscious language violations, incorrect UI verbs, single-step numbered lists, unclear or ambiguous content (minimalism)
- **Recommended**: Lower-priority improvements — phrasal verbs, link placement, screenshot usage, minor phrasing, admonition density, formatting consistency, conciseness (redundant phrases, self-referential text, obvious statements, fluff, long sentences, scannability)

## Step 4: Fix (Phase 2)

After presenting the review for all files, ask:

> **Would you like me to apply these fixes?** Options:
> 1. Apply all fixes
> 2. Apply must-fix only
> 3. Let me choose which to apply
> 4. No, just keep the report

If the user approves fixes, edit the files to resolve the selected issues. After applying fixes, summarize what was changed.

## References

For detailed guidance, consult:
- IBM Style Guide
- Red Hat Supplementary Style Guide: https://redhat-documentation.github.io/supplementary-style-guide
- Merriam-Webster Dictionary for spelling
