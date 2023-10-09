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

##@ Docs tasks

.PHONY: help
# No need to add a comment here as help is described in common/
help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^(\s|[a-zA-Z_0-9-])+:.*?##/ { printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: test
test: htmltest ## Runs tests
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

.PHONY: run
run: ## Runs the container interactively
	@echo "Running html proof to check links"
	podman run -it --net=host -v $(PWD):/site:$(ATTRS) $(HOMEPAGE_CONTAINER)

.PHONY: update-container
update-container: ## Updates the container used for local testing
	podman pull $(HOMEPAGE_CONTAINER)

.PHONY: clean
clean: ## Removes any unneeded spurious files
	@rm -rvf ./.jekyll-cache ./_site ./tmp super-linter.log dictionary.dic
