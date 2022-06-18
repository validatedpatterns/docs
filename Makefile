serve:
	@echo "Next browse to: http://localhost:4000"
	jekyll serve -w --trace --config _config.yml,_local.yml --host 0.0.0.0

serve-container:
	@echo "Serving via container. Browse to http://localhost:4000"
	podman run -it --net=host -v $(PWD):/site:z --entrypoint "make" quay.io/hybridcloudpatterns/jekyll-container:latest

spellcheck:
	@echo "Running spellchecking on the tree"
	podman run -it -v $(PWD):/tmp:rw,z docker.io/jonasbn/github-action-spellcheck:latest
