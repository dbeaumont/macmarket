# MacMarket — Plan d'implémentation & Suivi d'avancement

> **Dernière mise à jour** : 2026-06-28
> **Statut global** : TOUTES LES PHASES TERMINÉES (1-8)
> **Tests** : 26/26 PASSED (2 modularity + 12 catalog + 8 cart + 4 order)
> **Architecture** : DDD complète (CLAUDE.md respecté), 114 fichiers Java, TypeScript strict (0 any, readonly)
> **Note reprise** : Lire CLAUDE.md pour contraintes DDD/TS, puis ce fichier pour reprendre à Phase 6

---

## Résumé pour reprise de contexte

| Phase | Statut | Tests | Points clés |
|-------|--------|-------|-------------|
| 1. Scaffolding | TERMINÉE | — | Maven, Docker Compose (7 services), .env.template, Makefile (20 cibles), Keycloak realm JSON |
| 2. Catalog | TERMINÉE | 12 tests | DDD complet, 50 produits seed, pagination, ILIKE natif PostgreSQL |
| 3. Auth | TERMINÉE | — | OIDC PKCE, 2 clients Keycloak (shop/admin), 3 rôles, AdminGuard, ProtectedRoute |
| 4. Cart | TERMINÉE | 8 tests | DDD, Zustand store, CartDrawer, badge header, cleanup job, ProductUpdatedEvent listener |
| 5. Order+Payment+Notif | TERMINÉE | 4 tests | DDD, checkout synchrone, payment mock 90%, stock async, EmailService+Thymeleaf, PDF facture |
| DDD Refactoring | TERMINÉ | — | Catalog + Cart refactorés (CLAUDE.md), TypeScript strict (0 any, readonly) |
| 6. Assistant IA | TERMINÉE | — | Spring AI 2.0, Ollama/Mistral, SSE streaming, Caffeine cache, suggestions par nom |
| 7. Backoffice admin | TERMINÉE | — | 27 fichiers Java backend, 13 pages frontend, Recharts + TanStack Table |
| 8. Polish+Docker | TERMINÉE | — | Dockerfiles corrigés, UI polish (skeletons, toasts, responsive), 7 services healthy |

**Corrections appliquées en cours de route** :
- `spring-boot-starter-flyway` requis (Spring Boot 4.x modularisation)
- `flyway-database-postgresql` nécessaire pour PostgreSQL 17
- `ddl-auto: none` (conflit event_publication), Flyway V3 pour event_publication
- Requête native `ILIKE` (Hibernate 7 + PG bytea bug avec LOWER)
- Keycloak healthcheck sur port management 9000 (pas 8180)
- `directAccessGrantsEnabled: true` ajouté via API admin pour tests CLI
- npm registry `--registry https://registry.npmjs.org` (Nexus local inaccessible)
- Maven `-s /tmp/empty-settings.xml` (bypass Nexus mirror)
- `Persistable<UUID>` + `markAsNew()` pour JPA entities avec ID domain-generated
- `EntityManager.flush()` après `clear()` + `add()` (orphanRemoval JPA)
- Product save : charger existing entity et update fields (pas re-mapper toJpa)

---

## Suivi d'avancement

### Phase 1 — Scaffolding et infrastructure
- [x] Initialiser le repo git
- [x] Créer `.gitignore`, `.env.template`
- [x] Créer `Makefile` (init, up, down, dev, build, test, clean, reset, etc.)
- [x] Créer le projet Maven (`backend/pom.xml`) avec Spring Boot 4.1.0, Spring Modulith 2.0.5, Spring AI 2.0.0
- [x] Créer `MacMarketApplication.java` avec `@EnableScheduling`
- [x] Créer `docker-compose.yml` (postgres, keycloak, ollama, ollama-init, mailpit, backend, frontend-shop, frontend-admin)
- [x] Créer `docker-compose.dev.yml` (overlay dev)
- [x] Créer le script SQL init Keycloak schema (`init-keycloak-schema.sql`)
- [x] Créer le realm Keycloak JSON (`keycloak/macmarket-realm.json`) avec 2 clients, 3 rôles, 4 utilisateurs seed
- [x] Configurer `application.yml`, `application-dev.yml`, `application-docker.yml`
- [x] Configurer Spring Security (`SecurityConfig` avec CSRF disable, session stateless, JWT converter Keycloak)
- [x] Configurer CORS (`CorsConfig` avec `@Profile("dev")`)
- [x] Créer `GlobalExceptionHandler`
- [x] Scaffolder `frontend-shop` (Vite + React + TypeScript + Tailwind v4 + shadcn/ui)
- [x] Scaffolder `frontend-admin` (Vite + React + TypeScript + Tailwind v4 + shadcn/ui)
- [x] Configurer `vite.config.ts` (proxy `/api`) pour les deux frontends
- [x] Créer les Dockerfiles multi-stage (backend, frontend-shop, frontend-admin)
- [x] Créer les `nginx.conf` (frontend-shop, frontend-admin) avec reverse proxy `/api/*`
- [x] Créer `README.md`
- [x] **BUILD SUCCESS** : `./mvnw compile` passe (4 fichiers Java compilés)
- [x] Installer Tailwind CSS v4 + shadcn/ui sur les deux frontends
- [x] **VÉRIFICATION** : docker compose infra fonctionne — postgres (healthy), keycloak (realm importé, OIDC OK), ollama (healthy, mistral en cours de pull), mailpit (healthy, API OK)

### Phase 2 — Module catalog + UI listing produits
- [x] Écrire Flyway V1 (`catalog_products` avec `reserved_quantity`, `catalog_product_specs`)
- [x] Écrire Flyway V6 (seed 50 produits Mac avec images Apple)
- [x] Implémenter `ProductEntity`, `ProductSpecEntity`
- [x] Implémenter `ProductRepository` (Spring Data JPA)
- [x] Implémenter `CatalogService` (interface publique) + `CatalogServiceImpl`
- [x] Implémenter `Product` (DTO), `ProductFilter`, `ProductMapper`
- [x] Implémenter `CatalogController` (endpoints publics : GET products, GET slug, GET categories)
- [x] Implémenter endpoints admin CRUD (`@PreAuthorize("hasAnyRole('MANAGER','ADMIN')")`)
- [x] Déclarer événements : `ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductDeletedEvent`, `StockInsufficientEvent`
- [x] Écrire `MacMarketModularityTests` (2/2 passed)
- [x] Écrire `CatalogIntegrationTests` (12/12 passed — contre PostgreSQL Docker Compose)
- [x] Implémenter `HomePage` (frontend-shop) : hero banner + produits vedettes
- [x] Implémenter `ProductListPage` : grille + filtres + recherche + pagination
- [x] Implémenter `ProductDetailPage` : image, specs, prix, ajout panier
- [x] Implémenter composants : `ProductCard`, `ProductGrid`, `ProductFilters`, `ShopHeader`, `Footer`
- [x] Implémenter hooks TanStack Query (`useProducts`, `useProduct`)
- [x] Implémenter pagination shadcn/ui avec sync URL
- [x] **BUILD SUCCESS** : backend compile (21 fichiers), frontend-shop build OK (437 Ko JS)
- [x] **VÉRIFICATION E2E** : Pagination 5 pages (12/page, 52 produits), filtrage catégorie (7 iMac, 2 Mac Pro), recherche ("Ultra" → 5, "M4 Max" → 8), tri prix asc/desc, 6 catégories, slug détail avec specs, admin 401 sans token, health UP

### Phase 3 — Intégration authentification
- [x] Intégrer `react-oidc-context` dans `frontend-shop` (client `macmarket-shop`)
- [x] Intégrer `react-oidc-context` dans `frontend-admin` (client `macmarket-admin`)
- [x] Implémenter `ProtectedRoute` (frontend-shop)
- [x] Implémenter `AdminGuard` (frontend-admin, vérifie MANAGER/ADMIN, requiredRole ADMIN pour stats)
- [x] Implémenter page d'accueil backoffice (`HomePage.tsx` — landing + bouton login + redirect dashboard)
- [x] Implémenter `AccessDeniedPage` (frontend-admin)
- [x] Ajouter login/logout dans `ShopHeader` (nom utilisateur, bouton déconnexion)
- [x] Implémenter endpoint `GET /api/v1/users/me` (UserController, renvoie sub/email/name/roles)
- [x] Implémenter `AccountPage` (frontend-shop, affiche infos + rôles + déconnexion)
- [x] Implémenter `AdminLayout` avec sidebar (navigation MANAGER + section stats ADMIN-only)
- [x] Implémenter `DashboardPage` (frontend-admin, KPI cards placeholder)
- [x] Configurer token JWT auto-inject dans les appels API (TokenSync)
- [x] **BUILD SUCCESS** : backend compile (22 fichiers), frontend-shop + frontend-admin build OK, 14/14 tests passent
- [x] **VÉRIFICATION E2E** : Login CUSTOMER (Jean Dupont, roles=[CUSTOMER]), login MANAGER (roles=[MANAGER]), login ADMIN (roles=[MANAGER,ADMIN] — composite). Sans auth→401. CUSTOMER→403 sur admin. MANAGER→201 sur products, 403 sur stats. ADMIN→OK sur tout. /users/me renvoie email+name+roles.

### Phase 4 — Module cart
- [x] Écrire Flyway V2 (`cart_carts`, `cart_items`)
- [x] Implémenter `CartEntity`, `CartItemEntity`
- [x] Implémenter `CartRepository` (avec `deleteAbandonedCarts`)
- [x] Implémenter `CartService` (interface) + `CartServiceImpl` (utilise `CatalogService` pour snapshot produit)
- [x] Implémenter `CartController` (GET/POST/PUT/DELETE avec `@AuthenticationPrincipal Jwt`)
- [x] Implémenter `CartCleanupJob` (`@Scheduled`, nettoyage paniers > 24h)
- [x] Implémenter Zustand `cart-store.ts` (fetchCart, addItem, updateQuantity, removeItem, clearCart, itemCount)
- [x] Implémenter `CartDrawer` (slide-over, liste items, total, bouton checkout, vider)
- [x] Implémenter `CartItemRow` (image, nom, prix, quantité +/-, supprimer)
- [x] Ajouter badge panier dans `ShopHeader` (count, auto-fetch au login)
- [x] Intégrer "Ajouter au panier" dans `ProductCard` et `ProductDetailPage` (redirect login si non connecté)
- [x] `package-info.java` avec `allowedDependencies = { "catalog" }`
- [x] Implémenter listener `ProductUpdatedEvent` → refresh snapshots prix (`CatalogEventListener` + `CartItemRepository.refreshProductSnapshot`)
- [x] Écrire Flyway V3 (`event_publication` table pour Spring Modulith events)
- [x] Écrire `CartIntegrationTests` (8/8 passed : empty cart, add, increment, multi-products, update qty, remove, clear, snapshot)
- [x] **22/22 TESTS PASSED** : 2 modularité + 12 catalog + 8 cart
- [x] **PHASE 4 TERMINÉE**

### Phase 5 — Modules order + payment + notification ✅
- [x] Écrire Flyway V4 (`order_orders`, `order_items`) + V5 (`payment_payments`)
- [x] Implémenter module `order` DDD : domain (Order agrégat, OrderId, OrderItem, ShippingInfo, events), application (PlaceOrderService, OrderQueryService, UpdateOrderStatusService), infrastructure (JPA, mapper, PaymentEventListener), presentation (controller, DTOs)
- [x] Implémenter checkout synchrone : `POST /api/v1/orders` → lit panier, crée commande, vide panier, publie `OrderPlacedEvent`
- [x] Implémenter `OrderStatusChangedEvent` (publié sur changement de statut)
- [x] Implémenter module `payment` DDD : domain (Payment agrégat, PaymentId, events), application (ProcessPaymentService 90% succès, PaymentQueryService), infrastructure (JPA, OrderEventListener)
- [x] Implémenter listener `OrderPlacedEvent` → initier paiement (payment module)
- [x] Implémenter listener `PaymentCompletedEvent` / `PaymentFailedEvent` → màj statut commande (order module)
- [x] Implémenter module `notification` : listeners log-based pour 4 events (confirmation commande, paiement OK/KO, changement statut)
- [x] Implémenter `CheckoutPage` (formulaire livraison + récapitulatif + payer)
- [x] Implémenter `OrderDetailPage` (statut, articles, livraison, paiement, auto-refresh)
- [x] Implémenter `OrderHistoryPage` (liste commandes avec badges statut)
- [x] Flux événementiel vérifié E2E : cart→order→payment→order(PAID/CANCELLED)→notification(3 emails)
- [x] Implémenter gestion stock async : `OrderStockEventListener` — reserve on OrderPlaced, confirm on PAID, release on CANCELLED (via enriched OrderStatusChangedEvent with items)
- [x] Implémenter `EmailService` réel avec templates Thymeleaf (`order-confirmation.html`, `payment-result.html`) + envoi SMTP Mailpit
- [x] Implémenter `PdfInvoiceGenerator` (PDFBox) + endpoint `GET /api/v1/orders/{id}/invoice`
- [x] Écrire `OrderIntegrationTests` (4/4 passed: place order, reject empty cart, list by user, auto-payment processing)
- [x] **26/26 TESTS PASSED** (2 modularity + 12 catalog + 8 cart + 4 order)
- [x] **VÉRIFICATION E2E** : stock 40→37 après achat 3 unités, 8 emails dans Mailpit, facture PDF 957 bytes, order PAID, payment COMPLETED, 26/26 tests

### Phase 6 — Module assistant (agent conversationnel IA)

**Backend (DDD : domain/application/infrastructure/presentation)** :
- [x] Créer structure DDD : `assistant/{domain/model,application/service,infrastructure/llm,presentation/{rest,dto}}`
- [x] Domain : `ConversationId` (Value Object), `ChatMessage` record, `ChatStreamEvent` sealed interface, `SuggestedProduct` record
- [x] Application : `ChatService` (orchestre prompt + LLM + mémoire + extraction suggestions), ports `LlmClient`, `ConversationMemoryPort`, `CatalogContextProvider`
- [x] Infrastructure/llm : `SpringAiLlmClient` (wrapper Spring AI `ChatModel`, streaming `Flux<String>`)
- [x] Infrastructure/llm : `CatalogContextCache` (`@EventListener` ProductCreated/Updated/Deleted, `AtomicReference<String>` + `Map<slug, SuggestedProduct>`)
- [x] Application : `PromptBuilder` (system prompt template + injection cache catalogue)
- [x] Infrastructure/llm : `CaffeineConversationMemory` (Caffeine cache `expireAfterAccess(30, MINUTES)`)
- [x] Application : `ProductSuggestionExtractor` (parse réponse LLM → match slugs catalogue via `[SUGGEST:slug]`)
- [x] Infrastructure/llm : gestion indisponibilité Ollama (onErrorResume → message explicite, pas de crash backend)
- [x] Presentation : `AssistantController` (endpoint SSE `POST /api/v1/assistant/chat` via `SseEmitter`, `DELETE /conversations/{id}`)
- [x] Presentation : DTOs (`ChatRequest` avec `@NotBlank`)
- [x] `package-info.java` OPEN, allowedDependencies = { "catalog" }

**Frontend (frontend-shop)** :
- [x] Composant `ChatWidget` (icône flottante bas-droite, toggle panneau)
- [x] Composant `ChatPanel` (panneau fixe slide-in, header avec clear, zone messages scrollable, input)
- [x] Composant `ChatMessage` (bulle user à droite, assistant à gauche, typing indicator cursor)
- [x] Composant `ChatInput` (textarea + bouton envoi/stop, désactivé pendant streaming)
- [x] Composant `ProductSuggestion` (mini-carte produit cliquable avec lien + bouton "Ajouter au panier")
- [x] Hook `use-chat.ts` (SSE streaming via fetch + ReadableStream, état conversation, abort support)
- [x] Intégrer `ChatWidget` dans `App.tsx` (visible sur toutes les pages)

**Vérification** :
- [x] Ollama tourne et modèle mistral disponible (`make ollama-status`) — mistral:latest 4.4 GB
- [x] Poser une question ("Quel Mac mini est le moins cher ?") — réponse correcte (Mac Mini M4 16Go/256Go, 699€)
- [x] Vérifier streaming token par token — tokens SSE reçus un par un
- [x] Vérifier suggestions produits en fin de réponse — event `suggestions` avec slug, nom, prix, image, catégorie
- [x] Tester comportement quand Ollama est arrêté — event `error: "L'assistant est temporairement indisponible"`, pas de crash
- [x] **TESTS** : tous les tests existants passent toujours (26/26 tests)
- [x] **PHASE 6 TERMINÉE**

### Phase 7 — Back-office admin (frontend-admin)

**Déjà fait (Phase 3)** :
- [x] `AdminLayout` avec sidebar (navigation MANAGER + section stats ADMIN-only)
- [x] `AdminGuard` (vérifie MANAGER/ADMIN, requiredRole pour stats)
- [x] `DashboardPage` (KPI cards placeholder)
- [x] `HomePage` landing + `AccessDeniedPage`
- [x] Toutes les routes avec placeholders

**Backend — Module admin (DDD)** :
- [x] Créer structure DDD : `admin/{application/service,infrastructure/{persistence/{entity,repository},messaging},presentation/{rest,dto}}`
- [x] Écrire Flyway V7 (`admin_daily_stats`) — stat_date PK, orders_count, revenue, new_users_count
- [x] Implémenter `AdminDailyStatsEntity` JPA entity + `AdminDailyStatsJpaRepository`
- [x] Implémenter `AdminStatsService` (agrégation revenue/products/customers/orders avec paramètre period)
- [x] Implémenter `AdminEventListener` : `OrderPlacedEvent` → mise à jour `AdminDailyStats` (upsert)
- [x] Implémenter `AdminDashboardController` (`GET /api/v1/admin/dashboard`) : ordersToday/Yesterday, revenue, lowStock, pending, revenueChart 7j, recentOrders, lowStockProducts
- [x] Implémenter `AdminStatsController` (`GET /api/v1/admin/stats/{type}?period=`) avec `@PreAuthorize("hasRole('ADMIN')")`
- [x] Implémenter `AdminCustomerController` (`GET /api/v1/admin/customers`, `/customers/{userId}/orders`)
- [x] Implémenter `AdminOrderController` (`GET /api/v1/admin/orders`, `GET /{id}`, `PUT /{id}/status`)
- [x] `package-info.java` OPEN, allowedDependencies = { "order", "payment", "catalog" }
- [x] Read repositories : `AdminOrderReadRepository`, `AdminProductReadRepository` (queries native + JPQL)
- [x] 14 DTOs records (DashboardResponse, AdminOrderResponse, AdminOrderDetailResponse, CustomerSummaryResponse, stats responses, etc.)

**Frontend — frontend-admin (compléter les placeholders)** :
- [x] Installer `recharts@3.9` + `@tanstack/react-table@8.21`
- [x] API client admin (`src/lib/api.ts`) : apiFetch, setTokenProvider, toutes les fonctions typées (readonly)
- [x] TokenSync dans App.tsx
- [x] Composants partagés : `PeriodSelector`, `StatusBadge`, `StockBadge`
- [x] `DashboardPage` réel : 4 KPI cards avec % change, AreaChart revenus 7j, table 5 commandes récentes, alertes stock
- [x] `InventoryPage` : DataTable @tanstack/react-table, recherche, pagination, StockBadge, lien edit/new
- [x] `ProductFormPage` : formulaire create/edit, auto-slug, select catégorie, specs key-value editor
- [x] `OrdersPage` : DataTable commandes, filtre statut dropdown, pagination, StatusBadge
- [x] `OrderDetailPage` admin : détail, items, dropdown changement statut + confirm, shipping info
- [x] `CustomersPage` : DataTable clients, nb commandes, total dépensé, pagination
- [x] `StatsOverviewPage` : hub 4 cartes cliquables vers pages stats
- [x] `RevenueStatsPage` : AreaChart CA journalier (gradient), PieChart catégories (donut), BarChart top 10 produits
- [x] `ProductStatsPage` : BarChart top 10 ventes, PieChart catégories
- [x] `CustomerStatsPage` : BarChart top clients par total dépensé
- [x] `OrderStatsPage` : AreaChart volume, PieChart statuts
- [x] Routes App.tsx mises à jour (tous placeholders remplacés)

**Vérification** :
- [x] Login MANAGER → dashboard (15 orders, 14483€ revenue, 11 low stock), inventaire (60 produits), commandes (15, paginées), clients (15)
- [x] Login ADMIN → tout MANAGER + 4 stats endpoints (revenue, products, customers, orders avec period)
- [x] CUSTOMER bloqué → 403 sur /admin/dashboard, /admin/orders, /admin/stats/*. MANAGER → 403 sur /admin/stats/*
- [x] Changement statut commande PAID→PROCESSING → email "Commande #75fef0fb — PROCESSING" dans Mailpit (19ème email)
- [x] CRUD produit : POST create (201) → PUT update nom+prix+stock (200) → DELETE deactivate (204, active=false)
- [x] **PHASE 7 TERMINÉE**
- [x] **TESTS** : tous les tests existants passent toujours (26/26 tests)
- [x] **BUILD** : backend compile, frontend-admin build OK (897 Ko JS), frontend-shop build OK

### Phase 8 — Polish et Dockerisation complète

**Dockerisation** :
- [x] Vérifier/corriger Dockerfile backend (multi-stage, bypass Nexus via `-s /tmp/empty-settings.xml`)
- [x] Vérifier/corriger Dockerfile frontend-shop (multi-stage, `npm ci --registry https://registry.npmjs.org`)
- [x] Vérifier/corriger Dockerfile frontend-admin (idem)
- [x] Vérifier nginx.conf des deux frontends (reverse proxy `/api/*` → backend:8080, SPA fallback, gzip)
- [x] `docker compose up --build` complet — 7 services build+start OK, tous healthy
- [x] Backend Docker connecté à postgres (Flyway V7), keycloak (JWT), ollama, mailpit
- [x] Frontends : SPA (HTTP 200) + proxy API (`/api/v1/products` via nginx → backend:8080)

**UI Polish — frontend-shop** :
- [x] Loading skeletons : ProductGridSkeleton, ProductDetailSkeleton, OrderListSkeleton (composant réutilisable)
- [x] ErrorBoundary global (class component, catch + fallback "Une erreur est survenue")
- [x] Toast notifications : sonner Toaster, toast.success ajout panier, commande passée, toast.error paiement
- [x] Animations : CartDrawer CSS slide-in (translate-x + transition 300ms), badge scale pulse
- [x] Responsive mobile : hamburger menu ShopHeader, CartDrawer full-width mobile, grille responsive

**UI Polish — frontend-admin** :
- [x] Sidebar collapse mobile (hamburger + overlay + transition translate-x, auto-close on nav)
- [x] Loading skeletons (déjà présents) : DashboardPage, InventoryPage, OrdersPage
- [x] Breadcrumb component (labels FR, segments UUID ignorés, intégré dans AdminLayout)

**Documentation** :
- [x] README.md : architecture DDD, diagramme événements inter-modules, structure hexagonale
- [x] `.env.template` à jour (toutes les variables)
- [x] `.gitignore` vérifié (data/, .env, target/, node_modules/, dist/, .idea/, .vscode/)

**Tests finaux** :
- [x] `./mvnw test` — 26/26 tests passent
- [x] `npm run build` — frontend-shop et frontend-admin buildent sans erreur
- [x] `docker compose up` — 7 services healthy (backend, shop, admin, postgres, keycloak, ollama, mailpit)
- [ ] **VÉRIFICATION FINALE** complète (voir checklist ci-dessous)

### Checklist de vérification finale
- [x] `docker compose up --build` démarre les 7 services — tous healthy
- [x] Boutique : 66 produits, catalogue paginé
- [x] Login via Keycloak (client@macmarket.com, token 1190 chars)
- [x] Catalogue : filtre catégorie (Mac Pro: 2, iMac: 7), pagination OK
- [x] Panier : ajout 3 unités Mac Mini (1800€)
- [x] Checkout : commande passée (PENDING_PAYMENT), paiement auto (CANCELLED/PAID 90%)
- [x] Emails Mailpit : confirmation commande + résultat paiement
- [x] Facture PDF : 200 OK, 957 bytes
- [x] Historique commandes : 1 commande
- [x] Chat IA : streaming SSE + suggestions produits (vérifié Phase 6)
- [x] Backoffice ADMIN : dashboard (25 orders, 24671€), stats 4 endpoints
- [x] Backoffice CUSTOMER : 403 Forbidden
- [x] `./mvnw test` : 26/26 tests passent
- [x] **TOUTES LES PHASES TERMINÉES**

---

## Stack technique

| Composant | Technologie | Version |
|-----------|------------|---------|
| Backend | Java (source/target) | 25 |
| Framework | Spring Boot | 4.1.0 |
| Modularité | Spring Modulith | 2.0.5 |
| IA / LLM | Spring AI + Ollama (conteneur Docker) | Spring AI 2.0.0 + Mistral 7B |
| Base de données | PostgreSQL | 17-alpine |
| Auth | Keycloak (OAuth2/OIDC) | 26.6.0 |
| Frontend | React + Vite + TypeScript | React 19, Vite 6 |
| UI | Tailwind CSS v4 + shadcn/ui | Latest |
| State mgmt | TanStack Query v5 + Zustand | Latest |
| Auth client | react-oidc-context / oidc-client-ts | Latest |
| Migrations DB | Flyway | Managed par Spring Boot |
| Emails (dev) | Mailpit | Latest |
| Infra | Docker Compose | 7 services |

---

## Architecture Docker Compose

7 services + 1 service init. Chaîne de démarrage ordonnée par `depends_on` + healthchecks :

```
postgres (healthy)
├──→ keycloak (healthy)
│    └──→ backend (healthy)
│         ├──→ frontend-shop
│         └──→ frontend-admin
├──→ backend (via depends_on postgres)
ollama (healthy)
├──→ ollama-init (run once, exit)
├──→ backend (via depends_on ollama, condition: service_healthy)
mailpit (aucune dépendance)
├──→ backend (via depends_on mailpit)
```

### docker-compose.yml complet

```yaml
services:

  postgres:
    image: postgres:17-alpine
    container_name: macmarket-postgres
    environment:
      POSTGRES_DB: macmarket
      POSTGRES_USER: ${POSTGRES_USER:-macmarket}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-macmarket_secret}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/main/resources/db/init-keycloak-schema.sql:/docker-entrypoint-initdb.d/01-init-keycloak.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U macmarket -d macmarket"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s
    networks:
      - macmarket-net

  keycloak:
    image: keycloak/keycloak:26.6.0
    container_name: macmarket-keycloak
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/macmarket?currentSchema=keycloak
      KC_DB_USERNAME: ${POSTGRES_USER:-macmarket}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD:-macmarket_secret}
      KC_HOSTNAME: localhost
      KC_HTTP_PORT: 8180
      KC_HEALTH_ENABLED: true
    command: start-dev --import-realm
    ports:
      - "8180:8180"
    volumes:
      - ./keycloak/macmarket-realm.json:/opt/keycloak/data/import/macmarket-realm.json
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/localhost/9000 && echo -e 'GET /health/ready HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3 && cat <&3 | grep -q '200'"]
      interval: 10s
      timeout: 5s
      retries: 15
      start_period: 30s
    networks:
      - macmarket-net

  ollama:
    image: ollama/ollama:latest
    container_name: macmarket-ollama
    ports:
      - "11434:11434"
    volumes:
      - ./data/ollama:/root/.ollama
    healthcheck:
      test: ["CMD-SHELL", "ollama list || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 10s
    networks:
      - macmarket-net

  ollama-init:
    image: ollama/ollama:latest
    container_name: macmarket-ollama-init
    entrypoint: ["ollama", "pull", "mistral"]
    environment:
      OLLAMA_HOST: ollama:11434
    depends_on:
      ollama:
        condition: service_healthy
    networks:
      - macmarket-net
    restart: "no"

  mailpit:
    image: axllent/mailpit:latest
    container_name: macmarket-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8025/api/v1/info || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 5s
    networks:
      - macmarket-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: macmarket-backend
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/macmarket
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-macmarket}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-macmarket_secret}
      SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI: http://keycloak:8180/realms/macmarket
      SPRING_AI_OLLAMA_BASE_URL: http://ollama:11434
      SPRING_MAIL_HOST: mailpit
      SPRING_MAIL_PORT: 1025
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      keycloak:
        condition: service_healthy
      ollama:
        condition: service_healthy
      mailpit:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - macmarket-net

  frontend-shop:
    build:
      context: ./frontend-shop
      dockerfile: Dockerfile
    container_name: macmarket-frontend-shop
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:80/ || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 5s
    networks:
      - macmarket-net

  frontend-admin:
    build:
      context: ./frontend-admin
      dockerfile: Dockerfile
    container_name: macmarket-frontend-admin
    ports:
      - "3001:80"
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:80/ || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 5s
    networks:
      - macmarket-net

volumes:
  postgres_data:

networks:
  macmarket-net:
    driver: bridge
```

### Ordre de démarrage garanti

| Étape | Service | Attend | Healthcheck | Temps estimé |
|-------|---------|--------|-------------|--------------|
| 1 | `postgres` | — | `pg_isready` | ~5s |
| 1 | `ollama` | — | `ollama list` | ~5s |
| 1 | `mailpit` | — | `wget /api/v1/info` | ~3s |
| 2 | `keycloak` | postgres healthy | HTTP `/health/ready` 200 | ~30s |
| 2 | `ollama-init` | ollama healthy | — (run once, pull mistral ~5min au 1er lancement) | ~5min / 0s |
| 3 | `backend` | postgres + keycloak + ollama + mailpit healthy | Actuator `/actuator/health` | ~15s |
| 4 | `frontend-shop` | backend healthy | `wget /` | ~3s |
| 4 | `frontend-admin` | backend healthy | `wget /` | ~3s |

> **Note** : le backend attend Ollama `healthy` (serveur prêt), pas `ollama-init` terminé (modèle pullé). Le backend gère gracieusement l'absence du modèle au démarrage — les requêtes chat retournent un message explicite tant que le modèle n'est pas prêt.

### docker-compose.dev.yml (overlay développement)

```yaml
services:
  backend:
    profiles: ["full"]
  frontend-shop:
    profiles: ["full"]
  frontend-admin:
    profiles: ["full"]
```

Usage : `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres keycloak ollama ollama-init mailpit`

Les services backend et frontends sont exclus (profile `full`), on les lance sur l'hôte pour le hot-reload.

**Dev overlay** : seuls postgres, keycloak, ollama, ollama-init et mailpit tournent dans Docker. Backend (8080), frontend-shop (5173) et frontend-admin (5174) sur l'hôte.

### `.env.template` et gestion des variables

Toutes les variables Docker Compose sont centralisées dans un `.env` (non commité). Un `.env.template` (commité) sert de référence avec des valeurs par défaut pour le développement.

**`.env.template`** :
```bash
# ============================================
# MacMarket — Variables d'environnement
# Copier vers .env : make init
# ============================================

# --- PostgreSQL ---
POSTGRES_USER=macmarket
POSTGRES_PASSWORD=macmarket_secret
POSTGRES_DB=macmarket

# --- Keycloak ---
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_HTTP_PORT=8180

# --- Backend ---
SPRING_PROFILES_ACTIVE=docker
BACKEND_PORT=8080

# --- Ollama / LLM ---
OLLAMA_MODEL=mistral

# --- Frontend ---
FRONTEND_SHOP_PORT=3000
FRONTEND_ADMIN_PORT=3001

# --- Mailpit ---
MAILPIT_SMTP_PORT=1025
MAILPIT_UI_PORT=8025
```

Le `docker-compose.yml` référence ces variables via `${VARIABLE:-default}`. Le `.env` est auto-généré par `make init` à partir du template.

### Makefile

```makefile
.PHONY: help init up down restart logs status dev dev-down \
        backend-run shop-run admin-run \
        build test clean reset db-reset \
        ollama-status ollama-logs

# === Configuration ===
COMPOSE := docker compose
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
INFRA_SERVICES := postgres keycloak ollama ollama-init mailpit

# === Aide ===
help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === Initialisation ===
init: ## Initialiser le projet (créer .env, dossiers data)
	@if [ ! -f .env ]; then \
		cp .env.template .env; \
		echo "✅ .env créé depuis .env.template"; \
	else \
		echo "⚠️  .env existe déjà, pas de modification"; \
	fi
	@mkdir -p data/ollama data/invoices
	@echo "✅ Répertoires data/ créés"

# === Docker Compose — Production ===
up: init ## Lancer toute la stack (7 services)
	$(COMPOSE) up -d
	@echo "✅ Stack démarrée"
	@echo "   Boutique :   http://localhost:$${FRONTEND_SHOP_PORT:-3000}"
	@echo "   Backoffice : http://localhost:$${FRONTEND_ADMIN_PORT:-3001}"
	@echo "   Backend :    http://localhost:$${BACKEND_PORT:-8080}"
	@echo "   Keycloak :   http://localhost:$${KEYCLOAK_HTTP_PORT:-8180}"
	@echo "   Mailpit :    http://localhost:$${MAILPIT_UI_PORT:-8025}"
	@echo "   Ollama :     http://localhost:11434"

down: ## Arrêter toute la stack
	$(COMPOSE) down

restart: down up ## Redémarrer toute la stack

logs: ## Voir les logs de tous les services
	$(COMPOSE) logs -f

status: ## Voir le statut des services (health)
	$(COMPOSE) ps

# === Docker Compose — Développement ===
dev: init ## Lancer uniquement l'infra (dev mode)
	$(COMPOSE_DEV) up -d $(INFRA_SERVICES)
	@echo "✅ Infra démarrée (dev mode)"
	@echo "   Lancer le backend  : make backend-run"
	@echo "   Lancer la boutique : make shop-run"
	@echo "   Lancer le backoffice : make admin-run"

dev-down: ## Arrêter l'infra dev
	$(COMPOSE_DEV) down

backend-run: ## Lancer le backend Spring Boot (dev, hot-reload)
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

shop-run: ## Lancer le frontend boutique (dev, hot-reload sur 5173)
	cd frontend-shop && npm install && npm run dev

admin-run: ## Lancer le frontend backoffice (dev, hot-reload sur 5174)
	cd frontend-admin && npm install && npm run dev

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

test-modularity: ## Lancer uniquement les tests de modularité
	cd backend && ./mvnw test -Dtest=MacMarketModularityTests

# === Base de données ===
db-reset: ## Réinitialiser la base de données (supprime les données)
	$(COMPOSE) down -v
	@echo "✅ Volumes supprimés, base réinitialisée"
	@echo "   Relancer avec : make up"

db-shell: ## Ouvrir un shell psql dans le container postgres
	$(COMPOSE) exec postgres psql -U macmarket -d macmarket

# === Ollama / LLM ===
ollama-status: ## Vérifier le statut du modèle Ollama
	$(COMPOSE) exec ollama ollama list

ollama-logs: ## Voir les logs du pull initial du modèle
	$(COMPOSE) logs ollama-init

ollama-pull: ## Re-pull le modèle Mistral manuellement
	$(COMPOSE) exec ollama ollama pull mistral

# === Nettoyage ===
clean: down ## Tout nettoyer (containers, volumes, images)
	$(COMPOSE) down -v --rmi local
	@echo "✅ Containers, volumes et images supprimés"

reset: clean ## Reset complet (clean + supprimer data/)
	rm -rf data/
	@echo "✅ Répertoire data/ supprimé (modèle Ollama + factures)"
	@echo "   Relancer avec : make up"
```

### Structure des répertoires

```
macmarket/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.template               ← commité (valeurs par défaut dev)
├── .env                        ← NON commité (généré par make init)
├── Makefile                    ← automatisation complète
├── .gitignore
├── README.md
├── PLAN.md                     ← ce fichier (suivi d'avancement)
├── data/                       ← NON commité (bind mounts)
│   ├── ollama/                 ← modèle Mistral (~4 Go)
│   └── invoices/               ← factures PDF générées
├── keycloak/
│   └── macmarket-realm.json
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/macmarket/
│       ├── MacMarketApplication.java
│       ├── catalog/            # Module catalog
│       ├── cart/               # Module cart
│       ├── order/              # Module order
│       ├── payment/            # Module payment
│       ├── admin/              # Module admin
│       ├── notification/       # Module notification
│       └── assistant/          # Module assistant
├── frontend-shop/
│   ├── Dockerfile / nginx.conf
│   └── src/                    # React boutique
└── frontend-admin/
    ├── Dockerfile / nginx.conf
    └── src/                    # React backoffice
```

---

## Modules Spring Modulith

Package racine : `com.macmarket` — 7 modules

### Module `catalog`
- **Dépendances** : aucune (feuille)
- **Entités** : `ProductEntity` (avec `reserved_quantity`), `ProductSpecEntity`
- **API publique** : `CatalogService`, `Product` (DTO), `ProductCreatedEvent`, `ProductUpdatedEvent`, `ProductDeletedEvent`, `StockInsufficientEvent`
- **Endpoints publics** : `GET /api/v1/products` (paginé, filtrable), `GET /api/v1/products/{slug}`, `GET /api/v1/categories`
- **Endpoints gestion** (`MANAGER`/`ADMIN`) : `POST/PUT/DELETE /api/v1/admin/products`
- **Stock async** : écoute `OrderPlacedEvent` (réserver), `PaymentCompletedEvent` (confirmer), `PaymentFailedEvent` (libérer)

### Module `cart`
- **Dépendances** : `catalog` (lecture seule via `CatalogService`)
- **Entités** : `CartEntity`, `CartItemEntity` (snapshot produit)
- **API publique** : `CartService`, `CartDto`
- **Endpoints** : `GET/POST/PUT/DELETE /api/v1/cart/items`
- **Écoute** : `ProductUpdatedEvent` → refresh snapshots prix
- **Job** : `CartCleanupJob` (`@Scheduled`, paniers > 24h)

### Module `order`
- **Dépendances** : `cart` (lecture via `CartService.getCart()`)
- **Entités** : `OrderEntity`, `OrderItemEntity` (snapshot immuable)
- **Statuts** : PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED / CANCELLED
- **API publique** : `OrderService`, `OrderDto`, `OrderPlacedEvent`, `OrderStatusChangedEvent`
- **Endpoints** : `POST /api/v1/orders` (synchrone checkout), `GET /api/v1/orders`, `GET /api/v1/orders/{id}`, `GET /api/v1/orders/{id}/invoice`
- **Écoute** : `PaymentCompletedEvent` → PAID, `PaymentFailedEvent` → CANCELLED, `StockInsufficientEvent` → CANCELLED

### Module `payment`
- **Dépendances** : aucune directe (event-driven)
- **Entités** : `PaymentEntity`
- **API publique** : `PaymentService`, `PaymentDto`, `PaymentCompletedEvent`, `PaymentFailedEvent`
- **Endpoint** : `GET /api/v1/payments/order/{orderId}` (consultation statut)
- **Écoute** : `OrderPlacedEvent` → initier paiement (unique déclencheur, pas d'endpoint API)
- **Simulateur** : `MockPaymentGateway` — délai 2s, succès 90%

### Module `admin`
- **Dépendances** : `order`, `catalog` (lecture)
- **Entités** : `AdminDailyStats`
- **Endpoints gestion** (`MANAGER`/`ADMIN`) : dashboard KPIs, orders CRUD, customers list
- **Endpoints stats** (`ADMIN` only) : revenue, products, customers, orders (avec paramètre `?period=`)
- **Écoute** : `OrderPlacedEvent`, `PaymentCompletedEvent`, `OrderStatusChangedEvent`

### Module `notification`
- **Dépendances** : aucune directe (event-driven)
- **Composants** : `EmailService` (Spring Mail + Mailpit), `PdfInvoiceGenerator` (PDFBox), templates Thymeleaf
- **Écoute** : `OrderPlacedEvent`, `PaymentCompletedEvent`, `PaymentFailedEvent`, `OrderStatusChangedEvent`
- **Factures** : stockées `./data/invoices/{orderId}.pdf`

### Module `assistant`
- **Dépendances** : `catalog` (lecture via cache)
- **API publique** : `AssistantService`, `ChatMessage`, `ChatResponse`
- **Endpoint** : `POST /api/v1/assistant/chat` (SSE streaming), `DELETE /api/v1/assistant/conversations/{id}`
- **Stack** : Spring AI 2.0 `ChatClient` + Ollama + Caffeine cache + `AtomicReference` cache catalogue

### Flux d'événements

```
catalog ──ProductUpdatedEvent──→ cart (refresh snapshots prix)
catalog ──ProductCreated/Updated/Deleted──→ assistant (refresh cache catalogue)
order ──appel synchrone──→ cart (CartService.getCart() au checkout)
order ──OrderPlacedEvent──→ payment (initier paiement)
order ──OrderPlacedEvent──→ catalog (réserver stock: reserved_quantity += qty)
order ──OrderPlacedEvent──→ notification (email confirmation commande)
order ──OrderPlacedEvent──→ admin (màj statistiques)
payment ──PaymentCompletedEvent──→ order (statut PAID)
payment ──PaymentCompletedEvent──→ catalog (confirmer stock: stock_quantity -= qty, reserved -= qty)
payment ──PaymentCompletedEvent──→ notification (email paiement + facture PDF)
payment ──PaymentCompletedEvent──→ admin (màj revenus)
payment ──PaymentFailedEvent──→ order (statut CANCELLED)
payment ──PaymentFailedEvent──→ catalog (libérer stock: reserved_quantity -= qty)
payment ──PaymentFailedEvent──→ notification (email échec)
order ──OrderStatusChangedEvent──→ notification (email changement statut)
order ──OrderStatusChangedEvent──→ admin (màj stats)
catalog ──StockInsufficientEvent──→ order (annuler commande)
```

---

## Schéma base de données

Migrations Flyway (schema `public`) :
- **V1** : `catalog_products` (id, name, slug, description, short_desc, price, category, image_url, stock_quantity, reserved_quantity, active, created_at, updated_at), `catalog_product_specs` (id, product_id, spec_key, spec_value, sort_order)
- **V2** : `cart_carts` (id, user_id, created_at, updated_at), `cart_items` (id, cart_id, product_id, product_name, product_image, unit_price, quantity, added_at)
- **V3** : `order_orders` (id, user_id, status, total, shipping_name, shipping_address, shipping_email, created_at, updated_at), `order_items` (id, order_id, product_id, product_name, product_image, unit_price, quantity, subtotal)
- **V4** : `payment_payments` (id, order_id, amount, status, transaction_ref, failure_reason, created_at, completed_at)
- **V5** : `admin_daily_stats` (stat_date, orders_count, revenue, new_users_count, updated_at)
- **V6** : Seed 50 produits Mac

> Table `event_publication` auto-créée par Spring Modulith (`spring.modulith.events.jdbc-schema-initialization.enabled=true`)

Keycloak : schema `keycloak` séparé (même instance PostgreSQL).

---

## Keycloak

**Realm** : `macmarket` — self-registration activée (niveau realm), rôle par défaut `CUSTOMER`

| Client | Type | Portée | Web Origins |
|--------|------|--------|-------------|
| `macmarket-shop` | Public (PKCE) | Boutique | `localhost:5173`, `localhost:3000` |
| `macmarket-admin` | Public (PKCE) | Backoffice | `localhost:5174`, `localhost:3001` |

| Rôle | Description | Accès |
|------|-------------|-------|
| `CUSTOMER` | Client | Boutique : panier, commandes, chat IA |
| `MANAGER` | Gestionnaire | Backoffice : inventaire, commandes, clients |
| `ADMIN` | Administrateur (composite, inclut MANAGER) | Backoffice : tout + dashboard stats |

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `client@macmarket.com` | `password` | CUSTOMER |
| `client2@macmarket.com` | `password` | CUSTOMER |
| `manager@macmarket.com` | `password` | MANAGER |
| `admin@macmarket.com` | `password` | ADMIN |

---

## Frontend-shop — Pages et routing

| Route | Page | Auth |
|-------|------|------|
| `/` | HomePage (hero + produits vedettes) | Public |
| `/products` | ProductListPage (grille paginée + filtres) | Public |
| `/products/:slug` | ProductDetailPage | Public |
| `/cart` | CartPage | Public |
| `/checkout` | CheckoutPage | CUSTOMER |
| `/orders` | OrderHistoryPage | CUSTOMER |
| `/orders/:id` | OrderDetailPage | CUSTOMER |
| `/account` | AccountPage | CUSTOMER |

Widget chat IA flottant sur toutes les pages (icône bas-droite).

---

## Frontend-admin — Pages, routing et navigation

### Sidebar

```
MacMarket Admin
├── Dashboard         (MANAGER)  — KPIs, mini-graphiques, alertes
├── Inventaire        (MANAGER)  — DataTable produits, stocks, CRUD
├── Commandes (badge) (MANAGER)  — DataTable commandes, statuts
├── Clients           (MANAGER)  — DataTable clients, historique
├── ── Statistiques ── (ADMIN) ──
│   ├── Revenus                  — CA, panier moyen, tendances
│   ├── Produits                 — Top ventes, stocks, ruptures
│   ├── Clients                  — Acquisition, LTV, fréquence
│   └── Commandes                — Volume, statuts, délais
└── [Profil + Déconnexion]
```

### Routing

| Route | Page | Auth |
|-------|------|------|
| `/` | HomePage (landing + bouton login) | Public |
| `/auth/callback` | Callback OIDC | — |
| `/access-denied` | AccessDeniedPage | Auth sans rôle |
| `/dashboard` | DashboardPage | MANAGER |
| `/inventory` | InventoryPage | MANAGER |
| `/inventory/new` | ProductFormPage | MANAGER |
| `/inventory/:id/edit` | ProductFormPage + StockEditor | MANAGER |
| `/orders` | OrdersPage | MANAGER |
| `/orders/:id` | OrderDetailPage | MANAGER |
| `/customers` | CustomersPage | MANAGER |
| `/stats` | StatsOverviewPage (hub) | ADMIN |
| `/stats/revenue` | RevenueStatsPage | ADMIN |
| `/stats/products` | ProductStatsPage | ADMIN |
| `/stats/customers` | CustomerStatsPage | ADMIN |
| `/stats/orders` | OrderStatsPage | ADMIN |

### Dashboard — KPIs

| Carte | Exemple | Icône |
|-------|---------|-------|
| Commandes du jour | `23` (+12% vs hier) | ShoppingCart |
| Revenus du jour | `45 230 €` (+8%) | Euro |
| Stock faible | `5` (< 10 unités) | AlertTriangle |
| Commandes en attente | `12` | Clock |

+ Mini-graphique revenus 7j (AreaChart) + 5 dernières commandes + top 5 produits + alertes stock

### Pages statistiques (ADMIN, Recharts)

**Revenus** : CA journalier (AreaChart gradient), CA par catégorie (PieChart donut), panier moyen (LineChart), top 10 produits CA (BarChart horizontal)

**Produits** : Top 10 ventes (BarChart), ventes par catégorie (PieChart), évolution stock (AreaChart empilé), taux rupture (LineChart)

**Clients** : Inscriptions (BarChart), actifs vs inactifs (PieChart donut), LTV top 10 (BarChart horizontal), fréquence achat (Histogram)

**Commandes** : Volume (AreaChart), répartition statuts (PieChart), taux échec paiement (LineChart), délai moyen traitement (BarChart)

Toutes les pages stats ont un **PeriodSelector** (7j/30j/90j/12m/custom) et un **ComparisonToggle** (overlay pointillé période précédente).

---

## Agent conversationnel IA

- **LLM** : Mistral 7B via Ollama (conteneur Docker, bind mount `./data/ollama`)
- **Backend** : Spring AI 2.0 `ChatClient` + `spring-ai-starter-model-ollama`
- **Cache catalogue** : `AtomicReference<String>` rafraîchi sur événements produit
- **Mémoire** : Caffeine cache (`expireAfterAccess(30, MINUTES)`)
- **Streaming** : SSE en deux phases — tokens texte puis suggestions produits matchés
- **Résilience** : gestion gracieuse indisponibilité Ollama (message explicite, retry frontend)
- **Frontend** : widget flottant (icône bas-droite), panneau slide-in, mini-cartes produits suggérés

---

## Configuration transverse

- **CORS** : `@Profile("dev")` uniquement, Vite proxy en fallback, Nginx en prod (same-origin)
- **Erreurs** : `GlobalExceptionHandler` (`@RestControllerAdvice`), format `{error, message, status, timestamp}`
- **Validation** : Jakarta Validation sur tous les DTOs, `@Valid` sur `@RequestBody`
- **Sécurité** : CSRF disabled (JWT stateless), session STATELESS, roles extraits de `realm_access.roles`
- **Scheduling** : `@EnableScheduling` sur `MacMarketApplication`
- **Event publication** : `spring.modulith.events.jdbc-schema-initialization.enabled=true`
- **Variables** : `.env.template` (commité, valeurs par défaut dev), `.env` (non commité, généré par `make init`)
- **Automatisation** : `Makefile` avec cibles `init`, `up`, `down`, `dev`, `build`, `test`, `clean`, `reset`, etc.
- **Fichiers ignorés** : `.gitignore` → `data/`, `.env`, `target/`, `node_modules/`, `dist/`, `*.jar`, `.idea/`, `.vscode/`

---

## Catalogue — 50 produits

8 MacBook Air 13" + 4 MacBook Air 15" + 10 MacBook Pro 14" + 6 MacBook Pro 16" + 7 iMac 24" + 7 Mac Mini + 6 Mac Studio + 2 Mac Pro

Images : CDN Apple (`https://www.apple.com/v/...`), URLs complètes dans le seed Flyway V6.

Prix : de 699 € (Mac Mini M4 16Go/256Go) à 8 499 € (Mac Pro Rack M2 Ultra).
