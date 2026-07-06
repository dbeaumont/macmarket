# Architecture — MacMarket

## Vue d'ensemble

MacMarket est une marketplace e-commerce specialisee dans la vente de Mac (MacBook Air, MacBook Pro, iMac, Mac Mini, Mac Studio, Mac Pro). L'application est concue comme un **monolithe modulaire** utilisant Spring Modulith pour organiser le backend en bounded contexts autonomes, avec deux frontends React separes (boutique client et backoffice admin).

## Classification DICP

| Composant | Disponibilite | Integrite | Confidentialite | Preuve |
|-----------|:---:|:---:|:---:|:---:|
| Catalogue produits | 3 | 2 | 1 | 1 |
| Panier | 2 | 2 | 2 | 1 |
| Commandes | 3 | 4 | 3 | 3 |
| Paiement | 4 | 4 | 4 | 4 |
| Authentification (Keycloak) | 4 | 4 | 4 | 3 |
| Admin / Stats | 2 | 2 | 3 | 2 |
| Notification (email) | 1 | 2 | 2 | 2 |
| Assistant IA | 1 | 1 | 1 | 1 |

Echelle : 1 (faible) a 4 (critique)

## Architecture globale

```mermaid
graph TB
    SHOP["Boutique React :3000"]
    ADMIN_FE["Backoffice React :3001"]
    KC["Keycloak OAuth2/OIDC :8180"]

    subgraph backend["Spring Boot :8080"]
        SEC["SecurityConfig JWT+RBAC"]
        CAT["catalog"]
        CART["cart"]
        ORD["order"]
        PAY["payment"]
        ADM["admin"]
        NOTIF["notification"]
        ASST["assistant"]
        USR["user"]
    end

    PG[("PostgreSQL 17 :5432")]
    OLL["Ollama qwen2.5:3b :11434"]
    MAIL["Mailpit SMTP :1025"]

    SHOP -- "REST+SSE JWT" --> SEC
    ADMIN_FE -- "REST JWT" --> SEC
    SHOP -- "OIDC PKCE" --> KC
    ADMIN_FE -- "OIDC PKCE" --> KC
    SEC -- "valide JWT" --> KC

    CAT --> PG
    CART --> PG
    ORD --> PG
    PAY --> PG
    ADM --> PG
    ASST --> OLL
    NOTIF --> MAIL
```

## Bounded Contexts — modules Spring Modulith

Le backend est decoupe en 8 bounded contexts independants. Chaque module communique avec les autres via des **Domain Events** publies par Spring Modulith, jamais par appel direct a l'infrastructure d'un autre module.

### Dependances directes (appels de services)

```mermaid
graph LR
    order -- "CartApplicationService" --> cart
    cart -- "CatalogQueryService" --> catalog
    assistant -- "CatalogQueryService" --> catalog
    admin -- "UpdateOrderStatusService" --> order
```

### Dependances par evenements

```mermaid
graph LR
    order -. "OrderPlacedEvent" .-> payment
    order -. "OrderPlacedEvent" .-> catalog
    order -. "OrderPlacedEvent" .-> notification
    order -. "OrderPlacedEvent" .-> admin
    order -. "OrderStatusChangedEvent" .-> catalog
    order -. "OrderStatusChangedEvent" .-> notification
    payment -. "PaymentCompletedEvent" .-> order
    payment -. "PaymentCompletedEvent" .-> notification
    payment -. "PaymentFailedEvent" .-> order
    payment -. "PaymentFailedEvent" .-> notification
    catalog -. "ProductUpdatedEvent" .-> cart
    catalog -. "ProductCreatedEvent / UpdatedEvent" .-> assistant
```

### Description des modules

| Module | Responsabilite | Dependances directes | Ecoute events |
|--------|---------------|---------------------|---------------|
| **catalog** | Catalogue produits, stock, CRUD | Aucune | OrderPlacedEvent, OrderStatusChangedEvent |
| **cart** | Panier utilisateur, snapshots produits | catalog | ProductUpdatedEvent |
| **order** | Commandes, checkout, factures PDF | cart | PaymentCompletedEvent, PaymentFailedEvent |
| **payment** | Paiement simule 90% succes | Aucune | OrderPlacedEvent |
| **admin** | Dashboard, stats, gestion commandes | order | OrderPlacedEvent |
| **notification** | Emails transactionnels Thymeleaf | Aucune | 4 events order+payment |
| **assistant** | Chat IA, suggestions produits SSE | catalog | ProductCreated/Updated/DeletedEvent |
| **user** | Endpoint profil utilisateur JWT | Aucune | Aucun |

## Architecture interne d un module — DDD Hexagonale

Chaque bounded context suit la meme structure en couches. La regle de dependance est stricte : les couches internes n ont aucune dependance vers les couches externes.

```mermaid
graph TB
    subgraph Presentation["Presentation"]
        REST["RestController"]
        DTO["DTOs Request/Response"]
        DTOMAP["Mapper Domain vers DTO"]
    end

    subgraph Application["Application"]
        CMD["Commands records"]
        SVC["Application Services Transactional"]
        PORT["Ports interfaces"]
    end

    subgraph Domain["Domain"]
        AGG["Agregats"]
        VO["Value Objects records"]
        EVT["Domain Events records"]
        REPO["Repository interfaces"]
    end

    subgraph Infra["Infrastructure"]
        JPA["Entites JPA separees"]
        JPAREPO["Spring Data Repository"]
        JPAMAP["Mapper Domain JPA"]
        MSG["Event Listeners"]
    end

    REST --> SVC
    REST --> CMD
    SVC --> AGG
    SVC --> REPO
    DTOMAP --> AGG
    JPAREPO -. "implements" .-> REPO
    JPAMAP --> AGG
    JPAMAP --> JPA
    MSG --> SVC

    style Domain fill:#e8f5e9,stroke:#2e7d32
    style Application fill:#e3f2fd,stroke:#1565c0
    style Presentation fill:#fff3e0,stroke:#e65100
    style Infra fill:#fce4ec,stroke:#c62828
```

### Regles architecturales

| Regle | Description |
|-------|-------------|
| Domain pur Java | Aucun import Spring, JPA ou framework dans domain/ |
| Pas de setters | Les agregats exposent des methodes metier, jamais de setters publics |
| Value Objects records | Tous les VOs sont des record Java auto-validants |
| IDs types | Chaque identifiant est un Value Object : ProductId, OrderId, etc. |
| References cross-context | Les IDs d autres modules sont des types locaux : OrderReference, ProductReference |
| Entites JPA separees | Les entites JPA sont dans infrastructure, separees des entites domaine |
| Mapper explicite | Un mapper convertit entre domaine et JPA dans chaque sens |
| Transactional dans application | Jamais dans domain ni infrastructure |
| Controllers sans domaine | Les RestController n importent que la couche application |

## Modele de donnees

```mermaid
erDiagram
    catalog_products {
        uuid id PK
        varchar name
        varchar slug UK
        numeric price
        varchar category
        int stock_quantity
        int reserved_quantity
        boolean active
    }

    catalog_product_specs {
        uuid id PK
        uuid product_id FK
        varchar spec_key
        varchar spec_value
    }

    cart_carts {
        uuid id PK
        varchar user_id UK
    }

    cart_items {
        uuid id PK
        uuid cart_id FK
        uuid product_id
        varchar product_name
        numeric unit_price
        int quantity
    }

    order_orders {
        uuid id PK
        varchar user_id
        varchar status
        numeric total
        varchar shipping_name
        varchar shipping_email
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id
        varchar product_name
        numeric unit_price
        int quantity
        numeric subtotal
    }

    payment_payments {
        uuid id PK
        uuid order_id UK
        numeric amount
        varchar status
        varchar transaction_ref
    }

    admin_daily_stats {
        date stat_date PK
        int orders_count
        numeric revenue
    }

    event_publication {
        uuid id PK
        text listener_id
        text event_type
        text serialized_event
    }

    catalog_products ||--o{ catalog_product_specs : "specs"
    cart_carts ||--o{ cart_items : "items"
    order_orders ||--o{ order_items : "items"
    order_orders ||--o| payment_payments : "paiement"
```

### Convention de nommage des tables

Chaque table est prefixee par le nom du bounded context : `catalog_`, `cart_`, `order_`, `payment_`, `admin_`. Aucun module ne fait de requete directe sur les tables d un autre module.

### Separation des entites JPA — module admin

Le module admin definit ses propres entites JPA en lecture seule (`AdminOrderEntity`, `AdminProductEntity`) mappees sur les memes tables, sans dependre de l infrastructure du module order ou catalog.

## Flux metier principal

```mermaid
sequenceDiagram
    actor Client
    participant Shop as Boutique
    participant KC as Keycloak
    participant API as Backend
    participant Cart as cart
    participant Catalog as catalog
    participant Order as order
    participant Payment as payment
    participant Notif as notification

    Client->>Shop: Parcourir le catalogue
    Shop->>API: GET /api/v1/products
    API->>Catalog: findAll
    Catalog-->>Shop: Liste produits

    Client->>Shop: Connexion
    Shop->>KC: Authorization Code PKCE
    KC-->>Shop: JWT access_token

    Client->>Shop: Ajouter au panier
    Shop->>API: POST /api/v1/cart/items
    API->>Cart: addItem
    Cart->>Catalog: findById prix actuel
    Cart-->>Shop: Panier mis a jour

    Client->>Shop: Commander
    Shop->>API: POST /api/v1/orders
    API->>Order: PlaceOrderCommand
    Order->>Cart: getCart + clearCart
    Order-->>Order: Order.place

    Note over Order,Payment: OrderPlacedEvent

    Order->>Payment: initier paiement
    Order->>Catalog: reserver stock
    Order->>Notif: email confirmation

    Payment->>Payment: simuler 90 pourcent succes

    alt Paiement OK
        Payment-->>Order: PaymentCompletedEvent
        Order->>Order: markAsPaid
        Order->>Catalog: confirmer stock
        Payment-->>Notif: email paiement OK
    else Paiement KO
        Payment-->>Order: PaymentFailedEvent
        Order->>Order: cancel
        Order->>Catalog: liberer stock
        Payment-->>Notif: email echec
    end
```

## Securite

### Flux d authentification OAuth2 OIDC PKCE

```mermaid
sequenceDiagram
    actor User
    participant SPA as React SPA
    participant KC as Keycloak
    participant API as Backend

    User->>SPA: Clic Se connecter
    SPA->>KC: /authorize code_challenge
    KC->>User: Page de login
    User->>KC: email + password
    KC-->>SPA: authorization_code
    SPA->>KC: /token code + code_verifier
    KC-->>SPA: access_token JWT + refresh_token

    SPA->>API: GET /api/v1/orders Authorization Bearer JWT
    API->>API: Valider signature JWT via JWK
    API->>API: Extraire roles realm_access
    API-->>SPA: 200 OK + donnees
```

### Autorisation RBAC

| Niveau | Endpoints | Roles requis |
|--------|-----------|-------------|
| Public | GET /products, GET /categories, GET /actuator/health | Aucun |
| Authentifie | cart, orders, payments, assistant, users/me | Tout role |
| Gestion | admin/orders, admin/products, admin/customers, admin/dashboard | MANAGER, ADMIN |
| Administration | admin/stats | ADMIN |

## Assistant IA

```mermaid
graph LR
    CHAT["ChatWidget SSE"]

    subgraph Backend
        CTRL["AssistantController SseEmitter"]
        SVC2["ChatService Flux"]
        PROMPT["PromptBuilder"]
        CACHE["CatalogContextCache"]
        MEM["ConversationMemory Caffeine"]
        EXTRACT["ProductSuggestionExtractor"]
    end

    OLLAMA["Ollama qwen2.5:3b"]

    CHAT -- "POST /assistant/chat" --> CTRL
    CTRL --> SVC2
    SVC2 --> PROMPT
    SVC2 --> MEM
    SVC2 --> EXTRACT
    PROMPT --> CACHE
    SVC2 -- "stream" --> OLLAMA
    OLLAMA -. "tokens" .-> SVC2
    SVC2 -. "SSE events" .-> CHAT
```

Le cache catalogue est rafraichi automatiquement via les events ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent.

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Runtime | Java | 25 |
| Framework | Spring Boot | 4.1.0 |
| Modularite | Spring Modulith | 2.0.5 |
| IA | Spring AI Ollama | 2.0.0 |
| Base de donnees | PostgreSQL | 17 |
| Migrations | Flyway | integre Spring Boot |
| Cache | Caffeine | integre Spring Boot |
| PDF | Apache PDFBox | 3.0.4 |
| Auth | Keycloak | 26.6.0 |
| Frontend | React + TypeScript | Vite |
| UI | Tailwind CSS v4 + shadcn/ui | — |
| Email | Spring Mail + Thymeleaf | integre |
| SMTP dev | Mailpit | latest |
| Tests | JUnit 5 + Testcontainers | 1.20.6 |
| Conteneurisation | Docker Compose | v2 |

## Deploiement

L application est conteneurisee via Docker Compose avec 7 services :

| Service | Image | Port | Healthcheck |
|---------|-------|------|-------------|
| postgres | postgres:17-alpine | 5432 | pg_isready |
| keycloak | keycloak/keycloak:26.6.0 | 8180 | HTTP /health/ready |
| ollama | ollama/ollama:latest | 11434 | ollama list |
| mailpit | axllent/mailpit:latest | 1025 SMTP / 8025 UI | HTTP /api/v1/info |
| backend | Build local Dockerfile | 8080 | HTTP /actuator/health |
| frontend-shop | Build local Dockerfile | 3000 | HTTP / |
| frontend-admin | Build local Dockerfile | 3001 | HTTP / |

Le service ollama-init est ephemere : il telecharge le modele configure (`OLLAMA_MODEL`, `qwen2.5:3b` par defaut) au premier lancement puis s arrete.

### Profils Spring

| Profil | Usage | Particularites |
|--------|-------|---------------|
| defaut | Configuration de base | URLs localhost, Flyway actif |
| dev | Developpement local | CORS ouvert, password DB en defaut local |
| docker | Docker Compose | URLs internes postgres, keycloak, ollama, mailpit |

## Arborescence du projet

```
spring-modulith/
├── ARCHITECTURE.md              <- ce fichier
├── CLAUDE.md                    <- regles de developpement
├── README.md                    <- guide de demarrage
├── Makefile                     <- commandes dev/ops
├── docker-compose.yml           <- stack complete 7 services
├── docker-compose.dev.yml       <- override dev infra seule
├── keycloak/
│   └── macmarket-realm.json     <- configuration realm + users
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/macmarket/
│       ├── MacMarketApplication.java
│       ├── SecurityConfig.java
│       ├── CorsConfig.java
│       ├── GlobalExceptionHandler.java
│       ├── ErrorResponse.java
│       ├── catalog/             <- bounded context catalogue
│       ├── cart/                <- bounded context panier
│       ├── order/               <- bounded context commandes
│       ├── payment/             <- bounded context paiement
│       ├── admin/               <- bounded context administration
│       ├── notification/        <- bounded context notification
│       ├── assistant/           <- bounded context assistant IA
│       └── user/                <- bounded context utilisateur
├── frontend-shop/               <- React SPA boutique
│   └── src/
│       ├── components/          <- composants UI product, cart, chat
│       ├── pages/               <- pages routees
│       ├── hooks/               <- hooks metier useProducts, useChat
│       ├── stores/              <- state management Zustand
│       └── lib/                 <- API client, auth OIDC
├── frontend-admin/              <- React SPA backoffice
│   └── src/
│       ├── components/          <- composants UI layout, shared
│       ├── pages/               <- pages admin dashboard, stats, CRUD
│       └── lib/                 <- API client, auth OIDC
└── docs/
    ├── adr/                     <- Architecture Decision Records
    └── diagrams/                <- diagrammes supplementaires
```
