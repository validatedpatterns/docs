serve:
	@echo "Next browse to:  http://localhost:4000"
	jekyll serve -w --trace --config _config.yml,_local.yml --host 0.0.0.0
