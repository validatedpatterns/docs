# AsciiDoc-Specific Rules

Format applicability: [AsciiDoc only]

These rules apply only to `.adoc` files. Skip all rules in this guide when reviewing Markdown files.

## Admonitions

### Valid admonition types

| Type | Purpose |
|---|---|
| NOTE | Additional guidance or advice that improves configuration, performance, or supportability. |
| IMPORTANT | Advisory information essential to task completion. Users must not disregard. |
| WARNING | Potential system damage, data loss, or support issues. Explain problem, cause, and solution. |
| TIP | Alternative methods or non-obvious techniques. Not essential to using the product. |

### Rules
- Do NOT use `CAUTION` — it is not fully supported by the Red Hat Customer Portal.
- Keep admonitions **short and concise**.
- Do NOT include procedures inside an admonition.
- Avoid placing **multiple admonitions close together**. Restructure by moving less-important content into the main text.
- Use only **singular** admonition labels (e.g., `NOTE`, never `NOTES`).
- Do NOT start a module or assembly with an admonition. Always include a short description first.

### Correct AsciiDoc syntax

```asciidoc
[NOTE]
====
Text for note.
====
```

**Severity**: Must-fix for CAUTION usage, procedures in admonitions, or missing short descriptions. Recommended for admonition density.

## Product Name and Version Attributes

Use shared AsciiDoc attributes from `modules/comm-attributes.adoc` instead of hard-coding product names and versions.

### Rules
- Every `.adoc` content file should include the shared attributes file:
  ```asciidoc
  include::modules/comm-attributes.adoc[]
  ```
- Use the attribute form for all product and pattern names, operator names, platform names, and versions defined in `modules/comm-attributes.adoc`.
- Hard-code versions only when they refer to a specific, unchanging version (e.g., "introduced in version 3.2").

### Review procedure
1. Read `modules/comm-attributes.adoc` to build a lookup of defined attributes and their values.
2. Scan the reviewed file for any hard-coded string that matches a defined attribute value.
3. Flag each match and suggest the attribute replacement.

### Common attributes to check for

| Hard-coded string | Use instead |
|---|---|
| Red Hat OpenShift Container Platform | `{rh-ocp}` or `{ocp}` |
| Red Hat Advanced Cluster Management | `{rh-rhacm-first}` (first use) or `{rh-rhacm}` |
| Red Hat OpenShift GitOps | `{rh-gitops}` or `{rh-gitops-short}` |
| Red Hat Ansible Automation Platform | `{rh-ansible}` or `{ansible}` |
| Red Hat OpenShift Data Foundation | `{rh-ocp-data-first}` or `{ocp-data-short}` |
| Red Hat Enterprise Linux | `{rhel-first}` (first use) or `{rhel-short}` |
| Validated Patterns | `{solution-name-upstream}` |
| Validated Patterns Operator | `{validated-patterns-op}` |
| HashiCorp Vault | `{hashicorp-vault}` or `{hashicorp-vault-short}` |
| OpenShift Virtualization | `{VirtProductName}` |
| Pattern names (e.g. "Multicloud GitOps pattern") | `{mcg-pattern}`, `{med-pattern}`, `{ie-pattern}`, etc. |

This table covers the most common attributes. Always consult `modules/comm-attributes.adoc` for the full list, as new attributes are added over time.

### Missing include directive
If a file does not include `modules/comm-attributes.adoc` but uses or should use attributes, flag the missing include as a must-fix.

**Severity**: Must-fix for missing `include::modules/comm-attributes.adoc[]`. Recommended for hard-coded names or versions that have a defined attribute.

## User-Replaceable Values

### Standard format (non-XML)
- Surround with angle brackets: `<value_name>`
- Separate multi-word values with underscores
- Lowercase unless context requires otherwise
- Use italic monospace formatting

#### In paragraphs
```asciidoc
Create an Ansible inventory file that is named `/_<path>_/inventory/hosts`.
```

#### In code blocks
Use `subs="+quotes"` or `subs="normal"` to enable formatting inside code blocks:
```asciidoc
[subs="+quotes"]
----
$ *oc describe node __<node_name>__*
----
```

### XML format
For XML code blocks, use `${value_name}` instead of `<value_name>`:
```asciidoc
[source,xml,subs="+quotes"]
----
<ipAddress>__${ip_address}__</ipAddress>
----
```

**Flag**: User-replaceable values without italic formatting, without angle brackets, or using inconsistent naming (camelCase instead of snake_case).

**Severity**: Must-fix for missing formatting. Recommended for naming consistency.

## Module Short Descriptions

Every module and assembly must include a short description (abstract) between the title and main content.

### Rules
- At least 2-3 sentences.
- Include user intent: what users must do and why.
- Ensure the product name appears in the title or short description.
- Use active voice and present tense.
- Avoid self-referential language ("This topic covers...", "Use this procedure to...").
- Avoid feature-focused language ("This product allows you to...").
- Use customer-centric language ("You can... by..." or "To..., configure...").

**Severity**: Must-fix if missing entirely. Recommended for content improvements.

## Cross-References

### Internal cross-references
```asciidoc
For more information about <topic>, see xref:<link>[<link_text>].
```

### External links
```asciidoc
For more information about <topic>, see link:<url>[<link_text>].
```

### Rules
- Include cross-references only when necessary.
- If information is critical, include it directly instead of cross-referencing.
- Do NOT use bare URLs — always provide descriptive link text.
- Do NOT use URL shorteners.
- Use `latest` in URLs to Red Hat documentation so links resolve to the latest version.

**Severity**: Must-fix for bare URLs. Recommended for unnecessary cross-references.

## Non-Breaking Spaces

Use `{nbsp}` in product names to prevent awkward line breaks:
```asciidoc
Red{nbsp}Hat Enterprise Linux
```

**Severity**: Recommended.
