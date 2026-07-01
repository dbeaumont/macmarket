# Domaine Notification

## Vue synthétique DDD + Modulith

Ce module est un **consommateur pur d'événements**. Il n'a ni couche Presentation, ni Application, ni Domain propre — son rôle est de traduire directement les événements métier d'autres modules en emails envoyés à l'utilisateur via Thymeleaf.

```mermaid
flowchart TB
    subgraph EXT["Modules sources"]
        OE1(["OrderPlacedEvent"])
        OE2(["OrderStatusChangedEvent"])
        PE1(["PaymentCompletedEvent"])
        PE2(["PaymentFailedEvent"])
    end

    subgraph NM["Module notification — @ApplicationModule(OPEN)\nallowedDependencies: order · payment"]
        subgraph Infrastructure["Infrastructure"]
            Listener["NotificationEventListener\n[@ApplicationModuleListener × 4]"]
            Email["EmailService\n[JavaMailSender + Thymeleaf]"]
        end
    end

    SMTP["Templates email\nThymeleaf + JavaMailSender"]

    OE1 -- "depuis order" --> Listener
    OE2 -- "depuis order" --> Listener
    PE1 -- "depuis payment" --> Listener
    PE2 -- "depuis payment" --> Listener

    Listener --> Email
    Email --> SMTP
```

## Concepts DDD dans ce module

| Concept | Présent | Note |
|---|---|---|
| Aggregate Root | Non | Aucun état métier propre — module stateless |
| Value Objects | Non | Les données viennent directement des événements reçus |
| Domain Events | Consomme uniquement | 4 événements reçus de `order` et `payment` |
| Repository (port) | Non | Pas de persistance propre |
| Application Service | Non | Pas d'orchestration — listener → mailer direct |

## Contraintes Modulith

- **Type** : `OPEN` — les classes du module sont visibles par les autres modules
- **allowedDependencies** : `order`, `payment` — seuls ces modules peuvent être importés dans le code du module notification
- **@ApplicationModuleListener** : les 4 méthodes s'exécutent de façon transactionnelle et indépendante par rapport à l'émetteur (déclenchement après commit de la transaction source)

## Flux d'événements

```
order  ──OrderPlacedEvent──────────▶ notification ──▶ email
order  ──OrderStatusChangedEvent──▶ notification ──▶ email
payment ──PaymentCompletedEvent───▶ notification ──▶ email
payment ──PaymentFailedEvent──────▶ notification ──▶ email
```

Ce module ne publie aucun événement. Il est un consommateur terminal des flux métier.
