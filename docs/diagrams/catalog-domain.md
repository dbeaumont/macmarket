# Domaine Catalog

## Vue synthétique DDD + Modulith

Le bounded context Catalog gère le cycle de vie des produits. Il publie des événements métier à chaque modification de produit, et **consomme en retour les événements de commande** pour gérer la réservation et la libération du stock côté domaine.

```mermaid
flowchart TB
    subgraph EXT["Modules externes"]
        OE(["order:\nOrderPlacedEvent\nOrderStatusChangedEvent"])
    end

    subgraph CM["Module catalog — @ApplicationModule(OPEN)\nallowedDependencies: order"]
        subgraph Presentation["Presentation / API"]
            Controller["CatalogController"]
            PDTO["CreateProductRequest · UpdateProductRequest\nProductResponse · ProductResponseMapper"]
        end

        subgraph Application["Application"]
            WriteCmd["CreateProductService\nUpdateProductService"]
            Commands["CreateProductCommand\nUpdateProductCommand"]
            QuerySvc["CatalogQueryService\n[lecture — exposé à cart et assistant]"]
            PubPort["DomainEventPublisher\n[port sortant d'événements]"]
        end

        subgraph Domain["Domain"]
            Aggregate["Product\n[Aggregate Root]\nreserveStock · confirmStockReservation · releaseStock"]
            VOs["ProductId · Money · ProductCategory · ProductSpec\n[Value Objects]"]
            Events["ProductCreatedEvent · ProductUpdatedEvent\nProductDeletedEvent · StockInsufficientEvent\n[Domain Events]"]
            Port["ProductRepository\n[port sortant]"]
        end

        subgraph Infrastructure["Infrastructure"]
            RepoImpl["ProductJpaRepository"]
            JpaE["ProductJpaEntity · ProductSpecJpaEntity"]
            Mapper["ProductPersistenceMapper"]
            PubImpl["SpringDomainEventPublisher"]
            StockL["OrderStockEventListener\n[@ApplicationModuleListener]"]
        end
    end

    Controller --> WriteCmd
    Controller --> QuerySvc
    WriteCmd --> Commands
    WriteCmd --> Aggregate
    WriteCmd --> Port
    WriteCmd --> PubPort

    Aggregate --> VOs
    Aggregate --> Events

    Port -.->|"implements"| RepoImpl
    RepoImpl --> JpaE
    RepoImpl --> Mapper

    PubPort -.->|"implements"| PubImpl

    OE -->|"@ApplicationModuleListener"| StockL
    StockL --> Port
```

## Concepts DDD dans ce module

| Concept | Présent | Note |
|---|---|---|
| Aggregate Root | `Product` | Protège les invariants de stock via `reserveStock` / `confirmStockReservation` / `releaseStock` |
| Value Objects | `ProductId`, `Money`, `ProductCategory`, `ProductSpec` | Immuables, auto-validants |
| Domain Events | `ProductCreated/Updated/Deleted`, `StockInsufficient` | Publiés via `DomainEventPublisher` après persistence |
| Repository (port) | `ProductRepository` | Interface dans le domaine, implémentée en infrastructure |
| Domain Events consommés | `OrderPlacedEvent`, `OrderStatusChangedEvent` | Via `OrderStockEventListener` pour gérer le stock |

## Contraintes Modulith

- **Type** : `OPEN`
- **allowedDependencies** : `order` — autorise l'écoute des événements de commande
- `CatalogQueryService` est accessible directement par les modules `cart` et `assistant` (via `allowedDependencies`)
- `SpringDomainEventPublisher` publie via `ApplicationEventPublisher` Spring, capturé par Spring Modulith

## Règle de dépendance

```
Presentation → Application → Domain ← Infrastructure
```

Le domaine ne connaît ni Spring, ni JPA. L'infrastructure implémente les ports définis dans le domaine (`ProductRepository`, `DomainEventPublisher`).

Pour une vue détaillée classe par classe (attributs, méthodes, légende de couleurs par rôle DDD), voir [catalog-domain-classes.md](./catalog-domain-classes.md).
