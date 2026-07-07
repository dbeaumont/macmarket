# 03 — Fonctionnel

## Cas d'usage — Boutique client

| Cas d'usage | Acteur | Endpoint | Auth requise |
|-------------|--------|----------|:---:|
| Consulter le catalogue | Visiteur / Client | `GET /api/v1/products` | Non |
| Filtrer par catégorie, prix, recherche | Visiteur / Client | `GET /api/v1/products?category=&search=&minPrice=&maxPrice=` | Non |
| Voir le détail d'un produit | Visiteur / Client | `GET /api/v1/products/{slug}` | Non |
| Lister les catégories | Visiteur / Client | `GET /api/v1/categories` | Non |
| Ajouter un article au panier | Visiteur / Client | `POST /api/v1/cart/items` | Non (guest token) |
| Modifier la quantité | Visiteur / Client | `PUT /api/v1/cart/items/{productId}` | Non (guest token) |
| Supprimer un article | Visiteur / Client | `DELETE /api/v1/cart/items/{productId}` | Non (guest token) |
| Vider le panier | Visiteur / Client | `DELETE /api/v1/cart` | Non (guest token) |
| Fusionner le panier invité | Client | `POST /api/v1/cart/merge` | Oui |
| Passer une commande | Client | `POST /api/v1/orders` | Oui |
| Consulter ses commandes | Client | `GET /api/v1/orders` | Oui |
| Télécharger une facture PDF | Client | `GET /api/v1/orders/{id}/invoice` | Oui |
| Discuter avec l'assistant IA | Client | `POST /api/v1/assistant/chat` (SSE) | Oui |
| Supprimer une conversation | Client | `DELETE /api/v1/assistant/conversations/{id}` | Oui |
| Gérer son profil de livraison | Client | `GET/POST/PUT/DELETE /api/v1/users/me/shipping-profiles` | Oui |

## Cas d'usage — Backoffice admin

| Cas d'usage | Rôle | Endpoint |
|-------------|------|----------|
| Voir le dashboard | Manager / Admin | `GET /api/v1/admin/dashboard` |
| Lister les commandes | Manager / Admin | `GET /api/v1/admin/orders` |
| Voir le détail d'une commande | Manager / Admin | `GET /api/v1/admin/orders/{id}` |
| Mettre à jour le statut d'une commande | Manager / Admin | `PUT /api/v1/admin/orders/{id}/status` |
| Lister les clients | Manager / Admin | `GET /api/v1/admin/customers` |
| Voir le détail d'un client | Manager / Admin | `GET /api/v1/admin/customers/{id}` |
| Créer un produit | Manager / Admin | `POST /api/v1/admin/products` |
| Modifier un produit | Manager / Admin | `PUT /api/v1/admin/products/{id}` |
| Supprimer un produit | Manager / Admin | `DELETE /api/v1/admin/products/{id}` |
| Statistiques revenue | Admin | `GET /api/v1/admin/stats/revenue?period=30d` |
| Statistiques produits | Admin | `GET /api/v1/admin/stats/products?period=30d` |
| Statistiques clients | Admin | `GET /api/v1/admin/stats/customers?period=30d` |
| Statistiques commandes | Admin | `GET /api/v1/admin/stats/orders?period=30d` |

## Entités métier principales

### Catalogue — `Product`

```mermaid
classDiagram
    class Product {
        -ProductId id
        -String name
        -String slug
        -String description
        -String shortDesc
        -Money price
        -ProductCategory category
        -String imageUrl
        -int stockQuantity
        -int reservedQuantity
        -boolean active
        -List~ProductSpec~ specs
        -Instant createdAt
        +create(name, slug, ...) Product$
        +reconstitute(...) Product$
        +updateDetails(...)
        +reserveStock(qty)
        +releaseStock(qty)
        +deductStock(qty)
    }
    class ProductCategory {
        <<enumeration>>
        MACBOOK_AIR
        MACBOOK_PRO
        IMAC
        MAC_MINI
        MAC_STUDIO
        MAC_PRO
    }
    class ProductId {
        +UUID value
    }
    class Money {
        +BigDecimal amount
        +String currency
    }
    class ProductSpec {
        +String key
        +String value
        +int sortOrder
    }
    Product *-- ProductId
    Product *-- Money
    Product *-- ProductCategory
    Product "1" *-- "0..*" ProductSpec
```

### Commande — `Order`

```mermaid
classDiagram
    class Order {
        -OrderId id
        -UserId userId
        -OrderStatus status
        -List~OrderItem~ items
        -BigDecimal total
        -ShippingInfo shippingInfo
        -Instant createdAt
        +place(userId, items, total, shipping) Order$
        +reconstitute(...) Order$
        +markAsPaid()
        +cancel()
        +markAsProcessing()
        +markAsShipped()
        +markAsDelivered()
    }
    class OrderStatus {
        <<enumeration>>
        PENDING_PAYMENT
        PAID
        PROCESSING
        SHIPPED
        DELIVERED
        CANCELLED
    }
    class OrderItem {
        +UUID productId
        +String productName
        +BigDecimal unitPrice
        +int quantity
        +BigDecimal subtotal
    }
    class ShippingInfo {
        +String name
        +String address
        +String email
    }
    Order *-- OrderStatus
    Order "1" *-- "1..*" OrderItem
    Order *-- ShippingInfo
```

### Paiement — `Payment`

```mermaid
stateDiagram-v2
    [*] --> PENDING : initiate(orderId, amount)
    PENDING --> COMPLETED : complete(transactionRef)\n→ PaymentCompletedEvent
    PENDING --> FAILED : fail(reason)\n→ PaymentFailedEvent
    COMPLETED --> [*]
    FAILED --> [*]
```

## Cycle de vie d'une commande

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : place()\n→ OrderPlacedEvent
    PENDING_PAYMENT --> PAID : markAsPaid()\n← PaymentCompletedEvent
    PENDING_PAYMENT --> CANCELLED : cancel()
    PAID --> PROCESSING : markAsProcessing()
    PAID --> CANCELLED : cancel()
    PROCESSING --> SHIPPED : markAsShipped()\n→ OrderStatusChangedEvent
    SHIPPED --> DELIVERED : markAsDelivered()\n→ OrderStatusChangedEvent
    PROCESSING --> CANCELLED : cancel()
    DELIVERED --> [*]
    CANCELLED --> [*]
```

## Workflow du panier (visiteur → client)

```mermaid
sequenceDiagram
    actor V as Visiteur
    actor C as Client connecté
    participant FC as Boutique React
    participant API as CartController
    participant KC as Keycloak

    V->>FC: Ajout produit au panier
    Note over FC: X-Guest-Cart-Token généré (localStorage)
    FC->>API: POST /cart/items (X-Guest-Cart-Token)
    API-->>FC: CartResponse

    V->>KC: Login OIDC
    KC-->>FC: JWT token
    FC->>API: POST /cart/merge {guestToken}
    API-->>FC: CartResponse fusionné
    Note over FC: Panier invité fusionné dans le panier du compte
```

## Flux de l'assistant IA

```mermaid
sequenceDiagram
    actor C as Client
    participant FC as Boutique React
    participant AC as AssistantController
    participant CS as ChatService
    participant CB as CatalogContextProvider
    participant OLL as Ollama (qwen2.5:3b)

    C->>FC: Saisie message
    FC->>AC: POST /api/v1/assistant/chat (SSE)
    AC->>CS: chat(conversationId, message)
    CS->>CB: getContext() - produits disponibles
    CB-->>CS: Contexte catalogue
    CS->>OLL: Prompt enrichi + historique (Caffeine cache)
    OLL-->>CS: Stream tokens
    CS-->>AC: Flux d'événements SSE
    AC-->>FC: text/event-stream tokens
    FC->>C: Affichage progressif
```

## Catégories de produits disponibles

| Enum | Libellé affiché |
|------|----------------|
| `MACBOOK_AIR` | MacBook Air |
| `MACBOOK_PRO` | MacBook Pro |
| `IMAC` | iMac |
| `MAC_MINI` | Mac Mini |
| `MAC_STUDIO` | Mac Studio |
| `MAC_PRO` | Mac Pro |
