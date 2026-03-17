install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; }; \
	. "$$HOME/.local/bin/env" 2>/dev/null || true; \
	uv sync && npm --prefix frontend install

# 前后端分离：可分别启动，便于调试
BACKEND_HOST ?= 127.0.0.1
BACKEND_PORT ?= 8001
BACKEND_URL = http://$(BACKEND_HOST):$(BACKEND_PORT)

start-backend:
	@echo "Starting backend on $(BACKEND_URL)"
	uv run adk api_server app --host="$(BACKEND_HOST)" --port="$(BACKEND_PORT)" --allow_origins="*" --session_service_uri="sqlite:///data/sessions.db"

start-frontend:
	@echo "Starting frontend with API base $(BACKEND_URL)"
	VITE_API_BASE="$(BACKEND_URL)" npm --prefix frontend run dev

# 同时启动前后端（默认后端 8001，前端走 Vite 代理到后端）
dev:
	$(MAKE) start-backend & $(MAKE) start-frontend

dev-backend:
	$(MAKE) start-backend

dev-frontend:
	$(MAKE) start-frontend

playground:
	uv run adk web --port 8501

lint:
	uv sync --dev --extra lint
	uv run codespell
	uv run ruff check . --diff
	uv run ruff format . --check --diff
	uv run mypy .
