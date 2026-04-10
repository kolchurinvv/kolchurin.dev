.PHONY: help deploy delete build-backend build-frontend push-backend push-frontend

REGISTRY ?= docker.io/kolchurin
KUBECTL := kubectl
.KEEP_GOAL:
export

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

deploy: ## Deploy to K3s cluster
	$(KUBECTL) apply -k .

delete: ## Delete all resources
	$(KUBECTL) delete -k .

build-backend: ## Build backend Docker image
	docker build -f deployment/Dockerfile.backend -t $(REGISTRY)/backend:latest .

build-frontend: ## Build frontend Docker image
	docker build -f deployment/Dockerfile.frontend -t $(REGISTRY)/frontend:latest .

push-backend: ## Push backend image to registry
	docker push $(REGISTRY)/backend:latest

push-frontend: ## Push frontend image to registry
	docker push $(REGISTRY)/frontend:latest

build-all: build-backend build-frontend ## Build all images

push-all: push-backend push-frontend ## Push all images

deploy-all: build-all push-all deploy ## Build, push, and deploy everything
