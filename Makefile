serve:
	@echo "Next run:        ssh -L4000:localhost:4000 `uname -n`"
	@echo "And browse to:  http://localhost:4000"
	jekyll serve -w --trace --config _config.yml,_local.yml
