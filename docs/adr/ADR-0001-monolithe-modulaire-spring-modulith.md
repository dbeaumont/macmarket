# ADR-0001 — Monolithe modulaire avec Spring Modulith

## Statut

Accepté

## Contexte

MacMarket est une marketplace e-commerce spécialisée dans la vente de Mac. Le projet doit supporter plusieurs domaines métier distincts : catalogue, panier, commandes, paiement, administration, notifications, assistant IA et gestion des utilisateurs.

La question centrale est : faut-il adopter une architecture microservices ou rester sur un déploiement unique ? Les contraintes sont les suivantes :

- Équipe réduite (projet personnel ou petite équipe)
- Contexte de démonstration et d'apprentissage
- Besoin de frontières claires entre les domaines métier pour la maintenabilité
- Absence d'exigences de scalabilité indépendante par service
- Complexité opérationnelle à minimiser (un seul runtime, une seule base de données)

## Décision

Adopter un **monolithe modulaire** structuré avec **Spring Modulith 2.0.5**, découpé en 8 modules correspondant chacun à un bounded context DDD :

| Module | Responsabilité |
|--------|---------------|
| `catalog` | Catalogue produits, stock, CRUD admin |
| `cart` | Panier utilisateur et invité, snapshots produits |
| `order` | Commandes, checkout, factures PDF |
| `payment` | Paiement simulé, statuts |
| `admin` | Backoffice, dashboard, statistiques |
| `notification` | Emails transactionnels (Thymeleaf + JavaMail) |
| `assistant` | Chat IA avec Ollama, streaming SSE |
| `user` | Profils d'adresses de livraison |

Les modules communiquent soit par appel direct de service (pour les dépendances synchrones nécessaires), soit par **Domain Events Spring Modulith** (pour les réactions asynchrones découplées).

## Conséquences

### Positives

- Déploiement simple : un seul artefact JAR, une seule base de données PostgreSQL
- Spring Modulith impose des frontières de module vérifiables à la compilation et par des tests d'architecture
- La communication par Domain Events évite le couplage fort entre modules
- Évolution possible vers des microservices si le besoin apparaît (les modules sont déjà autonomes)
- Complexité opérationnelle minimale : pas d'orchestrateur de conteneurs ni de service mesh nécessaire
- Transactions distribuées inexistantes : la cohérence est gérée dans un seul contexte transactionnel

### Négatives

- Un module défaillant peut impacter les autres (pas d'isolation de process)
- Scalabilité horizontale uniforme uniquement — impossible de scaler indépendamment un module à fort trafic
- Base de données partagée : les migrations Flyway touchent un seul schéma, risque de couplage de données à terme
- Spring Modulith est encore jeune (2.x) — moins d'exemples en production que Spring Boot classique

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Microservices (Spring Cloud) | Complexité opérationnelle disproportionnée pour la taille du projet ; nécessite service discovery, API gateway, tracing distribué, gestion de la cohérence éventuelle |
| Monolithe traditionnel (sans Spring Modulith) | Absence de frontières de module enforce : risque élevé de couplage incontrôlé entre domaines métier au fil du temps |
| Architecture serverless (AWS Lambda, etc.) | Incompatible avec les contraintes de déploiement local (Ollama, Keycloak, Mailpit) et la philosophie du projet |

## Plan d'implémentation

- Chaque module est un package Java de premier niveau sous `com.macmarket.[module]`
- Spring Modulith `@ApplicationModule` délimite les API publiques de chaque module
- Les tests `ApplicationModuleTests` valident l'absence de violation des frontières
- La table `event_publication` (migration V3) assure la persistance des Domain Events pour la reprise en cas d'échec
- Les dépendances directes inter-modules sont documentées explicitement dans `ARCHITECTURE.md`

## Références

- [Spring Modulith Documentation](https://docs.spring.io/spring-modulith/reference/)
- [docs/02-architecture.md](../02-architecture.md) — description des modules et des flux d'événements
- ADR-0002 — Architecture DDD hexagonale (structure interne de chaque module)
- ADR-0004 — PostgreSQL comme base de données principale
