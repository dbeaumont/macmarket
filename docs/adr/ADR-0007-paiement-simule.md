# ADR-0007 — Paiement simulé

## Statut

Accepté

## Contexte

MacMarket est une marketplace e-commerce de démonstration spécialisée dans la vente de Mac. Le processus de commande comprend un module `payment` qui doit gérer le déclenchement et le résultat du paiement.

Intégrer un vrai prestataire de paiement (Stripe, PayPal, Adyen) nécessite :

- Des clés API réelles (compte test ou production)
- La gestion de webhooks HTTPS publiquement accessibles pour les callbacks de paiement
- Des règles PCI-DSS pour la manipulation des données de carte
- Un environnement réseau avec accès à Internet depuis le container backend

Ces contraintes sont incompatibles avec les objectifs du projet : fonctionnement hors ligne, démo reproductible, simplicité de démarrage (`make up`).

## Décision

Implémenter un **paiement entièrement simulé** dans le module `payment` du backend, avec les caractéristiques suivantes :

- À la réception de l'événement `OrderPlacedEvent`, le service de paiement simule le traitement
- Taux de succès : **90%** (configurable) — 10% des paiements échouent aléatoirement pour simuler des cas d'erreur réalistes
- Le résultat est publié immédiatement via des Domain Events : `PaymentCompletedEvent` (succès) ou `PaymentFailedEvent` (échec)
- Un enregistrement `Payment` est persisté en base avec son statut (`COMPLETED` ou `FAILED`)
- L'API `GET /api/v1/payments/{orderId}` expose le statut du paiement

**Flux de paiement simulé :**
```
OrderPlacedEvent → PaymentService → random(90% succès)
                                  → [succès] save Payment(COMPLETED) → PaymentCompletedEvent
                                  → [échec]  save Payment(FAILED)    → PaymentFailedEvent

PaymentCompletedEvent → OrderService  → Order.status = PAID
                     → Notification   → Email de confirmation client

PaymentFailedEvent   → OrderService  → Order.status = PAYMENT_FAILED
                     → Notification   → Email d'échec client
```

## Conséquences

### Positives

- Démarrage immédiat sans aucune configuration externe — aucune clé API, aucun compte prestataire requis
- Fonctionnement 100% hors ligne, aligné avec les autres composants locaux (Ollama, Keycloak, Mailpit)
- Les 10% d'échecs aléatoires permettent de tester les cas d'erreur du flux de commande sans configuration particulière
- Le module `payment` est architecturalement complet (Domain Events, entité JPA, API REST) — remplacement par une intégration réelle ne nécessiterait que de modifier l'implémentation du service
- PCI-DSS : aucune donnée de carte bancaire manipulée, aucune obligation de conformité

### Négatives

- Le comportement ne reflète pas la complexité réelle d'un prestataire de paiement : pas de 3DS, pas de remboursement, pas de webhook asynchrone réel
- Le taux de succès fixe à 90% ne simule pas les cas réels (fraude, fonds insuffisants, délai réseau)
- Le délai de traitement est instantané — les vraies APIs de paiement prennent 1-3 secondes et peuvent être asynchrones
- Une migration vers un vrai prestataire nécessitera une refonte complète du service `payment` et l'ajout de webhooks publics

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Stripe (mode test) | Nécessite une clé API Stripe (compte requis), des webhooks HTTPS accessibles publiquement ; incompatible avec le fonctionnement hors ligne |
| PayPal Sandbox | Mêmes contraintes que Stripe + complexité de l'intégration SDK PayPal |
| Adyen (test environment) | Même problématique réseau ; Adyen est orienté grande entreprise avec une API plus complexe |
| Stripe CLI + webhook forwarding | Partiellement compatible avec le dev local mais nécessite la CLI Stripe installée, un compte et une connexion réseau |

## Plan d'implémentation

- Le taux de succès est configurable via `application.yml` (ex. `payment.simulation.success-rate=0.9`)
- Le module `payment` écoute `OrderPlacedEvent` (Spring Modulith `@ApplicationModuleListener`)
- Après simulation, il publie `PaymentCompletedEvent` ou `PaymentFailedEvent`
- Le module `order` écoute ces events pour mettre à jour le statut de la commande
- Le module `notification` envoie les emails correspondants (confirmation ou échec)
- L'enregistrement `payment_payments` trace : `orderId`, `amount`, `status`, `created_at`

## Références

- [docs/02-architecture.md](../02-architecture.md) — flux de passage de commande et événements
- [docs/03-functional.md](../03-functional.md) — cas d'usage paiement
- ADR-0001 — Monolithe modulaire (communication par Domain Events entre `order` et `payment`)
- ADR-0004 — PostgreSQL (persistance des paiements)
