# Future Tense

Format applicability: [All]
IBM Reference: Language and grammar > Verbs > Tense
Severity: **Must-fix** when present tense works. **Recommended** when context is ambiguous.

## Rule

Avoid "will", "shall", and "going to". Use present tense unless future tense is genuinely required (describing something that truly happens later in a sequence).

## Why

- Present tense is clearer, shorter, and translates better.
- Future tense can be inaccurate if the event occurs in the reader's present.
- Future tense uses auxiliary verbs, increasing complexity and mistranslation risk.

## Examples

| DON'T | DO |
|---|---|
| The script will upload the following images. | The script uploads the following images. |
| The shutdown command will call the systemctl utility. | The shutdown command calls the systemctl utility. |

## Exception

Future tense is acceptable when present tense does not make sense:

"Cancel a broker deployment only if you are sure that the broker will never respond."
