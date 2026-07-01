# Domaine Cart

## Vue synthétique DDD + Modulith

Le bounded context Cart gère le panier de l'utilisateur. Il ne publie pas d'événements métier propres, mais **consomme les événements de mise à jour produit** pour maintenir les snapshots de prix et de nom cohérents dans les items du panier. Il expose `CartApplicationService` directement au module `order` via l'appel synchrone lors de la création d'une commande.

```mermaid
flowchart TB
    subgraph EXT["Modules externes"]
        CE(["catalog:\nProductUpdatedEvent"])
        ORD["order:\nPlaceOrderService\n[appel direct sur CartApplicationService]"]
    end

    subgraph CaM["Module cart — @ApplicationModule(OPEN)\nallowedDependencies: catalog"]
        subgraph Presentation["Presentation / API"]
            Controller["CartController"]
            DTOs["AddToCartRequest · UpdateQuantityRequest\nCartResponse · CartItemResponse · CartResponseMapper"]
        end

        subgraph Application["Application"]
            AppSvc["CartApplicationService\n[exposé au module order via allowedDependencies]"]
        end

        subgraph Domain["Domain"]
            Aggregate["Cart\n[Aggregate Root]\naddItem · removeItem · updateQuantity · clear"]
            Item["CartItem\n[Entity interne]\nincreaseQuantity · updateSnapshot"]
            VO["CartId\n[Value Object]"]
            Port["CartRepository\n[port sortant]"]
        end

        subgraph Infrastructure["Infrastructure"]
            RepoImpl["CartJpaRepository"]
            JpaE["CartJpaEntity · CartItemJpaEntity"]
            Mapper["CartPersistenceMapper"]
            Refresher["CartItemRefresher\n[refresh prix + nom dans les paniers ouverts]"]
            CatL["CartCatalogEventListener\n[@ApplicationModuleListener]"]
            Cleanup["CartCleanupJob\n[@Scheduled — suppression paniers expirés]"]
        end
    end

    Controller --> AppSvc
    AppSvc --> Aggregate
    AppSvc --> Port

    Aggregate --> Item
    Aggregate --> VO

    Port -.->|"implements"| RepoImpl
    RepoImpl --> JpaE
    RepoImpl --> Mapper

    CE -->|"@ApplicationModuleListener"| CatL
    CatL --> Refresher
    Refresher --> RepoImpl

    ORD -->|"getCart(userId)"| AppSvc
```

## Concepts DDD dans ce module

| Concept | Présent | Note |
|---|---|---|
| Aggregate Root | `Cart` | Garantit la cohérence des items (unicité par productId) |
| Entity interne | `CartItem` | Non exposée directement à l'extérieur |
| Value Object | `CartId` | Identifiant typé fort |
| Domain Events | Non publiés | Le panier ne génère pas d'événements — la commande est créée par `order` |
| Repository (port) | `CartRepository` | Interface dans le domaine |
| Domain Events consommés | `ProductUpdatedEvent` | Via `CartCatalogEventListener` pour rafraîchir les snapshots |

## Contraintes Modulith

- **Type** : `OPEN`
- **allowedDependencies** : `catalog` — autorise l'écoute de `ProductUpdatedEvent` et l'accès à `CatalogQueryService`
- `CartApplicationService` est consommé directement par `order` (appel synchrone dans `PlaceOrderService`)
- `CartCleanupJob` gère le cycle de vie des paniers abandonnés sans événement métier

## Règle de dépendance

```
Presentation → Application → Domain ← Infrastructure
```

Le domaine `Cart` ne publie pas d'événements et ne connaît pas le module `order`. C'est `order` qui vient lire l'état du panier, non l'inverse.
