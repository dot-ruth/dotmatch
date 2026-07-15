.PHONY: dev migrate seed test lint install help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# LOCAL DEVELOPMENT
# =============================================================================

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd worker && pip install -r requirements.txt
	cd frontend && npm install

install-backend: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

dev-backend: ## Start backend API server
	cd backend && alembic upgrade head && uvicorn backend.app.main:app --reload --port 8000

dev-worker: ## Start Celery worker
	cd worker && celery -A worker.app.celery_app:app worker --loglevel=info

dev-beat: ## Start Celery beat scheduler
	cd worker && celery -A worker.app.celery_app:app beat --loglevel=info

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

# =============================================================================
# DATABASE
# =============================================================================

migrate: ## Run Alembic migrations
	cd backend && alembic upgrade head

migrate-create: ## Create new migration (usage: make migrate-create MSG="add users table")
	cd backend && alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	cd backend && alembic downgrade -1

migrate-history: ## Show migration history
	cd backend && alembic history

seed: ## Seed database with test data
	cd backend && python -m backend.seed

reset-db: ## Reset database (WARNING: destroys data)
	cd backend && python -c "\
	import asyncio; \
	from backend.app.core.database import engine; \
	async def reset(): \
	    async with engine.begin() as conn: \
	        await conn.execute(text('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')); \
	asyncio.run(reset())"

# =============================================================================
# TESTING
# =============================================================================

test: ## Run tests
	cd backend && python -m pytest

test-verbose: ## Run tests with verbose output
	cd backend && python -m pytest -v

test-cov: ## Run tests with coverage
	cd backend && python -m pytest --cov=backend --cov-report=html

test-worker: ## Run worker tests
	cd worker && python -m pytest

# =============================================================================
# LINTING
# =============================================================================

lint: ## Run linting
	cd backend && ruff check .
	cd backend && ruff format --check .

lint-fix: ## Fix linting issues
	cd backend && ruff check --fix .
	cd backend && ruff format .

typecheck: ## Run type checking
	cd backend && mypy backend

# =============================================================================
# UTILITIES
# =============================================================================

shell: ## Open Python shell with app context
	cd backend && python -c "from backend.app.main import app; import IPython; IPython.start_ipython()"

generate-secrets: ## Generate random secrets for .env
	@echo "AUTH_SECRET=$$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
	@echo "JWT_SECRET=$$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"

clean: ## Clean build artifacts
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf worker/__pycache__ worker/app/__pycache__
	rm -rf frontend/.next frontend/out
	rm -rf .pytest_cache .mypy_cache .ruff_cache
	rm -rf backend/htmlcov backend/.coverage
