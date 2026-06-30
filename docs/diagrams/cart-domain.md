# Domaine Cart

## Vue synthétique DDD + Modulith

Ce schéma montre comment le bounded context Cart organise le panier autour d’un agrégat racine, tout en gardant la logique métier indépendante des détails techniques.

```mermaid
flowchart TB
    subgraph Presentation["Presentation / API"]
        Controller["CartController"]
        Request["AddItemRequest"]
        Response["CartResponse"]
    end

    subgraph Application["Application"]
        Service["CartApplicationService"]
        Command["UpdateCartCommand"]
    end

    subgraph Domain["Domain"]
        Aggregate["Cart\n(Aggregate Root)"]
        Item["CartItem"]
        VO1["CartId"]
        Port["CartRepository\n(port sortant)"]
    end

    subgraph Infrastructure["Infrastructure"]
        RepoImpl["CartJpaRepository"]
        Entity["CartJpaEntity"]
        Mapper["CartMapper"]
    end

    subgraph Internal["Internal / Modulith"]
        Module["CartModule"]
        Contracts["Contracts / interfaces publiques"]
    end

    Controller --> Service
    Service --> Command
    Service --> Aggregate
    Service --> Port
    Aggregate --> Item
    Aggregate --> VO1
    Port -.implements.-> RepoImpl
    RepoImpl --> Entity
    RepoImpl --> Mapper
    Module --> Contracts
    Module --> Service
```

## Lecture du schéma

- La couche Presentation expose les opérations de consultation et modification du panier.
- La couche Application orchestre les cas d’usage liés à l’ajout, la mise à jour et la suppression d’articles.
- La couche Domain contient l’agrégat Cart, ses éléments internes et les règles de cohérence du panier.
- La couche Infrastructure implémente la persistance et l’adaptation technique.
- Le cadre Internal / Modulith définit la frontière du module Cart vis-à-vis des autres modules.

## Règle de dépendance essentielle

Le flux de dépendance reste orienté vers le cœur du domaine :

Presentation → Application → Domain ← Infrastructure

Cela garantit que les opérations sur le panier restent cohérentes sans dépendre directement des détails de stockage.
