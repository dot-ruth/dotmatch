.PHONY: dev install install-backend install-frontend dev-backend dev-frontend test lint lint-fix typecheck typecheck-frontend clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# LOCAL DEVELOPMENT
# =============================================================================

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt -r requirements-dev.txt
	cd frontend && npm install

install-backend: ## Install backend dependencies
	cd backend && pip install -r requirements.txt -r requirements-dev.txt

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

dev-backend: ## Start backend API server (port 8001)
	cd backend && python -m uvicorn main:app --reload --port 8001

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

dev: ## Start both backend and frontend
	@echo "Starting backend on port 8001..."
	@start cmd /c "cd backend && python -m uvicorn main:app --reload --port 8001"
	@echo "Starting frontend on port 3000..."
	@cd frontend && npm run dev

# =============================================================================
# TESTING
# =============================================================================

test: ## Run tests
	cd backend && python -m pytest

test-verbose: ## Run tests with verbose output
	cd backend && python -m pytest -v

# =============================================================================
# LINTING
# =============================================================================

lint: ## Run linting
	cd backend && python -m ruff check .
	cd frontend && npx tsc --noEmit

lint-fix: ## Fix linting issues
	cd backend && python -m ruff check --fix .

typecheck: ## Run backend type checking
	cd backend && python -m mypy .

typecheck-frontend: ## Run frontend type checking
	cd frontend && npx tsc --noEmit

# =============================================================================
# UTILITIES
# =============================================================================

clean: ## Clean build artifacts
	rm -rf backend/__pycache__
	rm -rf frontend/.next frontend/out
	rm -rf .pytest_cache .mypy_cache .ruff_cache
