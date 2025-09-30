# iLyra Platform Makefile
# Facilita operações Docker e desenvolvimento

.PHONY: help dev prod build clean logs test backup restore

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Configurações
COMPOSE_DEV := docker-compose -f docker-compose.dev.yml
COMPOSE_PROD := docker-compose -f docker-compose.prod.yml

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)iLyra Platform - Comandos Disponíveis$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ======================
# DESENVOLVIMENTO
# ======================

dev: ## Inicia ambiente de desenvolvimento
	@echo "$(GREEN)🚀 Iniciando ambiente de desenvolvimento...$(NC)"
	$(COMPOSE_DEV) up -d
	@echo "$(GREEN)✅ Ambiente iniciado!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"
	@echo "Grafana: http://localhost:3001"

dev-build: ## Build e inicia ambiente de desenvolvimento
	@echo "$(GREEN)🔨 Fazendo build do ambiente de desenvolvimento...$(NC)"
	$(COMPOSE_DEV) up -d --build

dev-logs: ## Mostra logs do ambiente de desenvolvimento
	$(COMPOSE_DEV) logs -f

dev-stop: ## Para ambiente de desenvolvimento
	@echo "$(YELLOW)⏹️  Parando ambiente de desenvolvimento...$(NC)"
	$(COMPOSE_DEV) down

dev-restart: ## Reinicia ambiente de desenvolvimento
	@echo "$(YELLOW)🔄 Reiniciando ambiente de desenvolvimento...$(NC)"
	$(COMPOSE_DEV) restart

# ======================
# PRODUÇÃO
# ======================

prod: ## Inicia ambiente de produção
	@echo "$(GREEN)🚀 Iniciando ambiente de produção...$(NC)"
	$(COMPOSE_PROD) up -d
	@echo "$(GREEN)✅ Ambiente de produção iniciado!$(NC)"

prod-build: ## Build e inicia ambiente de produção
	@echo "$(GREEN)🔨 Fazendo build do ambiente de produção...$(NC)"
	$(COMPOSE_PROD) up -d --build

prod-logs: ## Mostra logs do ambiente de produção
	$(COMPOSE_PROD) logs -f

prod-stop: ## Para ambiente de produção
	@echo "$(YELLOW)⏹️  Parando ambiente de produção...$(NC)"
	$(COMPOSE_PROD) down

prod-restart: ## Reinicia ambiente de produção
	@echo "$(YELLOW)🔄 Reiniciando ambiente de produção...$(NC)"
	$(COMPOSE_PROD) restart

# ======================
# BUILD E LIMPEZA
# ======================

build: ## Faz build de todas as imagens
	@echo "$(GREEN)🔨 Fazendo build de todas as imagens...$(NC)"
	$(COMPOSE_DEV) build --no-cache
	$(COMPOSE_PROD) build --no-cache

clean: ## Remove containers, volumes e imagens não utilizadas
	@echo "$(RED)🧹 Limpando containers, volumes e imagens...$(NC)"
	docker system prune -af --volumes
	docker volume prune -f

clean-dev: ## Remove apenas containers de desenvolvimento
	@echo "$(YELLOW)🧹 Limpando ambiente de desenvolvimento...$(NC)"
	$(COMPOSE_DEV) down -v --remove-orphans

clean-prod: ## Remove apenas containers de produção
	@echo "$(YELLOW)🧹 Limpando ambiente de produção...$(NC)"
	$(COMPOSE_PROD) down -v --remove-orphans

# ======================
# LOGS E MONITORAMENTO
# ======================

logs: ## Mostra logs de todos os serviços
	$(COMPOSE_DEV) logs -f

logs-backend: ## Mostra logs apenas do backend
	$(COMPOSE_DEV) logs -f backend

logs-frontend: ## Mostra logs apenas do frontend
	$(COMPOSE_DEV) logs -f frontend

logs-db: ## Mostra logs do banco de dados
	$(COMPOSE_DEV) logs -f postgres

logs-nginx: ## Mostra logs do Nginx
	$(COMPOSE_DEV) logs -f nginx

# ======================
# TESTES
# ======================

test: ## Executa todos os testes
	@echo "$(GREEN)🧪 Executando testes...$(NC)"
	$(COMPOSE_DEV) exec backend python -m pytest
	$(COMPOSE_DEV) exec frontend npm test

test-backend: ## Executa testes do backend
	@echo "$(GREEN)🧪 Executando testes do backend...$(NC)"
	$(COMPOSE_DEV) exec backend python -m pytest -v

test-frontend: ## Executa testes do frontend
	@echo "$(GREEN)🧪 Executando testes do frontend...$(NC)"
	$(COMPOSE_DEV) exec frontend npm test

test-coverage: ## Executa testes com coverage
	@echo "$(GREEN)🧪 Executando testes com coverage...$(NC)"
	$(COMPOSE_DEV) exec backend python -m pytest --cov=. --cov-report=html
	$(COMPOSE_DEV) exec frontend npm run test:coverage

# ======================
# BANCO DE DADOS
# ======================

db-migrate: ## Executa migrações do banco
	@echo "$(GREEN)📊 Executando migrações do banco...$(NC)"
	$(COMPOSE_DEV) exec backend python -m flask db upgrade

db-seed: ## Popula banco com dados de exemplo
	@echo "$(GREEN)🌱 Populando banco com dados de exemplo...$(NC)"
	$(COMPOSE_DEV) exec backend python seed_database.py

db-reset: ## Reseta banco de dados
	@echo "$(RED)🔄 Resetando banco de dados...$(NC)"
	$(COMPOSE_DEV) exec backend python -m flask db downgrade base
	$(COMPOSE_DEV) exec backend python -m flask db upgrade

db-shell: ## Acessa shell do PostgreSQL
	$(COMPOSE_DEV) exec postgres psql -U ilyra -d ilyra_dev

# ======================
# BACKUP E RESTORE
# ======================

backup: ## Executa backup do banco de dados
	@echo "$(GREEN)💾 Executando backup do banco...$(NC)"
	$(COMPOSE_PROD) exec backup /backup.sh

backup-now: ## Executa backup imediato
	@echo "$(GREEN)💾 Executando backup imediato...$(NC)"
	docker run --rm --network ilyra_ilyra-network \
		-v $(PWD)/backups:/backups \
		-e POSTGRES_DB=ilyra_prod \
		-e POSTGRES_USER=ilyra \
		-e POSTGRES_PASSWORD=$(POSTGRES_PASSWORD) \
		postgres:15-alpine /backups/backup.sh

restore: ## Restaura backup do banco (especificar BACKUP_FILE=nome_do_arquivo)
	@echo "$(YELLOW)🔄 Restaurando backup: $(BACKUP_FILE)$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ Especifique o arquivo de backup: make restore BACKUP_FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	$(COMPOSE_PROD) exec postgres pg_restore -U ilyra -d ilyra_prod /backups/$(BACKUP_FILE)

# ======================
# UTILITÁRIOS
# ======================

shell-backend: ## Acessa shell do container backend
	$(COMPOSE_DEV) exec backend /bin/bash

shell-frontend: ## Acessa shell do container frontend
	$(COMPOSE_DEV) exec frontend /bin/sh

shell-db: ## Acessa shell do container PostgreSQL
	$(COMPOSE_DEV) exec postgres /bin/bash

install-frontend: ## Instala dependências do frontend
	@echo "$(GREEN)📦 Instalando dependências do frontend...$(NC)"
	$(COMPOSE_DEV) exec frontend npm install

install-backend: ## Instala dependências do backend
	@echo "$(GREEN)📦 Instalando dependências do backend...$(NC)"
	$(COMPOSE_DEV) exec backend pip install -r requirements.txt

update: ## Atualiza dependências
	@echo "$(GREEN)🔄 Atualizando dependências...$(NC)"
	$(COMPOSE_DEV) exec frontend npm update
	$(COMPOSE_DEV) exec backend pip install --upgrade -r requirements.txt

# ======================
# SSL/HTTPS
# ======================

ssl-cert: ## Gera certificados SSL com Let's Encrypt
	@echo "$(GREEN)🔒 Gerando certificados SSL...$(NC)"
	$(COMPOSE_PROD) run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $(SSL_CERT_EMAIL) --agree-tos --no-eff-email -d $(DOMAIN_NAME)

ssl-renew: ## Renova certificados SSL
	@echo "$(GREEN)🔄 Renovando certificados SSL...$(NC)"
	$(COMPOSE_PROD) run --rm certbot renew

# ======================
# MONITORAMENTO
# ======================

monitoring: ## Acessa dashboards de monitoramento
	@echo "$(GREEN)📊 Dashboards de monitoramento:$(NC)"
	@echo "Grafana: http://localhost:3001 (admin/$(GRAFANA_PASSWORD))"
	@echo "Prometheus: http://localhost:9090"

health: ## Verifica saúde dos serviços
	@echo "$(GREEN)🏥 Verificando saúde dos serviços...$(NC)"
	@curl -f http://localhost/health || echo "$(RED)❌ Frontend não está respondendo$(NC)"
	@curl -f http://localhost:5000/health || echo "$(RED)❌ Backend não está respondendo$(NC)"

# ======================
# DEPLOY
# ======================

deploy-staging: ## Deploy para staging
	@echo "$(GREEN)🚀 Fazendo deploy para staging...$(NC)"
	git push origin main
	# Adicionar comandos específicos de deploy

deploy-prod: ## Deploy para produção
	@echo "$(GREEN)🚀 Fazendo deploy para produção...$(NC)"
	@echo "$(RED)⚠️  Confirme que você quer fazer deploy para PRODUÇÃO [y/N]$(NC)"
	@read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		echo "$(GREEN)Fazendo deploy...$(NC)"; \
		git push origin main; \
	else \
		echo "$(YELLOW)Deploy cancelado$(NC)"; \
	fi

# ======================
# STATUS
# ======================

status: ## Mostra status dos containers
	@echo "$(GREEN)📊 Status dos containers:$(NC)"
	$(COMPOSE_DEV) ps

ps: status ## Alias para status

top: ## Mostra uso de recursos dos containers
	docker stats

# ======================
# CONFIGURAÇÃO INICIAL
# ======================

init: ## Configuração inicial do projeto
	@echo "$(GREEN)🎯 Configuração inicial do projeto iLyra...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(YELLOW)📝 Arquivo .env criado. Configure as variáveis necessárias.$(NC)"; \
	fi
	@echo "$(GREEN)✅ Configuração inicial concluída!$(NC)"
	@echo "$(YELLOW)Próximos passos:$(NC)"
	@echo "1. Configure as variáveis no arquivo .env"
	@echo "2. Execute: make dev"
	@echo "3. Acesse: http://localhost:3000"
