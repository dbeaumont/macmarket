# ADR-0008 — Entites JPA read-only locales pour le module admin

## Statut

Accepte

## Contexte

Le module `admin` doit afficher un dashboard avec des statistiques agregeant des donnees de commandes et de produits. Il a besoin de requetes complexes (aggregations, groupements, pagination) sur les tables `order_orders` et `catalog_products`.

Deux approches possibles :
1. Importer les entites JPA et repositories du module `order` et `catalog` (couplage technique fort)
2. Definir des entites JPA read-only locales au module `admin`, mappees sur les memes tables

## Decision

Le module `admin` definit ses **propres entites JPA en lecture seule** (`AdminOrderEntity`, `AdminOrderItemEntity`, `AdminProductEntity`) mappees sur les tables des autres modules. Ces entites n'ont pas de setters (sauf pour JPA) et ne sont utilisees que pour les requetes de lecture.

### Structure

```
admin/infrastructure/persistence/
├── entity/
│   ├── AdminOrderEntity.java       → table order_orders
│   ├── AdminOrderItemEntity.java   → table order_items
│   ├── AdminProductEntity.java     → table catalog_products (ex products)
│   └── AdminDailyStatsEntity.java  → table admin_daily_stats (propre)
└── repository/
    ├── AdminOrderReadRepository.java     → JpaRepository<AdminOrderEntity>
    └── AdminProductReadRepository.java   → JpaRepository<AdminProductEntity>
```

### Pour les mutations

Le module `admin` passe par l'API publique du module `order` (`UpdateOrderStatusService`) pour modifier le statut d'une commande. Il ne fait jamais de `save()` sur les entites read-only des autres modules.

## Consequences

### Positives
- **Aucun import d'infrastructure cross-context** : le module admin est autonome
- Les requetes complexes (aggregations JPQL, native queries) sont definies localement
- Si le schema de `order_orders` change, seul le mapper/entite local est a adapter
- Compatible avec le pattern CQRS (read model dedie)

### Negatives
- Duplication des mappings JPA (colonnes re-declarees dans les entites admin)
- Risque de desynchronisation si les colonnes changent dans les migrations Flyway
- JPA peut lever des avertissements sur les entites multiples mappees sur la meme table (resolu via `@Table`)
