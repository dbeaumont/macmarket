# Domaine Order

## Vue synthétique DDD + Modulith

Le bounded context Order est le cœur transactionnel du système. Il orchestre la création d'une commande depuis le panier, publie des événements métier qui déclenchent le paiement et les notifications, et réagit aux événements de paiement pour mettre à jour son propre état. Il dépend directement de `cart` (lecture synchrone) et consomme des événements de `payment`.

```mermaid
flowchart TB
    subgraph EXT["Modules externes"]
        CartSvc["cart:\nCartApplicationService\n[appel direct — lecture du panier]"]
        PE(["payment:\nPaymentCompletedEvent\nPaymentFailedEvent"])
    end

    subgraph OM["Module order — @ApplicationModule(OPEN)\nallowedDependencies: cart · catalog · payment · notification"]
        subgraph Presentation["Presentation / API"]
            Controller["OrderController"]
            DTOs["PlaceOrderRequest\nOrderResponse · OrderItemResponse · OrderResponseMapper"]
        end

        subgraph Application["Application"]
            PlaceOrder["PlaceOrderService\n[@Transactional]"]
            QuerySvc["OrderQueryService"]
            UpdateStatus["UpdateOrderStatusService\n[déclenché par PaymentEventListener]"]
            InvPort["InvoiceGenerator\n[port sortant PDF]"]
            Command["PlaceOrderCommand"]
        end

        subgraph Domain["Domain"]
            Aggregate["Order\n[Aggregate Root]\nplace · markAsPaid · cancel · reconstitute"]
            Item["OrderItem\n[Entity interne]"]
            VOs["OrderId · ShippingInfo · ProductReference\n[Value Objects]"]
            Status["OrderStatus\n[Enum : PENDING_PAYMENT · PAID · CANCELLED · DELIVERED]"]
            DomEvents["OrderPlacedEvent · OrderStatusChangedEvent\n[Domain Events]"]
            Port["OrderRepository\n[port sortant]"]
        end

        subgraph Infrastructure["Infrastructure"]
            RepoImpl["OrderJpaRepository"]
            JpaE["OrderJpaEntity · OrderItemJpaEntity"]
            Mapper["OrderPersistenceMapper"]
            PdfImpl["PdfInvoiceGenerator\n[implémente InvoiceGenerator]"]
            PayL["PaymentEventListener\n[@ApplicationModuleListener]"]
        end
    end

    Controller --> PlaceOrder
    Controller --> QuerySvc
    PlaceOrder --> Command
    PlaceOrder --> Aggregate
    PlaceOrder --> Port
    PlaceOrder --> InvPort

    UpdateStatus --> Aggregate
    UpdateStatus --> Port

    Aggregate --> Item
    Aggregate --> VOs
    Aggregate --> Status
    Aggregate --> DomEvents

    Port -.->|"implements"| RepoImpl
    RepoImpl --> JpaE
    RepoImpl --> Mapper

    InvPort -.->|"implements"| PdfImpl

    CartSvc -->|"getCart(userId)"| PlaceOrder
    PE -->|"@ApplicationModuleListener"| PayL
    PayL --> UpdateStatus
```

## Concepts DDD dans ce module

| Concept | Présent | Note |
|---|---|---|
| Aggregate Root | `Order` | Transitions d'état contrôlées : `place` → `markAsPaid` ou `cancel` |
| Entity interne | `OrderItem` | Contient `ProductReference` (snapshot immutable au moment de la commande) |
| Value Objects | `OrderId`, `ShippingInfo`, `ProductReference` | Immuables, identité par valeur |
| Domain Events | `OrderPlacedEvent`, `OrderStatusChangedEvent` | Émis après chaque transition d'état, publiés après commit |
| Repository (port) | `OrderRepository` | Interface dans le domaine |
| Port sortant | `InvoiceGenerator` | Découple la génération PDF du domaine |
| Domain Events consommés | `PaymentCompletedEvent`, `PaymentFailedEvent` | Via `PaymentEventListener` → `UpdateOrderStatusService` |

## Contraintes Modulith

- **Type** : `OPEN`
- **allowedDependencies** : `cart`, `catalog`, `payment`, `notification`
- `PlaceOrderService` appelle `CartApplicationService` de façon synchrone (autorisé car `cart` est dans `allowedDependencies`)
- `OrderPlacedEvent` et `OrderStatusChangedEvent` sont les événements les plus consommés dans le système (payment, catalog, notification, admin les écoutent tous)
- `notification` est dans les dependencies car les events domain sont dans les packages accessibles (les events sont des records dans `domain/event/`)

## Règle de dépendance

```
Presentation → Application → Domain ← Infrastructure
```

`PlaceOrderService` lit le panier via `CartApplicationService`, crée l'agrégat `Order`, persiste, puis publie les domain events. L'état de la commande évolue ensuite en réponse aux événements de paiement.
