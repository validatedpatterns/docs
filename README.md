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
