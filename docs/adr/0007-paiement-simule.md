# ADR-0007 — Paiement simule (90% de succes)

## Statut

Accepte

## Contexte

MacMarket est un projet de demonstration. L'integration d'un vrai processeur de paiement (Stripe, PayPal) ajouterait de la complexite sans valeur pedagogique pour l'architecture.

## Decision

Le module `payment` simule le paiement avec un **taux de succes de 90%** (aleatoire). Le flux reste complet :

1. `OrderPlacedEvent` declenche `ProcessPaymentService`
2. Le service cree un `Payment` en statut `PENDING`
3. Simulation : 90% → `complete(transactionRef)`, 10% → `fail(reason)`
4. Publication de `PaymentCompletedEvent` ou `PaymentFailedEvent`
5. Le module `order` reagit pour passer en `PAID` ou `CANCELLED`

### Modele de donnees

Le paiement est persiste avec reference de transaction, montant, statut et raison d'echec eventuelle.

## Consequences

### Positives
- Le flux evenementiel complet est demonstre (order → payment → order → catalog → notification)
- Pas de dependance a un service tiers
- Le 10% d'echec permet de tester les chemins d'erreur
- Remplacement par un vrai provider = implementation de l'interface existante

### Negatives
- Pas representatif d'un vrai flux de paiement (pas de redirect, pas de webhook)
- Pas de gestion des remboursements
