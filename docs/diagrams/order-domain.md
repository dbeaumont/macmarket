# Domaine Order

## Vue synthétique DDD + Modulith

Cette vue décrit l’organisation du bounded context Order selon une logique DDD, avec une lecture simple de l’architecture modulith : chaque couche a une responsabilité claire, et les dépendances restent dirigées.

```mermaid
flowchart TB
    subgraph Presentation["Presentation / API"]
        Controller["OrderController"]
        Request["CreateOrderRequest"]
        Response["OrderResponse"]
    end

    subgraph Application["Application"]
        Service["PlaceOrderService\nou ConfirmOrderService"]
        Command["CreateOrderCommand"]
        Result["OrderPlacedResult"]
    end

    subgraph Domain["Domain"]
        Aggregate["Order\n(Aggregate Root)"]
        Item["OrderItem"]
        VO1["OrderId"]
        VO2["Money"]
        VO3["ShippingInfo"]
        Status["OrderStatus"]
        Port["OrderRepository\n(port sortant)"]
        Event["OrderPlacedEvent"]
        Pricing["PricingService"]
    end

    subgraph Infrastructure["Infrastructure"]
        RepoImpl["OrderJpaRepository"]
        JpaEntity["OrderJpaEntity"]
        Mapper["OrderMapper"]
        Publisher["DomainEventPublisher"]
    end

    subgraph Internal["Internal / Modulith"]
        Module["OrderModule"]
        Contracts["Contracts / interfaces publiques"]
        Events["Events de module"]
    end

    Controller --> Request
    Controller --> Service
    Service --> Command
    Service --> Result
    Service --> Aggregate
    Service --> Port
    Service --> Pricing

    Aggregate --> Item
    Aggregate --> VO1
    Aggregate --> VO2
    Aggregate --> VO3
    Aggregate --> Status
    Aggregate --> Event

    Port -.implements.-> RepoImpl
    RepoImpl --> JpaEntity
    RepoImpl --> Mapper
    RepoImpl --> Publisher

    Module --> Contracts
    Module --> Events
    Module --> Service
    Events --> Controller
```

## Lecture du schéma

- La couche Presentation expose les cas d’usage au monde extérieur.
- La couche Application orchestre le métier sans contenir la logique métier elle-même.
- La couche Domain contient l’agrégat Order, ses objets de valeur, ses règles de transition et ses événements métier.
- La couche Infrastructure implémente les ports du domaine et gère la persistence, les mappers et la publication d’événements.
- Le cadre Internal / Modulith représente la frontière du module Order : il expose uniquement ce qui est utile aux autres modules et garde la logique interne encapsulée.

## Règle de dépendance essentielle

Le sens des dépendances est volontairement unidirectionnel :

Presentation → Application → Domain ← Infrastructure

Cette organisation permet de garder le domaine indépendant des détails techniques, tout en laissant la modularité du système explicite et maîtrisée.
