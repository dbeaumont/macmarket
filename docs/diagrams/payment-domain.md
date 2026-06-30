# Domaine Payment

## Vue synthétique DDD + Modulith

Ce diagramme présente le bounded context Payment comme un module centré sur un agrégat de paiement, avec une frontière claire entre logique métier, orchestration applicative et intégration technique.

```mermaid
flowchart TB
    subgraph Presentation["Presentation / API"]
        Controller["PaymentController"]
        Request["InitiatePaymentRequest"]
        Response["PaymentResponse"]
    end

    subgraph Application["Application"]
        Service["PaymentApplicationService"]
        Command["ProcessPaymentCommand"]
    end

    subgraph Domain["Domain"]
        Aggregate["Payment\n(Aggregate Root)"]
        VO1["PaymentId"]
        VO2["OrderReference"]
        Status["PaymentStatus"]
        Port["PaymentRepository\n(port sortant)"]
        Event["PaymentCompletedEvent"]
    end

    subgraph Infrastructure["Infrastructure"]
        RepoImpl["PaymentJpaRepository"]
        Adapter["PaymentGatewayAdapter"]
        Mapper["PaymentMapper"]
    end

    subgraph Internal["Internal / Modulith"]
        Module["PaymentModule"]
        Contracts["Contracts / interfaces publiques"]
    end

    Controller --> Service
    Service --> Command
    Service --> Aggregate
    Service --> Port
    Aggregate --> VO1
    Aggregate --> VO2
    Aggregate --> Status
    Aggregate --> Event
    Port -.implements.-> RepoImpl
    RepoImpl --> Mapper
    RepoImpl --> Adapter
    Module --> Contracts
    Module --> Service
```

## Lecture du schéma

- La couche Presentation expose les opérations d’initiation et de suivi d’un paiement.
- La couche Application orchestre l’exécution du paiement sans contenir la logique de validation métier.
- La couche Domain contient l’agrégat Payment, son état et ses événements métier.
- La couche Infrastructure implémente le repository et l’intégration avec le prestataire de paiement.
- Le cadre Internal / Modulith isole le module Payment et expose seulement les interfaces utiles aux autres modules.

## Règle de dépendance essentielle

Le module respecte la direction suivante :

Presentation → Application → Domain ← Infrastructure

Cette séparation permet au domaine de rester cohérent, même si le traitement externe du paiement dépend de services tiers.
