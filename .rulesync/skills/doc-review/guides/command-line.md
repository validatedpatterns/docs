# Command Line

Format applicability: [All]
IBM Reference: Computer interfaces > Commands, parameters, and options in instructions
Severity: **Must-fix** for incorrect verbs and unformatted commands. **Recommended** for "command" word usage.

## Rule

### Instructing users to run commands
Use these verbs: **enter**, **run**, **type**, **issue**, or **use**.
Do NOT use: "write", "add", "execute", "do".

### Formatting
- Command names: **monospace font** (backticks in Markdown, backticks or `[command]` in AsciiDoc).
- Variable/replaceable values: **italic monospace**.
- Use the word "command" only on the **first mention** of a command in a section, or when ambiguous.

### User-replaceable values
- Surround with angle brackets: `<value_name>`
- Use underscores for multi-word values: `<service_name>`
- Lowercase unless context requires otherwise
- Italicize and use monospace

## Examples

| DON'T | DO |
|---|---|
| In the command line, write the `restart` command. | On the command line, enter `restart`. |
| Add the `ls` command. If you also want to display hidden files, use the `ls -a` command instead. | To list files in your current directory, run the `ls` command. If you also want to display hidden files, run `ls -a` instead. |
| `# systemctl enable service_name` / Replace service_name with the service. | `# systemctl enable <service_name>` / Replace `<service_name>` with the service that you want to enable. |
