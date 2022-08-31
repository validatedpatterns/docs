JEKYLL_CONTAINER ?= quay.io/hybridcloudpatterns/jekyll-container:latest

# Do not use selinux labeling when we are using nfs
FSTYPE=$(shell df -Th . | grep -v Type | awk '{ print $$2 }')
ifeq ($(FSTYPE), nfs)
	ATTRS = "rw"
else ifeq ($(FSTYPE), nfs4)
	ATTRS = "rw"
else
	ATTRS = "rw,z"
endif

default: serve-container

serve-container:
	@echo "Serving via container. Browse to http://localhost:4000. Filesystem type: $(FSTYPE)"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint "bundle" $(JEKYLL_CONTAINER) exec jekyll serve --host 127.0.0.1

test: spellcheck lint htmlproof
	@echo "Ran all tests"

spellcheck:
	@echo "Running spellchecking on the tree"
	podman run -it -v $(PWD):/tmp:$(ATTRS) docker.io/jonasbn/github-action-spellcheck:latest

lint:
	@echo "Running linter on the tree"
	podman run -it -e RUN_LOCAL=true -e USE_FIND_ALGORITHM=true -e VALIDATE_ALL_CODEBASE=true \
		-e VALIDATE_CSS=false -e VALIDATE_HTML=false -e VALIDATE_JSCPD=false \
		-e VALIDATE_NATURAL_LANGUAGE=false -e VALIDATE_JAVASCRIPT_ES=false \
		-e VALIDATE_JAVASCRIPT_STANDARD=false \
		-v $(PWD):/tmp/lint:$(ATTRS) docker.io/github/super-linter:slim-latest

htmlproof:
	@echo "Running html proof to check links"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint bundle $(JEKYLL_CONTAINER) exec jekyll build
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint bundle -e INPUT_DIRECTORY=_site/ \
		-e INPUT_FORCE_HTTPS=1 -e INPUT_CHECK_FAVICON=0 \
		-e INPUT_URL_IGNORE="http://www.example.com/\nhttps://en.wikipedia.org/wiki/Main_Page" \
		-e INPUT_URL_IGNORE_RE="^https://twitter.com/" \
		-e INPUT_URL_IGNORE_RE="^https://hybrid-cloud-patterns.io/2022/" \
		-e INPUT_URL_IGNORE_RE="^https://hybrid-cloud-patterns.io/blog/" \
		-e INPUT_URL_IGNORE_RE="^https://github.com/hybrid-cloud-patterns/docs/blob/gh-pages/.*" \
		$(JEKYLL_CONTAINER) exec ruby /usr/local/bin/proof-html.rb

lintwordlist:
	@sort .wordlist.txt | tr '[:upper:]' '[:lower:]' | uniq > /tmp/.wordlist.txt
	@mv -v /tmp/.wordlist.txt .wordlist.txt

clean:
	@rm -rvf ./.jekyll-cache ./_site ./tmp super-linter.log dictionary.dic

build:
	@echo "Check the html content in _site"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint "bundle" $(JEKYLL_CONTAINER) exec jekyll build
