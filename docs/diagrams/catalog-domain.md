# Domaine Catalog

## Vue synthétique DDD + Modulith

Cette vue montre comment le bounded context Catalog s’organise autour d’un agrégat Product, avec une séparation nette entre API, cas d’usage, logique métier, persistence et frontière de module.

```mermaid
flowchart TB
    subgraph Presentation["Presentation / API"]
        Controller["ProductController"]
        Request["CreateProductRequest"]
        Response["ProductResponse"]
    end

    subgraph Application["Application"]
        Service["CreateProductService\nou UpdateProductService"]
        Command["CreateProductCommand"]
    end

    subgraph Domain["Domain"]
        Aggregate["Product\n(Aggregate Root)"]
        VO1["ProductId"]
        VO2["Money"]
        VO3["ProductCategory"]
        Port["ProductRepository\n(port sortant)"]
        Event["ProductCreatedEvent"]
    end

    subgraph Infrastructure["Infrastructure"]
        RepoImpl["ProductJpaRepository"]
        Entity["ProductJpaEntity"]
        Mapper["ProductMapper"]
    end

    subgraph Internal["Internal / Modulith"]
        Module["CatalogModule"]
        Contracts["Contracts / interfaces publiques"]
    end

    Controller --> Request
    Controller --> Service
    Service --> Command
    Service --> Aggregate
    Service --> Port
    Aggregate --> VO1
    Aggregate --> VO2
    Aggregate --> VO3
    Aggregate --> Event
    Port -.implements.-> RepoImpl
    RepoImpl --> Entity
    RepoImpl --> Mapper
    Module --> Contracts
    Module --> Service
```

## Lecture du schéma

- La couche Presentation expose les opérations de gestion du catalogue.
- La couche Application orchestre la création et la mise à jour des produits sans contenir la logique métier complète.
- La couche Domain contient l’agrégat Product, ses objets de valeur et ses événements métier.
- La couche Infrastructure implémente le repository et la persistance technique.
- Le cadre Internal / Modulith représente la frontière du module Catalog et son interface avec les autres modules.

## Règle de dépendance essentielle

La dépendance reste dirigée selon l’architecture suivante :

Presentation → Application → Domain ← Infrastructure

Cette structure permet de préserver les invariants de stock, de disponibilité et de publication du produit au cœur du domaine.
