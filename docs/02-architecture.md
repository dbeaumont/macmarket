# 02 — Architecture

## Règle de dépendance

Le projet applique l'**architecture hexagonale (ports & adapters)** dans chaque module :

```
Presentation → Application → Domain ← Infrastructure
```

Le domaine est du Java pur, sans dépendance vers Spring, JPA ou tout autre framework.

## Couches applicatives

```mermaid
graph LR
    subgraph Presentation["Couche Présentation"]
        REST["@RestController<br/>DTOs Request/Response"]
    end

    subgraph Application["Couche Application"]
        SVC["Application Services<br/>Commands / Queries<br/>@Transactional"]
    end

    subgraph Domain["Couche Domaine (Java pur)"]
        AGG["Agrégats + Entités<br/>Value Objects<br/>Domain Events<br/>Repository interfaces"]
    end

    subgraph Infrastructure["Couche Infrastructure"]
        JPA["JPA Entities + Mappers<br/>Spring Data Repositories"]
        MAIL["EmailService"]
        AI["OllamaClient"]
    end

    REST --> Application
    Application --> Domain
    Infrastructure --> Domain
```

## Modules Spring Modulith

Le backend est organisé en **8 bounded contexts** autonomes. Chaque module dispose de sa propre structure en couches.

| Module | Responsabilité |
|--------|---------------|
| `catalog` | Catalogue produits Mac, gestion du stock, CRUD admin |
| `cart` | Panier utilisateur et invité, snapshots produits |
| `order` | Commandes, checkout, génération de factures PDF |
| `payment` | Paiement simulé (90% succès), gestion des statuts |
| `admin` | Backoffice : commandes, clients, dashboard, statistiques |
| `notification` | Envoi d'emails transactionnels via Thymeleaf + JavaMail |
| `assistant` | Chat IA avec historique (Ollama / qwen2.5:3b, SSE streaming) |
| `user` | Profils d'adresses de livraison |

## Dépendances directes inter-modules

```mermaid
graph LR
    cart["cart"] -->|"CatalogQueryService"| catalog["catalog"]
    order["order"] -->|"CartApplicationService"| cart
    assistant["assistant"] -->|"CatalogQueryService"| catalog
    admin["admin"] -->|"UpdateOrderStatusService"| order
```

## Communication par événements (Spring Modulith Events)

```mermaid
graph LR
    order(["order"]) -. "OrderPlacedEvent" .-> payment(["payment"])
    order -. "OrderPlacedEvent" .-> catalog
    order -. "OrderPlacedEvent" .-> notification(["notification"])
    order -. "OrderPlacedEvent" .-> admin(["admin"])
    order -. "OrderStatusChangedEvent" .-> catalog(["catalog"])
    order -. "OrderStatusChangedEvent" .-> notification
    payment -. "PaymentCompletedEvent" .-> order
    payment -. "PaymentFailedEvent" .-> order
    payment -. "PaymentCompletedEvent" .-> notification
    payment -. "PaymentFailedEvent" .-> notification
    catalog -. "ProductUpdatedEvent" .-> cart(["cart"])
    catalog -. "ProductCreatedEvent<br/>ProductUpdatedEvent" .-> assistant(["assistant"])
```

## Flux de traitement principal — Passage de commande

```mermaid
sequenceDiagram
    actor C as Client
    participant FC as Boutique React
    participant KC as Keycloak
    participant CART as CartController
    participant ORDER as OrderController
    participant PAY as PaymentService
    participant NOTIF as NotificationService
    participant PG as PostgreSQL

    C->>FC: Clic "Commander"
    FC->>KC: Refresh token OIDC
    KC-->>FC: JWT valide
    FC->>ORDER: POST /api/v1/orders (JWT)
    ORDER->>CART: CartApplicationService.getCart()
    CART-->>ORDER: CartSnapshot
    ORDER->>PG: save(Order) — status=PENDING_PAYMENT
    ORDER-->>FC: 201 OrderResponse
    Note over ORDER,PAY: OrderPlacedEvent (synchrone Spring Modulith)
    ORDER--)PAY: OrderPlacedEvent
    PAY->>PG: save(Payment) — 90% COMPLETED
    PAY--)ORDER: PaymentCompletedEvent
    ORDER->>PG: update Order — status=PAID
    PAY--)NOTIF: PaymentCompletedEvent
    NOTIF->>C: Email de confirmation (Mailpit/SMTP)
```

## Configuration des profils Spring

| Profil | Fichier | Usage |
|--------|---------|-------|
| *(défaut)* | `application.yml` | Développement local (localhost) |
| `dev` | `application-dev.yml` | Override développement |
| `docker` | `application-docker.yml` | Résolution DNS Docker interne (postgres, keycloak, ollama, mailpit) |

## Gestion de la publication d'événements

Spring Modulith utilise une table `event_publication` (V3__create_event_publication_table.sql) pour garantir la livraison at-least-once des événements de domaine. La configuration `jdbc-schema-initialization: enabled: false` indique que la table est créée manuellement via Flyway.
