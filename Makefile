HOMEPAGE_CONTAINER ?= quay.io/hybridcloudpatterns/homepage-container:latest

# Do not use selinux labeling when we are using nfs
FSTYPE=$(shell df -Th . | grep -v Type | awk '{ print $$2 }')
ifeq ($(FSTYPE), nfs)
	ATTRS = "rw"
else ifeq ($(FSTYPE), nfs4)
	ATTRS = "rw"
else
	ATTRS = "rw,z"
endif

.PHONY: help
# No need to add a comment here as help is described in common/
help:
	@printf "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sort | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)\n"

.PHONY: test
test: spellcheck
	@echo "Ran all tests"

.PHONY: build
build: ## Build the website locally in the public/ folder
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint hugo $(HOMEPAGE_CONTAINER)

.PHONY: serve
serve: ## Build the website locally from a container and serve it
	@echo "Serving via container. Browse to http://localhost:4000"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint hugo $(HOMEPAGE_CONTAINER) server -p 4000

.PHONY: htmltest
htmltest: build ## Runs htmltest against the site to find broken links
	@echo "Running html proof to check links"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) --entrypoint htmltest $(HOMEPAGE_CONTAINER)

.PHONY: spellcheck
spellcheck: ## Runs a spellchecker on the content/ folder
	@echo "Running spellchecking on the tree"
	podman run -it -v $(PWD):/tmp:$(ATTRS) docker.io/jonasbn/github-action-spellcheck:latest

.PHONY: lintwordlist
lintwordlist: ## Sorts and removes duplicates from spellcheck exception file .wordlist.txt
	@cp --preserve=all .wordlist.txt /tmp/.wordlist.txt
	@sort .wordlist.txt | tr '[:upper:]' '[:lower:]' | uniq > /tmp/.wordlist.txt
	@mv -v /tmp/.wordlist.txt .wordlist.txt

.PHONY: clean
clean: ## Removes any unneeded spurious files
	@rm -rvf ./.jekyll-cache ./_site ./tmp super-linter.log dictionary.dic
