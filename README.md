# Validated Patterns documentation site

This project contains the new proof-of-concept documentation site for [validatedpatterns.io](validatedpatterns.io).

Use a container image to build the Validated Patterns documentation, locally. See [Preview the documentation using a container image](https://validatedpatterns.io/contribute/contribute-to-docs/#_preview_the_documentation_using_a_container_image). This is recommended to ensure the local preview is the same as what is rendered in deployment pipelines.

Alternatively, you can build this site using [Hugo](https://gohugo.io/) and [Asciidoctor](https://asciidoctor.org). 

## Install Hugo

You can install Hugo on different platforms (Linux, Windows, macOS) using a number of methods. For more information on how to install Hugo on your desired platform, see [Install Hugo](https://gohugo.io/getting-started/installing/).

## Install Asciidoctor

You can install Asciidoctor on different platforms (Linux, Windows, macOS) using a number of methods. For more information on how to install Asciidoctor on your desired platform, see [Install Asciidoctor](https://asciidoctor.org/#installation).

## Deploy the website locally using Hugo

You can run Hugo as a local server to test out the site.

1. Clone this repository as a local repository.

2. Change to the local repository.

3. Run the following command:

        $ hugo server

4. View the site on your browser at [`http://localhost:1313/`](http://localhost:1313/).

## AI tooling

### AGENTS.md

This repository includes an [AGENTS.md](AGENTS.md) file that helps AI agents understand the structure, tooling, and conventions of the repository so they can make correct, buildable changes. It covers the repository layout, build commands, content authoring conventions, frontmatter schemas, and style guidelines.

### AI documentation skills

The repository also includes AI agent skills for creating and reviewing documentation, located in `.rulesync/skills/`. These skills are synced to your editor using [rulesync](https://www.npmjs.com/package/rulesync).

#### Available skills

- **doc-create** -- Create new learn pages or pattern page sets with correct structure and style-compliant content.
- **doc-review** -- Review existing documentation files against 24 Red Hat/IBM style guide rules, with format-aware checking for AsciiDoc and Markdown.

#### Prerequisites for installing AI skiils

- [Node.js](https://nodejs.org/) and npm
- [rulesync](https://www.npmjs.com/package/rulesync) installed globally:

        $ npm install -g rulesync

#### Generating skills for your editor

To sync the skills to Cursor:

        $ rulesync generate --targets cursor --features skills

To sync the skills to Claude Code:

        $ rulesync generate --targets claudecode --features skills

To sync to both at once:

        $ rulesync generate --targets cursor claudecode --features skills
