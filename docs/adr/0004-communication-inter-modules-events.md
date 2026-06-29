# ADR-0004 — Communication inter-modules par Domain Events

## Statut

Accepte

## Contexte

Les modules Spring Modulith doivent communiquer entre eux pour les flux metier transversaux (ex : une commande passee declenche un paiement, une reservation de stock, un email de confirmation et une mise a jour des stats admin).

Deux approches possibles :
1. Appels directs entre application services (couplage fort)
2. Publication d'evenements du domaine (couplage faible)

## Decision

Privilegier la **communication par Domain Events** pour les flux asynchrones. Reserver les appels directs aux cas ou une reponse synchrone est necessaire.

### Evenements du domaine

| Event | Emetteur | Recepteurs |
|-------|---------|------------|
| `OrderPlacedEvent` | order | payment, catalog, notification, admin |
| `OrderStatusChangedEvent` | order | catalog, notification |
| `PaymentCompletedEvent` | payment | order, notification |
| `PaymentFailedEvent` | payment | order, notification |
| `ProductCreatedEvent` | catalog | assistant |
| `ProductUpdatedEvent` | catalog | cart, assistant |
| `ProductDeletedEvent` | catalog | assistant |

### Appels directs (synchrones)

| Appelant | Service appele | Justification |
|----------|---------------|---------------|
| order → cart | `CartApplicationService` | Le checkout lit le panier et le vide — besoin transactionnel |
| cart → catalog | `CatalogQueryService` | Recuperer le prix actuel au moment de l'ajout |
| admin → order | `UpdateOrderStatusService` | Changement de statut initie par l'admin |
| assistant → catalog | `CatalogQueryService` | Construire le contexte catalogue pour le prompt IA |

### Mecanisme technique

- Les events sont publies via `ApplicationEventPublisher.publishEvent()` apres la persistence
- Les listeners utilisent `@ApplicationModuleListener` (Spring Modulith) pour la fiabilite
- Spring Modulith persiste les events dans la table `event_publication` (redelivery en cas d'echec)
- L'event est marque comme complete une fois le listener termine avec succes

## Consequences

### Positives
- Les modules emetteurs ne connaissent pas leurs recepteurs (inversion de dependance)
- Ajout d'un nouveau recepteur sans modifier l'emetteur
- Fiabilite : la table `event_publication` garantit le at-least-once delivery
- Les events sont immuables (records) et auto-documentes

### Negatives
- Debugging plus difficile (le flux est reparti entre listeners)
- Pas de garantie d'ordre d'execution entre listeners d'un meme event
- Eventual consistency : le stock est reserve de maniere asynchrone apres la commande
