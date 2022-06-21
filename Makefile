JEKYLL_CONTAINER ?= quay.io/hybridcloudpatterns/jekyll-container:latest

serve:
	@echo "Next browse to: http://localhost:4000"
	jekyll serve -w --trace --config _config.yml,_local.yml --host 127.0.0.1

serve-container:
	@echo "Serving via container. Browse to http://localhost:4000"
	podman run -it --net=host -v $(PWD):/site:z --entrypoint "make" $(JEKYLL_CONTAINER)

test: spellcheck lint htmlproof
	@echo "Ran all tests"

spellcheck:
	@echo "Running spellchecking on the tree"
	podman run -it -v $(PWD):/tmp:rw,z docker.io/jonasbn/github-action-spellcheck:latest

lint:
	@echo "Running linter on the tree"
	podman run -it -e RUN_LOCAL=true -e USE_FIND_ALGORITHM=true -e VALIDATE_ALL_CODEBASE=true \
		-e VALIDATE_CSS=false -e VALIDATE_HTML=false -e VALIDATE_JSCPD=false \
		-e VALIDATE_GITLEAKS=false -e VALIDATE_NATURAL_LANGUAGE=false -e VALIDATE_JAVASCRIPT_ES=false \
		-e VALIDATE_JAVASCRIPT_STANDARD=false \
		-v $(PWD):/tmp/lint:rw,z docker.io/github/super-linter:slim-latest

htmlproof:
	@echo "Running html proof to check links"
	podman run -it --net=host -v $(PWD):/site:rw,z --entrypoint jekyll $(JEKYLL_CONTAINER) build
	podman run -it --net=host -v $(PWD):/site:z --entrypoint ruby -e INPUT_DIRECTORY=_site/ \
		-e INPUT_FORCE_HTTPS=1 -e INPUT_CHECK_FAVICON=0 \
		-e INPUT_URL_IGNORE="http://www.example.com/\nhttps://en.wikipedia.org/wiki/Main_Page" \
		-e INPUT_URL_IGNORE_RE="^https://twitter.com/" \
		$(JEKYLL_CONTAINER) /usr/local/bin/proof-html.rb

lintwordlist:
	@sort .wordlist.txt | tr '[:upper:]' '[:lower:]' | uniq > /tmp/.wordlist.txt
	@mv -v /tmp/.wordlist.txt .wordlist.txt
