.PHONY: test test-backend test-frontend test-all

test: test-all

test-backend:
	cd backend && pytest tests/ --cov=app --cov-report=term-missing -v

test-frontend:
	npm run test:frontend

test-all: test-backend test-frontend
