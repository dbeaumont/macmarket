.PHONY: help init up down restart logs status urls dev dev-down \
        backend-run shop-run admin-run \
        build build-backend build-shop build-admin \
        test test-modularity \
        db-reset db-shell \
        ollama-status ollama-logs ollama-pull \
        clean reset

COMPOSE := docker compose
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
INFRA_SERVICES := postgres keycloak ollama ollama-init mailpit

help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === Initialisation ===

init: ## Initialiser le projet (creer .env, dossiers data)
	@if [ ! -f .env ]; then \
		cp .env.template .env; \
		echo "✅ .env cree depuis .env.template"; \
	else \
		echo "⚠️  .env existe deja, pas de modification"; \
	fi
	@mkdir -p data/ollama data/invoices
	@echo "✅ Repertoires data/ crees"

# === Docker Compose — Production ===

up: init ## Lancer toute la stack (7 services)
	$(COMPOSE) up -d
	@echo ""
	@echo "✅ Stack demarree"
	@echo "   Boutique :   http://localhost:$(or $(FRONTEND_SHOP_PORT),3000)"
	@echo "   Backoffice : http://localhost:$(or $(FRONTEND_ADMIN_PORT),3001)"
	@echo "   Backend :    http://localhost:$(or $(BACKEND_PORT),8080)"
	@echo "   Keycloak :   http://localhost:$(or $(KEYCLOAK_HTTP_PORT),8180)"
	@echo "   Mailpit :    http://localhost:$(or $(MAILPIT_UI_PORT),8025)"
	@echo "   Ollama :     http://localhost:11434"

down: ## Arreter toute la stack
	$(COMPOSE) down

restart: down up ## Redemarrer toute la stack

logs: ## Voir les logs de tous les services
	$(COMPOSE) logs -f

status: ## Voir le statut des services (health)
	$(COMPOSE) ps

urls: ## Lister toutes les URLs disponibles
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║                    MacMarket — URLs                          ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║                                                              ║"
	@echo "║  APPLICATIONS                                                ║"
	@echo "║  ──────────────────────────────────────────────────────      ║"
	@echo "║  Boutique        http://localhost:3000                       ║"
	@echo "║  Boutique (dev)  http://localhost:5173                       ║"
	@echo "║  Backoffice      http://localhost:3001                       ║"
	@echo "║  Backoffice (dev)http://localhost:5174                       ║"
	@echo "║                                                              ║"
	@echo "║  API BACKEND                                                 ║"
	@echo "║  ──────────────────────────────────────────────────────      ║"
	@echo "║  Health          http://localhost:8080/actuator/health       ║"
	@echo "║  Produits        http://localhost:8080/api/v1/products       ║"
	@echo "║  Categories      http://localhost:8080/api/v1/categories     ║"
	@echo "║  Panier          http://localhost:8080/api/v1/cart/items     ║"
	@echo "║  Commandes       http://localhost:8080/api/v1/orders         ║"
	@echo "║  Paiement        http://localhost:8080/api/v1/payments       ║"
	@echo "║  Chat IA         http://localhost:8080/api/v1/assistant      ║"
	@echo "║  Admin produits  http://localhost:8080/api/v1/admin/products ║"
	@echo "║  Admin commandes http://localhost:8080/api/v1/admin/orders   ║"
	@echo "║  Admin stats     http://localhost:8080/api/v1/admin/stats    ║"
	@echo "║  Admin dashboard http://localhost:8080/api/v1/admin/dashboard║"
	@echo "║  Admin clients   http://localhost:8080/api/v1/admin/customers║"
	@echo "║                                                              ║"
	@echo "║  INFRASTRUCTURE                                              ║"
	@echo "║  ──────────────────────────────────────────────────────      ║"
	@echo "║  Keycloak admin  http://localhost:8180  (admin/admin)        ║"
	@echo "║  Keycloak OIDC   http://localhost:8180/realms/macmarket      ║"
	@echo "║  Mailpit UI      http://localhost:8025                       ║"
	@echo "║  Ollama API      http://localhost:11434                      ║"
	@echo "║  PostgreSQL      localhost:5432  (macmarket/macmarket_secret)║"
	@echo "║                                                              ║"
	@echo "║  COMPTES DE TEST                                             ║"
	@echo "║  ──────────────────────────────────────────────────────      ║"
	@echo "║  client@macmarket.com   / password  (CUSTOMER)               ║"
	@echo "║  client2@macmarket.com  / password  (CUSTOMER)               ║"
	@echo "║  manager@macmarket.com  / password  (MANAGER)                ║"
	@echo "║  admin@macmarket.com    / password  (ADMIN)                  ║"
	@echo "║                                                              ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""

# === Docker Compose — Developpement ===

dev: init ## Lancer uniquement l'infra (dev mode)
	$(COMPOSE_DEV) up -d $(INFRA_SERVICES)
	@echo ""
	@echo "✅ Infra demarree (dev mode)"
	@echo "   Lancer le backend    : make backend-run"
	@echo "   Lancer la boutique   : make shop-run"
	@echo "   Lancer le backoffice : make admin-run"

dev-down: ## Arreter l'infra dev
	$(COMPOSE_DEV) down

backend-run: ## Lancer le backend Spring Boot (dev, hot-reload)
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

shop-run: ## Lancer le frontend boutique (dev, hot-reload sur 5173)
	cd frontend-shop && npm run dev

admin-run: ## Lancer le frontend backoffice (dev, hot-reload sur 5174)
	cd frontend-admin && npm run dev

# === Build ===

build: ## Construire toutes les images Docker
	$(COMPOSE) build

build-backend: ## Construire uniquement l'image backend
	$(COMPOSE) build backend

build-shop: ## Construire uniquement l'image frontend-shop
	$(COMPOSE) build frontend-shop

build-admin: ## Construire uniquement l'image frontend-admin
	$(COMPOSE) build frontend-admin

# === Tests ===

test: ## Lancer les tests backend (Testcontainers)
	cd backend && ./mvnw test

test-modularity: ## Lancer uniquement les tests de modularite
	cd backend && ./mvnw test -Dtest=MacMarketModularityTests

# === Base de donnees ===

db-reset: ## Reinitialiser la base de donnees (supprime les donnees)
	$(COMPOSE) down -v
	@echo "✅ Volumes supprimes, base reinitialisee"
	@echo "   Relancer avec : make up"

db-shell: ## Ouvrir un shell psql dans le container postgres
	$(COMPOSE) exec postgres psql -U macmarket -d macmarket

# === Ollama / LLM ===

ollama-status: ## Verifier le statut du modele Ollama
	$(COMPOSE) exec ollama ollama list

ollama-logs: ## Voir les logs du pull initial du modele
	$(COMPOSE) logs ollama-init

ollama-pull: ## Re-pull le modele Mistral manuellement
	$(COMPOSE) exec ollama ollama pull mistral

# === Nettoyage ===

clean: down ## Tout nettoyer (containers, volumes, images)
	$(COMPOSE) down -v --rmi local
	@echo "✅ Containers, volumes et images supprimes"

reset: clean ## Reset complet (clean + supprimer data/)
	rm -rf data/
	@echo "✅ Repertoire data/ supprime (modele Ollama + factures)"
	@echo "   Relancer avec : make up"
