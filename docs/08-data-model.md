# 08 — Modèle de données

## Contexte

- **Engine** : PostgreSQL 17
- **Schema** : public (application) + keycloak (schema dédié Keycloak)
- **DDL Auto** : `none` — les migrations sont gérées exclusivement par Flyway
- **Migrations** : `classpath:db/migration/V*.sql`

## Migrations Flyway

| Version | Fichier | Contenu |
|---------|---------|---------|
| V1 | `V1__create_catalog_tables.sql` | `catalog_products`, `catalog_product_specs` |
| V2 | `V2__create_cart_tables.sql` | `cart_carts`, `cart_items` |
| V3 | `V3__create_event_publication_table.sql` | Table Spring Modulith event publication |
| V4 | `V4__create_order_tables.sql` | `order_orders`, `order_items` |
| V5 | `V5__create_payment_table.sql` | `payment_payments` |
| V6 | `V6__seed_products.sql` | Données initiales — catalogue Mac |
| V7 | `V7__create_admin_daily_stats.sql` | `admin_daily_stats` |
| V8 | `V8__create_user_shipping_profiles_table.sql` | `user_shipping_profiles` |

## Schéma logique

```mermaid
classDiagram
    class catalog_products {
        +UUID id PK
        +VARCHAR name
        +VARCHAR slug UNIQUE
        +TEXT description
        +VARCHAR short_desc
        +NUMERIC price
        +VARCHAR category
        +VARCHAR image_url
        +INT stock_quantity
        +INT reserved_quantity
        +BOOLEAN active
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    class catalog_product_specs {
        +UUID id PK
        +UUID product_id FK
        +VARCHAR spec_key
        +VARCHAR spec_value
        +INT sort_order
    }
    class cart_carts {
        +UUID id PK
        +VARCHAR user_id UNIQUE
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    class cart_items {
        +UUID id PK
        +UUID cart_id FK
        +UUID product_id
        +VARCHAR product_name
        +VARCHAR product_image
        +NUMERIC unit_price
        +INT quantity
        +TIMESTAMP added_at
    }
    class order_orders {
        +UUID id PK
        +VARCHAR user_id
        +VARCHAR status
        +NUMERIC total
        +VARCHAR shipping_name
        +TEXT shipping_address
        +VARCHAR shipping_email
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    class order_items {
        +UUID id PK
        +UUID order_id FK
        +UUID product_id
        +VARCHAR product_name
        +VARCHAR product_image
        +NUMERIC unit_price
        +INT quantity
        +NUMERIC subtotal
    }
    class payment_payments {
        +UUID id PK
        +UUID order_id UNIQUE
        +NUMERIC amount
        +VARCHAR status
        +VARCHAR transaction_ref
        +VARCHAR failure_reason
        +TIMESTAMP created_at
        +TIMESTAMP completed_at
    }
    class user_shipping_profiles {
        +UUID id PK
        +VARCHAR user_id UNIQUE
        +VARCHAR name
        +TEXT address
        +VARCHAR email
        +TIMESTAMP created_at
        +TIMESTAMP updated_at
    }
    class admin_daily_stats {
        +DATE stat_date PK
        +INT orders_count
        +NUMERIC revenue
        +INT new_users_count
        +TIMESTAMP updated_at
    }

    catalog_products "1" --> "0..*" catalog_product_specs : product_id
    cart_carts "1" --> "0..*" cart_items : cart_id
    order_orders "1" --> "1..*" order_items : order_id
    order_orders "1" -- "0..1" payment_payments : order_id
```

## Carte des domaines de données

```mermaid
graph TB
    subgraph CATALOG["Domaine Catalogue"]
        CP["catalog_products"]
        CPS["catalog_product_specs"]
    end
    subgraph CART["Domaine Panier"]
        CC["cart_carts"]
        CI["cart_items"]
    end
    subgraph ORDER["Domaine Commande"]
        OO["order_orders"]
        OI["order_items"]
    end
    subgraph PAYMENT["Domaine Paiement"]
        PP["payment_payments"]
    end
    subgraph USER["Domaine Utilisateur"]
        USP["user_shipping_profiles"]
    end
    subgraph ADMIN["Domaine Admin"]
        ADS["admin_daily_stats"]
    end
    subgraph MODULITH["Spring Modulith"]
        EP["event_publication"]
    end

    CATALOG --- CART
    CART --- ORDER
    ORDER --- PAYMENT
    ORDER --- ADMIN
```

## Index et contraintes

| Table | Index |
|-------|-------|
| `catalog_products` | `slug` (unique), `category`, `active` |
| `catalog_product_specs` | `product_id`, `(product_id, spec_key)` (unique) |
| `cart_carts` | `user_id` (unique) |
| `cart_items` | `cart_id`, `(cart_id, product_id)` (unique) |
| `order_orders` | `user_id`, `status`, `created_at` |
| `order_items` | `order_id` |
| `payment_payments` | `order_id` (unique), `status` |
| `user_shipping_profiles` | `user_id` (unique) |

## Conventions de nommage des tables

Les tables sont préfixées par leur module applicatif pour éviter les conflits et refléter l'appartenance au bounded context :

| Préfixe | Module |
|---------|--------|
| `catalog_` | catalog |
| `cart_` | cart |
| `order_` | order |
| `payment_` | payment |
| `user_` | user |
| `admin_` | admin |

## Identifiants

Tous les identifiants primaires sont des **UUID** (`gen_random_uuid()` PostgreSQL), sans séquence auto-incrémentée. Cela garantit la portabilité et l'absence de collisions lors d'éventuelles fusions de données.

## Snapshot des produits dans le panier et les commandes

Les tables `cart_items` et `order_items` stockent une **copie dénormalisée** des données produit (`product_name`, `product_image`, `unit_price`). Cela garantit que le panier et les commandes sont immuables par rapport aux modifications ultérieures du catalogue.
