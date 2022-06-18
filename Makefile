serve:
	@echo "Next browse to: http://localhost:4000"
	jekyll serve -w --trace --config _config.yml,_local.yml --host 0.0.0.0

serve-container:
	@echo "Serving via container. Browse to http://localhost:4000"
	podman run -it --net=host -v $(PWD):/site:z --entrypoint "make" quay.io/hybridcloudpatterns/jekyll-container:latest

spellcheck:
	@echo "Running spellchecking on the tree"
	podman run -it -v $(PWD):/tmp:rw,z docker.io/jonasbn/github-action-spellcheck:latest

lint:
	@echo "Running linter on the tree"
	podman run -it -e RUN_LOCAL=true -e USE_FIND_ALGORITHM=true -e VALIDATE_ALL_CODEBASE=true \
		-e VALIDATE_CSS=false -e VALIDATE_HTML=false -e VALIDATE_JSCPD=false \
		-e VALIDATE_GITLEAKS=false -e VALIDATE_NATURAL_LANGUAGE=false -e VALIDATE_JAVASCRIPT_ES=false \
		-e VALIDATE_JAVASCRIPT_STANDARD=false \
		-v $(PWD):/tmp/lint:rw,z docker.io/github/super-linter
