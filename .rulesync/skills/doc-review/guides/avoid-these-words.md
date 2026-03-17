# Avoid These Words

Format applicability: [All]
IBM Reference: Word Usage, Language and grammar
Severity: **Must-fix** for "Never" items. **Recommended** for "Avoid" items.

## Rule

Flag and replace the following words and constructions. They cause comprehension problems or are inappropriate in technical documentation.

## Banned words table (from IBM Style Guide)

| Word/Phrase | Rule | Replacement |
|---|---|---|
| appears (for UI elements) | Never use for elements on screen | "opens" (for windows), "is displayed" (for elements) |
| as (meaning "because") | Never | "because" |
| desire / desired | Never | "want" / "that you want" |
| e.g. | Never (Latin abbreviation) | "for example" |
| etc. | Never (Latin abbreviation) | "and so on" |
| i.e. | Never (Latin abbreviation) | "that is" |
| may (meaning "might") | Never as synonym for "might" | "might" (possibility) or "can" (ability) |
| once (meaning "when/after") | Never; "once" means "one time" | "when" or "after" |
| please | Never; unnecessary politeness | Remove entirely |
| prior to | Never | "before" |
| should | Avoid | "must" or reword to be more direct |
| simply | Never | Remove entirely |
| since (meaning "because") | Never; "since" refers to time only | "because" |
| and/or | Never | Choose "and" or "or" |
| slash for options (/) | Never | Use "or" or "and" |
| utilize | Never | "use" |
| via | Avoid | "through", "by", "by using", "across" |
| while (meaning "although") | Never; "while" refers to time only | "although" or "though" |
| will | Avoid future tense | Rewrite in present tense (see future-tense.md) |
| would | Avoid | Reword to be more direct |

## Additional "do not use" words (from Red Hat supplementary style guide)

### General language and style

| Word/Phrase | Rule | Replacement |
|---|---|---|
| ACK (as abbreviation) | Do not use as abbreviation for "acknowledgment" | "acknowledgment" in prose; "ACK flag" when referring to TCP packets |
| alright | Colloquial; do not use | "all right" or rephrase |
| as expected | Expectations are relative | "correctly" |
| basically | Filler word; does not add meaning | Remove entirely or rephrase |
| bimonthly | Ambiguous (twice a month or every two months) | "twice a month" or "every two months" |
| biweekly | Ambiguous (twice a week or every two weeks) | "twice a week" or "every two weeks" |
| essentially | Filler word; does not add meaning | Remove entirely |
| exclamation point (!) | Do not use at end of sentences | Rephrase without emphasis punctuation (acceptable when referring to the `!` command) |
| he / she | Gendered pronouns | Reword the sentence to avoid gendered pronouns |
| interesting | Vague; does not show why something is of interest | Use a "Note" admonition or explain why it matters |
| lots of / bunches of | Colloquial | "many" |
| quiescent | Obscure; ambiguous meaning | "inactive", "at rest", "in a known state" — be specific |
| recommend / recommends | Avoid "Red Hat recommends"; be prescriptive | Write directly: "Use X because..." or "Use X when..." |
| regex | Abbreviation | "regular expression" |
| skill set | Unnecessary compound | "skills" or "knowledge" |
| snippet | Informal | "piece" (for small portions) or "excerpt" (for samples from a longer text) |
| softcopy | Dated term | "online" (e.g., "To view the online documentation...") |
| totally | Filler word; does not add meaning | Remove entirely |
| unset | Unclear verb | "clear" (e.g., "clear the checkbox", "the ACK flag cleared") |
| we suggest | Indirect | Be direct: instead of "We suggest that you back up your data", write "Back up your data" |

### Technical terminology

| Word/Phrase | Rule | Replacement |
|---|---|---|
| hashbang | Slang | "interpreter directive" (first use: "interpreter directives, also known as shebangs") |
| kerberize / kerberized | Informal verb form | "Kerberos-aware" or "Kerberos-enabled", or rephrase |
| network interface card | Incorrect expansion of NIC | "network interface controller" |
| Puppetize | Unnecessary jargon | Describe the action: "apply Puppet manifests to the system" |
| SSL | Deprecated protocol | "TLS" (Transport Layer Security). Use "SSL" only in historical context. |

### Deprecated product names and terms

These terms refer to former or renamed products. Use the current product name instead.

| Do not use | Use instead |
|---|---|
| ActiveMQ (alone, for JBoss EAP) | "JBoss EAP messaging subsystem" |
| domain mode (JBoss EAP) | "managed domain" |
| HTTP interface (JBoss EAP) | "management console" |
| IBM eServer System i | "IBM Power" |
| IBM eServer System p | "IBM Power" |
| IBM S/390 | "IBM Z" |
| iSeries | "IBM Power" |
| JBoss AMQ | "Red Hat AMQ" |
| Microsoft Windows (for server) | "Windows Server" |
| minion (OpenShift) | "node" |
| native interface (JBoss EAP) | "management CLI" |
| .NET Core (for versions after 3.1) | ".NET" |
| OpenShift Origin | "OKD" |
| pSeries | "IBM Power" |
| Red Hat Container Catalog | "Red Hat Ecosystem Catalog" |
| Red Hat Java | "Red Hat build of OpenJDK" |
| Red Hat JBoss Data Grid (for versions after 7.2) | "Red Hat Data Grid" |
| Red Hat OpenJDK | "Red Hat build of OpenJDK" |
| Red Hat OpenShift Container Storage | "Red Hat OpenShift Data Foundation" |
| standalone mode (JBoss EAP) | "standalone server" |
| zSeries | "IBM Z" |
