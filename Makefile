SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help: ## help message, list all command
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: build
build: ## Build the extension to be ready to upload to the chrome store
	npm run build

.PHONY: run-chrome
run-chrome: ## Run chrome with the extension loaded
	npm run start:chrome

.PHONY: run-firefox
run-firefox: ## Run firefox with the extension loaded
	npm run start:firefox