# ADR-0004 — PostgreSQL comme base de données principale

## Statut

Accepté

## Contexte

Le projet nécessite un système de persistance pour l'ensemble des données métier : catalogue produits, paniers, commandes, paiements, profils utilisateurs, statistiques et la table de publication des Domain Events Spring Modulith.

Les besoins sont :

- Transactions ACID pour les opérations critiques (passage de commande, déduction de stock, création de paiement)
- Support des UUID comme clés primaires (Value Objects DDD fortement typés)
- Migrations de schéma versionnées et reproductibles
- Données structurées avec des relations entre entités (commandes → lignes, produits → specs)
- Compatibilité avec Spring Data JPA et Flyway

## Décision

Utiliser **PostgreSQL 17** comme unique base de données relationnelle, gérée via **Flyway** pour les migrations de schéma.

**Choix techniques associés :**
- Spring Data JPA (Hibernate) comme ORM
- `spring.jpa.hibernate.ddl-auto=none` : le DDL est exclusivement géré par Flyway
- Les migrations sont nommées `V{n}__{description}.sql` dans `classpath:db/migration/`
- Convention de nommage des tables : préfixe par module (`catalog_products`, `cart_carts`, `order_orders`, etc.) pour éviter les conflits et refléter les bounded contexts
- UUID (`gen_random_uuid()`) comme type de clé primaire, aligné avec les Value Objects DDD

**Migrations Flyway :**

| Version | Contenu |
|---------|---------|
| V1 | `catalog_products`, `catalog_product_specs` |
| V2 | `cart_carts`, `cart_items` |
| V3 | Table de publication Spring Modulith Event |
| V4 | `order_orders`, `order_items` |
| V5 | `payment_payments` |
| V6 | Seed données initiales — catalogue Mac |
| V7 | `admin_daily_stats` |
| V8 | `user_shipping_profiles` |

## Conséquences

### Positives

- ACID garanti : la cohérence des données est assurée même en cas d'échec partiel (ex. commande créée mais paiement échoué — le Domain Event `PaymentFailedEvent` remet la commande à jour)
- UUID natifs PostgreSQL (`gen_random_uuid()`) alignés avec les Value Objects DDD
- Flyway assure la reproductibilité exacte du schéma en développement, test et production
- La table `event_publication` Spring Modulith garantit la livraison des Domain Events (idempotence en cas de redémarrage)
- PostgreSQL 17 apporte des performances solides et un écosystème mature (JSONB, Full-text search disponibles si besoin)
- Schéma dédié Keycloak (`keycloak` schema) isolé du schéma applicatif (`public`)

### Négatives

- Base de données unique partagée entre tous les modules : risque de couplage de données si les modules accèdent directement aux tables des autres modules (à surveiller via les règles Spring Modulith)
- Scalabilité horizontale de la base de données non native (pas de sharding intégré) — acceptable pour le volume du projet
- PostgreSQL nécessite plus de ressources qu'une base embarquée (H2) en développement
- Les migrations Flyway sont irréversibles par défaut : une migration incorrecte en production nécessite une migration de correction

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| MySQL / MariaDB | Comportement légèrement différent de PostgreSQL (UUID, JSONB, conformité SQL stricte) ; la cohérence de l'environnement dev/prod est préférable |
| MongoDB (NoSQL) | Le modèle de données est relationnel (commandes → lignes, produits → specs) ; les transactions multi-documents MongoDB sont moins performantes ; incompatible avec Spring Data JPA |
| H2 (base embarquée) | Adapté uniquement pour les tests ; comportement différent de PostgreSQL pour certaines requêtes ; pas d'environnement de production réaliste |
| Base de données par module (un schéma par bounded context) | Complexité accrue sans bénéfice à cette échelle ; les transactions cross-module deviendraient des sagas ; déploiement multi-bases sans l'écosystème microservices |

## Plan d'implémentation

- PostgreSQL est provisionné via Docker Compose (`postgres:17-alpine`)
- Les credentials sont externalisés dans `.env` (gitignore) via les variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- Flyway s'exécute automatiquement au démarrage de Spring Boot (profil `validate` en production recommandé)
- En test, Testcontainers lance un PostgreSQL réel pour les tests d'intégration (`@SpringBootTest`)
- Accès direct à la base : `make db-shell` (psql dans le container)

## Références

- [docs/08-data-model.md](../08-data-model.md) — schéma logique complet et liste des migrations
- ADR-0001 — Monolithe modulaire (base de données partagée entre modules)
- ADR-0002 — Architecture DDD hexagonale (séparation entités JPA / entités domaine)
- [Flyway Documentation](https://documentation.red-gate.com/flyway)
- [Spring Modulith Event Publication](https://docs.spring.io/spring-modulith/reference/events.html)
