.PHONY: help init up down restart logs status urls dev dev-down \
        first-time npm-lockfiles \
        backend-run shop-run admin-run \
        build build-no-cache build-backend build-shop build-admin \
        test test-modularity test-frontend \
        db-reset db-shell \
        ollama-status ollama-logs ollama-pull ollama-ensure \
        clean reset

COMPOSE := docker compose
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
INFRA_SERVICES := postgres keycloak ollama ollama-init mailpit
-include .env
export

help: ## Afficher cette aide
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
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
	@$(MAKE) urls

down: ## Arreter toute la stack
	$(COMPOSE) down

restart: down up ## Redemarrer toute la stack

first-time: init ## Premier lancement : regeneration des lockfiles npm + stack + modele LLM
	@$(MAKE) --no-print-directory npm-lockfiles
	@$(MAKE) --no-print-directory up
	@$(MAKE) --no-print-directory ollama-ensure
	@echo ""
	@echo "✅ Environnement pret pour la premiere utilisation"

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
	@echo "║  Boutique (dev)  http://localhost:4200                       ║"
	@echo "║  Backoffice      http://localhost:3001                       ║"
	@echo "║  Backoffice (dev)http://localhost:4201                       ║"
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
	@echo "║  DOCUMENTATION API                                           ║"
	@echo "║  ──────────────────────────────────────────────────────      ║"
	@echo "║  Swagger UI      http://localhost:8080/swagger-ui.html       ║"
	@echo "║  OpenAPI JSON    http://localhost:8080/v3/api-docs           ║"
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

shop-run: ## Lancer le frontend boutique (dev, hot-reload sur 4200)
	cd frontend-shop && npm start

admin-run: ## Lancer le frontend backoffice (dev, hot-reload sur 4201)
	cd frontend-admin && npm start

# === Build ===

build: ## Construire toutes les images Docker
	$(COMPOSE) build

build-no-cache: ## Reconstruire toutes les images Docker sans cache
	$(COMPOSE) build --no-cache

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

test-frontend: ## Lancer les tests des deux frontends (Vitest)
	cd frontend-shop && npm test
	cd frontend-admin && npm test

npm-lockfiles: ## Regenerer les package-lock.json (le champ "resolved" depend du registre npm du poste)
	@echo "⏳ Regeneration de frontend-shop/package-lock.json..."
	cd frontend-shop && rm -rf node_modules package-lock.json && npm install
	@echo "⏳ Regeneration de frontend-admin/package-lock.json..."
	cd frontend-admin && rm -rf node_modules package-lock.json && npm install
	@echo "✅ package-lock.json regeneres"

# === Base de donnees ===

db-reset: ## Reinitialiser la base de donnees (supprime les donnees)
	$(COMPOSE) down -v
	@echo "✅ Volumes supprimes, base reinitialisee"
	@echo "   Relancer avec : make up"

db-shell: ## Ouvrir un shell psql dans le container postgres
	$(COMPOSE) exec postgres psql -U macmarket -d macmarket

# === Ollama / LLM ===

ollama-ensure: ## Telecharger le modele LLM si absent ($(OLLAMA_MODEL))
	@echo "⏳ Verification du modele $(OLLAMA_MODEL)..."
	@until $(COMPOSE) exec -T ollama ollama list > /dev/null 2>&1; do \
		printf "   Attente d'Ollama...\n"; sleep 3; \
	done
	@if $(COMPOSE) exec -T ollama ollama list | grep -q "$(OLLAMA_MODEL)"; then \
		echo "✅ Modele $(OLLAMA_MODEL) deja present"; \
	else \
		echo "⬇️  Telechargement de $(OLLAMA_MODEL)..."; \
		$(COMPOSE) exec -T ollama ollama pull $(OLLAMA_MODEL); \
	fi

ollama-status: ## Verifier le statut du modele Ollama (modele configure: $(OLLAMA_MODEL))
	$(COMPOSE) exec ollama ollama list
	@echo ""
	@echo "Modele configure (.env) : $(OLLAMA_MODEL)"

ollama-logs: ## Voir les logs du pull initial du modele
	$(COMPOSE) logs ollama-init

ollama-pull: ## Re-pull le modele LLM (OLLAMA_MODEL dans .env)
	$(COMPOSE) exec ollama ollama pull $(OLLAMA_MODEL)

# === Nettoyage ===

clean: down ## Tout nettoyer (containers, volumes, images)
	$(COMPOSE) down -v --rmi local
	@echo "✅ Containers, volumes et images supprimes"

reset: clean ## Reset complet (clean + supprimer data/)
	rm -rf data/
	@echo "✅ Repertoire data/ supprime (modele Ollama + factures)"
	@echo "   Relancer avec : make up"
