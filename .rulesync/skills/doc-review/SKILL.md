---
name: doc-review
description: Review and fix documentation files against Red Hat/IBM Style Guide rules. Supports both AsciiDoc (.adoc) and Markdown (.md, .markdown) files with format-aware rule application. Use this skill whenever the user asks to check, lint, proofread, review, or audit any documentation for style guide compliance, writing quality, or consistency. Triggers on requests like "review this doc", "check my writing", "fix style issues", "is this style-compliant", or any mention of Red Hat/IBM style guide rules — even if the user does not name this skill explicitly.
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

## Step 2: Detect format and scan for likely violations (two-pass strategy)

For each file, detect the format by extension:

| Extension | Format |
|---|---|
| `.adoc` | AsciiDoc |
| `.md`, `.markdown` | Markdown |

### Pass 1: Quick scan and guide selection

Read the file and scan for signals that indicate which rules are likely violated. Then load only the guides that are relevant, rather than all 24. This keeps reviews efficient without sacrificing coverage.

**Always load these high-impact guides first** (they catch the most common issues):

| Priority | Guide file | Topic | Load when you see... |
|---|---|---|---|
| P1 | `guides/minimalism.md` | Conciseness, scannability, removing fluff | Long paragraphs, "in order to", "this section describes", filler adverbs |
| P2 | `guides/passive-voice.md` | Prefer active voice | "is/are/was/were/been + past participle", "can be", "should be" |
| P3 | `guides/avoid-these-words.md` | Full banned words table | Any uncertain word choice |
| P4 | `guides/capitalization.md` | Sentence-style capitalization | Title-case headings |
| P5 | `guides/titles-and-headings.md` | Gerunds for procedures, nouns for concepts | Procedural headings that don't start with a gerund |
| P6 | `guides/contractions.md` | Avoid contractions | Apostrophes in words (don't, won't, it's, you'll) |
| P7 | `guides/conscious-language.md` | Inclusive terminology | whitelist, blacklist, master, slave, sanity |
| P8 | `guides/anthropomorphism.md` | No human traits for products | "system knows", "tries to", "smart enough" |

**Load these additional guides only when the scan reveals matching patterns:**

| # | Guide file | Topic | Load when you see... |
|---|---|---|---|
| 9 | `guides/future-tense.md` | Prefer present tense | "will", "shall", "going to" |
| 10 | `guides/phrasal-verbs.md` | Replace with single-word verbs | "set up", "figure out", "carry out", "turn on" |
| 11 | `guides/colons-and-semicolons.md` | Colon and semicolon usage | Colons or semicolons in the text |
| 12 | `guides/commas-restrictive-nonrestrictive.md` | Which vs. that, comma rules | "which" without a comma, or "that" with a comma |
| 13 | `guides/possessives-and-apostrophes.md` | No 's on product/brand names | Possessive forms on product names (e.g. "OpenShift's") |
| 14 | `guides/incomplete-sentences.md` | Complete sentences before lists | Text immediately followed by a list without a lead-in sentence |
| 15 | `guides/parallelism.md` | Consistent grammatical structure in lists | Bulleted or numbered lists |
| 16 | `guides/unordered-lists.md` | Bulleted list conventions | Bulleted lists |
| 17 | `guides/single-step-procedures.md` | Bullet not numbered for single steps | Numbered lists with only one item |
| 18 | `guides/optional-and-conditional-steps.md` | "Optional:" and "If" prefixes | Steps marked as optional or conditional |
| 19 | `guides/inline-links.md` | Link text, "about" not "on", no "Click here" | Hyperlinks in the text |
| 20 | `guides/screen-captures.md` | Avoid unnecessary screenshots | Images or screenshots |
| 21 | `guides/ui-elements.md` | Bold GUI names, correct verbs per element | UI element references (buttons, menus, dialogs) |
| 22 | `guides/command-line.md` | Command verbs, monospace, replaceable values | Command-line examples or terminal blocks |

### Format-specific guides — apply ONLY to matching format

| # | Guide file | Applies to | Topic | Load when... |
|---|---|---|---|---|
| 23 | `guides/asciidoc-specific.md` | AsciiDoc only | Admonitions, attributes, user-replaceable values, module descriptions, cross-references | Always load for `.adoc` files. **SKIP entirely for Markdown files.** |
| 24 | `guides/markdown-specific.md` | Markdown only | Heading syntax, bold/italic, links, images, code blocks, list conventions | Always load for `.md`/`.markdown` files. **SKIP entirely for AsciiDoc files.** |

### Pass 2: Deep review

Read the selected guide files, then perform the detailed review in Step 3.

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
- Red Hat Supplementary Style Guide: https://redhat-documentation.github.io/supplementary-style-guide/ssg.md
- Merriam-Webster Dictionary for spelling
