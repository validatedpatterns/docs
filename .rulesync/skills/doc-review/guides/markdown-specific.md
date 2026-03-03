# Markdown-Specific Rules

Format applicability: [Markdown only]

These rules apply only to `.md` and `.markdown` files. Skip all rules in this guide when reviewing AsciiDoc files.

## Heading Syntax

### Rules
- Use ATX-style headings (`#`, `##`, `###`) — not Setext-style (underlines).
- Include a blank line before and after headings.
- Include a space between `#` and heading text.
- Do not skip heading levels (e.g., do not jump from `##` to `####`).
- Use sentence-style capitalization (same as general heading rules).

| DON'T | DO |
|---|---|
| `#Heading` (no space) | `# Heading` |
| `## My Heading` then `#### Sub` (skipped `###`) | `## My heading` then `### Sub` |

**Severity**: Must-fix.

## Bold and Italic Syntax

### Mapping from general rules
The general style rules reference bold and italic formatting. In Markdown:

| Style | Markdown syntax | Used for |
|---|---|---|
| Bold | `**text**` | UI element names, emphasis |
| Italic | `*text*` or `_text_` | Introducing new terms, variable values |
| Monospace | `` `text` `` | Commands, code, file names, paths |
| Bold monospace | `` **`text`** `` | N/A — avoid in Markdown |

**Note**: AsciiDoc uses single `*` for bold, which differs from Markdown. When reviewing Markdown, check that bold uses double asterisks `**`.

**Severity**: Must-fix for incorrect formatting syntax.

## Links

### Inline links
```markdown
[link text](URL)
```

### Reference-style links
```markdown
[link text][ref-id]

[ref-id]: URL "Optional title"
```

### Rules
- Always provide descriptive link text — never use "Click here" or bare URLs.
- Use "For more information about", not "For more information on".
- When possible, place links in a dedicated "Additional resources" or "See also" section rather than inline.

| DON'T | DO |
|---|---|
| `Click [here](url) for more info.` | `For more information about X, see [Title of page](url).` |
| `https://example.com/docs` (bare URL) | `[Product documentation](https://example.com/docs)` |

**Severity**: Must-fix for "Click here" and bare URLs. Recommended for link placement.

## Images

### Syntax
```markdown
![Alt text](path/to/image.png "Optional title")
```

### Rules
- Always include descriptive alt text for accessibility.
- Avoid unnecessary screenshots (same as general screen capture rules).
- Use relative paths for images within the same repository.

**Severity**: Must-fix for missing alt text. Recommended for unnecessary images.

## Code Blocks

### Inline code
Use single backticks for command names, file paths, and code references:
```markdown
Run the `ls` command.
```

### Fenced code blocks
Use triple backticks with a language identifier:
````markdown
```yaml
key: value
```
````

### Rules
- Always specify a language identifier for fenced code blocks when applicable.
- Use backticks (not indentation) for code blocks.
- Format user-replaceable values in code with angle brackets and describe them: `<value_name>`.

**Severity**: Recommended for missing language identifiers. Must-fix for unformatted commands.

## Lists in Markdown

### Unordered lists
- Use `-` or `*` consistently (do not mix within a document).
- Include a blank line before the first list item.

### Ordered lists
- Use `1.` for all items (Markdown auto-numbers) or use explicit numbering.
- For single-step procedures, use an unordered list instead.

### Nesting
- Indent nested items by 2 or 4 spaces consistently.
- Do not nest beyond 2 levels.

**Severity**: Recommended for consistency. Must-fix for excessive nesting.

## Admonitions in Markdown

Markdown has no native admonition syntax. Common conventions:

### Blockquote style
```markdown
> **Note:** Additional guidance text here.
```

### GitHub-flavored alerts (if supported)
```markdown
> [!NOTE]
> Additional guidance text here.
```

### Rules
- When using admonition-like callouts, follow the same rules as AsciiDoc admonitions: keep them short, do not include procedures, and minimize their frequency.
- Use only valid types: Note, Important, Warning, Tip (not Caution).

**Severity**: Recommended.
