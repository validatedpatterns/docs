# Minimalism

Format applicability: [All]
Reference: Red Hat Minimalism Guidelines, IBM Style Guide
Severity: **Must-fix** for unclear content. **Recommended** for content that could be shorter.

## Rule

Write only what users need to know. Focus on tasks, not features. Remove redundant or obvious information. Use simple, direct language. Get users to their goal quickly.

## Customer focus and action orientation

- Content must focus on actions and customer tasks.
- Explain features in terms of what users can do with them, not what they are.
- Content should answer "how do I...?" not "what is...?"
- Separate conceptual and background information from procedural tasks.

| DON'T | DO |
|---|---|
| The Frobnicator module provides a powerful interface for managing widgets. | You can manage widgets by using the Frobnicator module. |
| This feature enables advanced configuration. | You can configure advanced settings by... |

## Scannability and findability

- Content must be easy to scan in a few seconds.
- Use bulleted lists to break up dense paragraphs.
- Use tables for comparative or reference information.
- Headings must describe the content that follows.
- Use short paragraphs and sentences.

**Flag**: Paragraphs longer than 5-6 sentences that could be broken into a list or shorter paragraphs.

## Sentences

- Aim for fewer than **25 words** per sentence.
- Use only required words — every word must earn its place.
- Split long sentences into shorter ones.
- Each sentence must add value. If removing it does not change the user's understanding, remove it.

**Flag**: Sentences over 25 words that can be split or shortened.

## Conciseness — removing fluff

### Self-referential text (remove entirely)

| DON'T | DO |
|---|---|
| This section describes how to configure the service. | *(Remove and start directly with the content)* |
| This topic explains the architecture of the system. | *(Remove and start directly with the content)* |
| This guide shows you how to install the product. | *(Remove and start directly with the content)* |
| The following paragraphs discuss... | *(Remove and start directly with the content)* |
| As mentioned earlier... | *(Remove or link to the specific section)* |

### Obvious statements (remove entirely)

| DON'T | DO |
|---|---|
| As you know, Kubernetes orchestrates containers. | *(Remove — if the reader knows, do not state it)* |
| It is important to note that the service must be running. | The service must be running. |
| It goes without saying that backups are essential. | *(Remove — if it goes without saying, do not say it)* |
| Please note that this command requires root privileges. | This command requires root privileges. |
| Keep in mind that the default timeout is 30 seconds. | The default timeout is 30 seconds. |

### Redundant phrases (shorten)

| DON'T | DO |
|---|---|
| in order to | to |
| at this point in time | now |
| due to the fact that | because |
| for the purpose of | to, for |
| in the event that | if |
| has the ability to | can |
| is able to | can |
| make use of | use |
| a large number of | many |
| on a daily basis | daily |
| at the present time | now, currently |
| in spite of the fact that | although |
| with regard to | about |
| in conjunction with | with |
| the majority of | most |
| in close proximity to | near |
| take into consideration | consider |
| it is necessary to | you must |
| give consideration to | consider |
| has the capability to | can |

### Unnecessary adverbs and modifiers (remove or replace)

Flag and consider removing these filler words when they do not add meaning:

- very, really, quite, rather, somewhat
- just, basically, actually, essentially, totally
- obviously, clearly, simply, easily
- specific, particular, certain (when vague)

## Admonitions, screenshots, and diagrams

- Use admonitions only when necessary — not for general information that belongs in the main text.
- Use screenshots only when text alone is insufficient.
- Use diagrams only when they add value that text alone cannot provide.

**Flag**: Excessive admonitions (more than 2-3 per page), screenshots that duplicate text content, diagrams that do not clarify complex relationships.

## How to evaluate

For each paragraph, ask:
1. Does this help the user complete their task?
2. Can this be said in fewer words?
3. Would removing this change the user's understanding?

If the answer to #3 is "no", flag it for removal.
