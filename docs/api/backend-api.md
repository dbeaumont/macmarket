# Documentation des API REST — macmarket Backend

> Générée le 2026-07-08 à partir des `@RestController` Spring Boot.  
> Authentification : JWT Bearer Token émis par Keycloak (sauf endpoints publics).  
> Format d'erreur standard : voir section [Structure ErrorResponse](#structure-errorresponse).

---

## Structure ErrorResponse

Toutes les erreurs retournent le format suivant :

```json
{
  "code": "NOT_FOUND",
  "message": "Description lisible de l'erreur",
  "status": 404,
  "timestamp": "2026-07-08T10:00:00Z"
}
```

Codes possibles : `NOT_FOUND`, `DOMAIN_ERROR`, `VALIDATION_ERROR`, `FORBIDDEN`, `BAD_REQUEST`, `INTERNAL_ERROR`.

---

## Catalogue (Catalog)

### GET /api/v1/products

**Description** : Liste les produits actifs du catalogue avec pagination et filtres.  
**Authentification** : Public

#### Paramètres

| Nom | Type | Obligatoire | Défaut | Description |
|---|---|---|---|---|
| `page` | `int` (query) | Non | `0` | Numéro de page (0-indexé) |
| `size` | `int` (query) | Non | `12` | Taille de page |
| `sort` | `string` (query) | Non | `createdAt,desc` | Champ et direction de tri |
| `category` | `string` (query) | Non | — | Filtre par catégorie |
| `search` | `string` (query) | Non | — | Recherche textuelle |
| `minPrice` | `number` (query) | Non | — | Prix minimum |
| `maxPrice` | `number` (query) | Non | — | Prix maximum |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Page de `ProductResponse` JSON |

#### Exemple de réponse succès

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "MacBook Pro 14\"",
      "slug": "macbook-pro-14",
      "description": "Ordinateur portable Apple...",
      "shortDesc": "Puce M3 Pro, 18 Go RAM",
      "price": 2499.99,
      "category": "ordinateurs",
      "imageUrl": "https://...",
      "stockQuantity": 10,
      "reservedQuantity": 2,
      "active": true,
      "specs": { "cpu": "M3 Pro", "ram": "18 Go" },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "totalElements": 42,
  "totalPages": 4,
  "size": 12,
  "number": 0
}
```

---

### GET /api/v1/products/{slug}

**Description** : Récupère un produit par son slug.  
**Authentification** : Public

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `slug` | `string` (path) | Oui | Slug unique du produit |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `ProductResponse` JSON |
| `404 Not Found` | Produit introuvable | `ErrorResponse` |

#### Exemple de réponse succès

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "MacBook Pro 14\"",
  "slug": "macbook-pro-14",
  "description": "Ordinateur portable Apple...",
  "shortDesc": "Puce M3 Pro, 18 Go RAM",
  "price": 2499.99,
  "category": "ordinateurs",
  "imageUrl": "https://...",
  "stockQuantity": 10,
  "reservedQuantity": 2,
  "active": true,
  "specs": { "cpu": "M3 Pro", "ram": "18 Go" },
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

### GET /api/v1/categories

**Description** : Retourne la liste des catégories actives avec le nombre de produits associés.  
**Authentification** : Public

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Liste de `CategoryCountResponse` JSON |

#### Exemple de réponse succès

```json
[
  { "category": "ordinateurs", "count": 12 },
  { "category": "smartphones", "count": 8 }
]
```

---

### POST /api/v1/admin/products

**Description** : Crée un nouveau produit dans le catalogue.  
**Authentification** : JWT requis — Rôles : `MANAGER`, `ADMIN`

#### Corps de la requête

```json
{
  "name": "string (obligatoire, max 200)",
  "slug": "string (obligatoire, max 200)",
  "description": "string (optionnel)",
  "shortDesc": "string (optionnel, max 500)",
  "price": "number (obligatoire, > 0)",
  "category": "string (obligatoire)",
  "imageUrl": "string (optionnel, max 500)",
  "stockQuantity": "integer (obligatoire, >= 0)",
  "specs": { "clé": "valeur" }
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `201 Created` | Produit créé | `ProductResponse` JSON |
| `400 Bad Request` | Validation échouée | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |
| `403 Forbidden` | Rôle insuffisant | `ErrorResponse` |
| `422 Unprocessable Entity` | Règle métier violée (ex: slug déjà existant) | `ErrorResponse` |

---

### PUT /api/v1/admin/products/{id}

**Description** : Met à jour un produit existant (mise à jour partielle possible).  
**Authentification** : JWT requis — Rôles : `MANAGER`, `ADMIN`

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant du produit |

#### Corps de la requête

```json
{
  "name": "string (optionnel, max 200)",
  "description": "string (optionnel)",
  "shortDesc": "string (optionnel, max 500)",
  "price": "number (optionnel)",
  "category": "string (optionnel)",
  "imageUrl": "string (optionnel, max 500)",
  "stockQuantity": "integer (optionnel)",
  "active": "boolean (optionnel)",
  "specs": { "clé": "valeur" }
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Produit mis à jour | `ProductResponse` JSON |
| `400 Bad Request` | Validation échouée | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |
| `403 Forbidden` | Rôle insuffisant | `ErrorResponse` |
| `404 Not Found` | Produit introuvable | `ErrorResponse` |

---

### DELETE /api/v1/admin/products/{id}

**Description** : Désactive un produit (suppression logique).  
**Authentification** : JWT requis — Rôles : `MANAGER`, `ADMIN`

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant du produit |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `204 No Content` | Produit désactivé | — |
| `401 Unauthorized` | Non authentifié | — |
| `403 Forbidden` | Rôle insuffisant | `ErrorResponse` |
| `404 Not Found` | Produit introuvable | `ErrorResponse` |

---

## Panier (Cart)

> Le panier supporte deux modes : **utilisateur authentifié** (JWT) et **invité** (header `X-Guest-Cart-Token`).  
> Au moins l'un des deux doit être fourni.

### GET /api/v1/cart

**Description** : Récupère le panier de l'utilisateur ou de l'invité.  
**Authentification** : JWT optionnel (invité via header `X-Guest-Cart-Token`)

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `X-Guest-Cart-Token` | `string` (header) | Non | Token du panier invité (si non authentifié) |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `CartResponse` JSON |

#### Exemple de réponse succès

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "items": [
    {
      "productId": "a1b2c3d4-...",
      "productName": "MacBook Pro 14\"",
      "productImage": "https://...",
      "unitPrice": 2499.99,
      "quantity": 1,
      "subtotal": 2499.99
    }
  ],
  "total": 2499.99
}
```

---

### POST /api/v1/cart/items

**Description** : Ajoute un article au panier.  
**Authentification** : JWT optionnel (invité via header `X-Guest-Cart-Token`)

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `X-Guest-Cart-Token` | `string` (header) | Non | Token du panier invité |

#### Corps de la requête

```json
{
  "productId": "UUID (obligatoire)",
  "quantity": "integer (obligatoire, > 0)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `201 Created` | Article ajouté | `CartResponse` JSON |
| `400 Bad Request` | Validation échouée | `ErrorResponse` |
| `404 Not Found` | Produit introuvable | `ErrorResponse` |
| `422 Unprocessable Entity` | Stock insuffisant | `ErrorResponse` |

---

### PUT /api/v1/cart/items/{productId}

**Description** : Met à jour la quantité d'un article dans le panier.  
**Authentification** : JWT optionnel (invité via header `X-Guest-Cart-Token`)

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `productId` | `UUID` (path) | Oui | Identifiant du produit |
| `X-Guest-Cart-Token` | `string` (header) | Non | Token du panier invité |

#### Corps de la requête

```json
{
  "quantity": "integer (obligatoire, > 0)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Quantité mise à jour | `CartResponse` JSON |
| `400 Bad Request` | Validation échouée | `ErrorResponse` |
| `422 Unprocessable Entity` | Stock insuffisant | `ErrorResponse` |

---

### DELETE /api/v1/cart/items/{productId}

**Description** : Supprime un article du panier.  
**Authentification** : JWT optionnel (invité via header `X-Guest-Cart-Token`)

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `productId` | `UUID` (path) | Oui | Identifiant du produit à supprimer |
| `X-Guest-Cart-Token` | `string` (header) | Non | Token du panier invité |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `204 No Content` | Article supprimé | — |
| `404 Not Found` | Article introuvable dans le panier | `ErrorResponse` |

---

### DELETE /api/v1/cart

**Description** : Vide entièrement le panier.  
**Authentification** : JWT optionnel (invité via header `X-Guest-Cart-Token`)

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `X-Guest-Cart-Token` | `string` (header) | Non | Token du panier invité |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `204 No Content` | Panier vidé | — |

---

### POST /api/v1/cart/merge

**Description** : Fusionne le panier invité dans le panier de l'utilisateur authentifié (à appeler après connexion).  
**Authentification** : JWT requis

#### Corps de la requête

```json
{
  "guestToken": "string (obligatoire, 8-64 caractères)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Panier fusionné | `CartResponse` JSON |
| `400 Bad Request` | Token invalide | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |

---

## Commandes (Order)

### POST /api/v1/orders

**Description** : Passe une commande à partir du panier courant de l'utilisateur.  
**Authentification** : JWT requis

#### Corps de la requête

```json
{
  "shippingName": "string (obligatoire)",
  "shippingAddress": "string (obligatoire)",
  "shippingEmail": "string (obligatoire)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `201 Created` | Commande créée | `OrderResponse` JSON |
| `400 Bad Request` | Validation échouée | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |
| `422 Unprocessable Entity` | Panier vide ou stock insuffisant | `ErrorResponse` |

#### Exemple de réponse succès

```json
{
  "id": "ord-550e8400-...",
  "userId": "user-123",
  "status": "PENDING",
  "items": [
    {
      "productId": "a1b2c3d4-...",
      "productName": "MacBook Pro 14\"",
      "productImage": "https://...",
      "unitPrice": 2499.99,
      "quantity": 1,
      "subtotal": 2499.99
    }
  ],
  "total": 2499.99,
  "shippingName": "Alice Martin",
  "shippingAddress": "12 rue de la Paix, 75001 Paris",
  "shippingEmail": "alice@example.com",
  "createdAt": "2026-07-08T10:00:00Z"
}
```

---

### GET /api/v1/orders

**Description** : Liste toutes les commandes de l'utilisateur authentifié.  
**Authentification** : JWT requis

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Liste de `OrderResponse` JSON |
| `401 Unauthorized` | Non authentifié | — |

---

### GET /api/v1/orders/{id}

**Description** : Récupère le détail d'une commande par son identifiant.  
**Authentification** : JWT requis

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant de la commande |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `OrderResponse` JSON |
| `401 Unauthorized` | Non authentifié | — |
| `404 Not Found` | Commande introuvable | `ErrorResponse` |

---

### GET /api/v1/orders/{id}/invoice

**Description** : Télécharge la facture PDF d'une commande.  
**Authentification** : JWT requis [À PRÉCISER : vérification que la commande appartient à l'utilisateur non explicite dans le controller]

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant de la commande |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Fichier PDF (`application/pdf`) — header `Content-Disposition: attachment; filename=facture-XXXXXXXX.pdf` |
| `404 Not Found` | Commande introuvable | `ErrorResponse` |

---

## Paiement (Payment)

### GET /api/v1/payments/order/{orderId}

**Description** : Récupère le paiement associé à une commande.  
**Authentification** : Public [À PRÉCISER : aucune restriction d'accès détectée dans le controller]

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `orderId` | `UUID` (path) | Oui | Identifiant de la commande |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `PaymentResponse` JSON |
| `404 Not Found` | Paiement introuvable | `ErrorResponse` |

#### Exemple de réponse succès

```json
{
  "id": "pay-550e8400-...",
  "orderId": "ord-550e8400-...",
  "amount": 2499.99,
  "status": "COMPLETED",
  "transactionRef": "TXN-20260708-001",
  "failureReason": null,
  "createdAt": "2026-07-08T10:05:00Z"
}
```

---

## Utilisateur (User)

### GET /api/v1/users/me

**Description** : Retourne le profil de l'utilisateur connecté (données issues du JWT Keycloak).  
**Authentification** : JWT requis

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Profil JWT JSON |
| `401 Unauthorized` | Non authentifié | — |

#### Exemple de réponse succès

```json
{
  "sub": "user-uuid-keycloak",
  "email": "alice@example.com",
  "name": "Alice Martin",
  "preferredUsername": "alice.martin",
  "roles": ["USER", "MANAGER"]
}
```

---

### GET /api/v1/users/me/shipping-profile

**Description** : Récupère le profil de livraison enregistré de l'utilisateur connecté.  
**Authentification** : JWT requis

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Profil trouvé | `ShippingProfileResponse` JSON |
| `204 No Content` | Aucun profil enregistré | — |
| `401 Unauthorized` | Non authentifié | — |

#### Exemple de réponse succès

```json
{
  "name": "Alice Martin",
  "address": "12 rue de la Paix, 75001 Paris",
  "email": "alice@example.com"
}
```

---

## Assistant IA (Assistant)

### POST /api/v1/assistant/chat

**Description** : Envoie un message à l'assistant IA et reçoit la réponse en streaming SSE (Server-Sent Events).  
**Authentification** : JWT requis  
**Content-Type réponse** : `text/event-stream`

#### Corps de la requête

```json
{
  "message": "string (obligatoire)",
  "conversationId": "string (optionnel — crée une nouvelle conversation si absent)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Flux SSE démarré | Événements SSE (`text/event-stream`) |
| `400 Bad Request` | Message vide | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |

> **Événements SSE** : le flux envoie des événements au fil de la génération. En cas d'erreur de l'assistant, un événement `event: error` est envoyé avec `{"content": "L'assistant est temporairement indisponible"}`. Le timeout de connexion est de 10 minutes.

---

### DELETE /api/v1/assistant/conversations/{id}

**Description** : Supprime l'historique d'une conversation avec l'assistant.  
**Authentification** : JWT requis [À PRÉCISER : aucun `@PreAuthorize` détecté, l'accès se base sur la présence du JWT]

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `string` (path) | Oui | Identifiant de la conversation |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `204 No Content` | Conversation supprimée | — |
| `401 Unauthorized` | Non authentifié | — |

---

## Administration — Commandes (Admin)

> Tous les endpoints d'administration nécessitent un JWT valide. Les rôles requis sont précisés par endpoint.

### GET /api/v1/admin/orders

**Description** : Liste toutes les commandes avec pagination et filtre par statut.  
**Authentification** : JWT requis [À PRÉCISER : aucun `@PreAuthorize` sur ce controller — accès sécurisé via config Spring Security globale]

#### Paramètres

| Nom | Type | Obligatoire | Défaut | Description |
|---|---|---|---|---|
| `status` | `string` (query) | Non | — | Filtre par statut (`PENDING`, `CONFIRMED`, `SHIPPED`…) |
| `page` | `int` (query) | Non | `0` | Numéro de page |
| `size` | `int` (query) | Non | `20` | Taille de page |
| `sort` | `string` (query) | Non | `createdAt,desc` | Champ et direction de tri |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Page de `AdminOrderResponse` JSON |
| `401 Unauthorized` | Non authentifié | — |

---

### GET /api/v1/admin/orders/{id}

**Description** : Récupère le détail complet d'une commande (avec lignes de commande).  
**Authentification** : JWT requis

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant de la commande |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `AdminOrderDetailResponse` JSON |
| `404 Not Found` | Commande introuvable | `ErrorResponse` |

#### Exemple de réponse succès

```json
{
  "id": "550e8400-...",
  "userId": "user-123",
  "status": "CONFIRMED",
  "total": 2499.99,
  "shippingName": "Alice Martin",
  "shippingAddress": "12 rue de la Paix, 75001 Paris",
  "shippingEmail": "alice@example.com",
  "items": [
    {
      "productId": "a1b2c3d4-...",
      "productName": "MacBook Pro 14\"",
      "unitPrice": 2499.99,
      "quantity": 1,
      "subtotal": 2499.99
    }
  ],
  "createdAt": "2026-07-08T10:00:00Z",
  "updatedAt": "2026-07-08T10:05:00Z"
}
```

---

### PUT /api/v1/admin/orders/{id}/status

**Description** : Met à jour le statut d'une commande.  
**Authentification** : JWT requis

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `UUID` (path) | Oui | Identifiant de la commande |

#### Corps de la requête

```json
{
  "status": "string (obligatoire — ex: CONFIRMED, SHIPPED, CANCELLED)"
}
```

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `204 No Content` | Statut mis à jour | — |
| `400 Bad Request` | Statut invalide | `ErrorResponse` |
| `404 Not Found` | Commande introuvable | `ErrorResponse` |
| `422 Unprocessable Entity` | Transition de statut invalide | `ErrorResponse` |

---

## Administration — Clients (Admin)

### GET /api/v1/admin/customers

**Description** : Liste les clients avec pagination.  
**Authentification** : JWT requis [À PRÉCISER : aucun `@PreAuthorize` sur ce controller]

#### Paramètres

| Nom | Type | Obligatoire | Défaut | Description |
|---|---|---|---|---|
| `page` | `int` (query) | Non | `0` | Numéro de page |
| `size` | `int` (query) | Non | `20` | Taille de page |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Page de `CustomerSummaryResponse` JSON [À PRÉCISER : structure exacte de la map retournée] |
| `401 Unauthorized` | Non authentifié | — |

---

### GET /api/v1/admin/customers/{userId}/orders

**Description** : Récupère toutes les commandes d'un client.  
**Authentification** : JWT requis

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `userId` | `string` (path) | Oui | Identifiant Keycloak de l'utilisateur |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | Liste de `AdminOrderResponse` JSON |
| `401 Unauthorized` | Non authentifié | — |

---

## Administration — Tableau de bord (Admin)

### GET /api/v1/admin/dashboard

**Description** : Retourne les indicateurs clés du tableau de bord d'administration.  
**Authentification** : JWT requis [À PRÉCISER : aucun `@PreAuthorize` sur ce controller]

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `DashboardResponse` JSON |
| `401 Unauthorized` | Non authentifié | — |

#### Exemple de réponse succès

```json
{
  "totalOrders": 142,
  "totalRevenue": 358420.50,
  "totalCustomers": 87,
  "activeProducts": 34,
  "lowStockCount": 5,
  "ordersByStatus": {
    "PENDING": 12,
    "CONFIRMED": 45,
    "SHIPPED": 80,
    "CANCELLED": 5
  },
  "revenueChart": [ ... ],
  "recentOrders": [ ... ],
  "lowStockProducts": [ ... ]
}
```

---

## Administration — Statistiques (Admin)

### GET /api/v1/admin/stats/{type}

**Description** : Retourne des statistiques détaillées selon le type demandé.  
**Authentification** : JWT requis — Rôle : `ADMIN`

#### Paramètres

| Nom | Type | Obligatoire | Description |
|---|---|---|---|
| `type` | `string` (path) | Oui | Type de stats : `revenue`, `products`, `customers`, `orders` |
| `period` | `string` (query) | Non | Période (défaut : `30d`) |

#### Réponses

| Code HTTP | Description | Corps |
|---|---|---|
| `200 OK` | Succès | `RevenueStatsResponse` / `ProductStatsResponse` / `CustomerStatsResponse` / `OrderStatsResponse` selon le type |
| `400 Bad Request` | Type inconnu | `ErrorResponse` |
| `401 Unauthorized` | Non authentifié | — |
| `403 Forbidden` | Rôle `ADMIN` requis | `ErrorResponse` |

---

## Récapitulatif des endpoints

| Méthode | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Public | Lister les produits avec filtres |
| `GET` | `/api/v1/products/{slug}` | Public | Récupérer un produit par slug |
| `GET` | `/api/v1/categories` | Public | Lister les catégories |
| `POST` | `/api/v1/admin/products` | JWT + `MANAGER`/`ADMIN` | Créer un produit |
| `PUT` | `/api/v1/admin/products/{id}` | JWT + `MANAGER`/`ADMIN` | Mettre à jour un produit |
| `DELETE` | `/api/v1/admin/products/{id}` | JWT + `MANAGER`/`ADMIN` | Désactiver un produit |
| `GET` | `/api/v1/cart` | JWT ou invité | Récupérer le panier |
| `POST` | `/api/v1/cart/items` | JWT ou invité | Ajouter un article au panier |
| `PUT` | `/api/v1/cart/items/{productId}` | JWT ou invité | Modifier la quantité d'un article |
| `DELETE` | `/api/v1/cart/items/{productId}` | JWT ou invité | Supprimer un article du panier |
| `DELETE` | `/api/v1/cart` | JWT ou invité | Vider le panier |
| `POST` | `/api/v1/cart/merge` | JWT requis | Fusionner panier invité → utilisateur |
| `POST` | `/api/v1/orders` | JWT requis | Passer une commande |
| `GET` | `/api/v1/orders` | JWT requis | Lister mes commandes |
| `GET` | `/api/v1/orders/{id}` | JWT requis | Détail d'une commande |
| `GET` | `/api/v1/orders/{id}/invoice` | JWT requis | Télécharger la facture PDF |
| `GET` | `/api/v1/payments/order/{orderId}` | Public [À PRÉCISER] | Récupérer le paiement d'une commande |
| `GET` | `/api/v1/users/me` | JWT requis | Profil utilisateur connecté |
| `GET` | `/api/v1/users/me/shipping-profile` | JWT requis | Profil de livraison enregistré |
| `POST` | `/api/v1/assistant/chat` | JWT requis | Chat SSE avec l'assistant IA |
| `DELETE` | `/api/v1/assistant/conversations/{id}` | JWT requis | Supprimer une conversation |
| `GET` | `/api/v1/admin/orders` | JWT requis | Lister toutes les commandes (admin) |
| `GET` | `/api/v1/admin/orders/{id}` | JWT requis | Détail d'une commande (admin) |
| `PUT` | `/api/v1/admin/orders/{id}/status` | JWT requis | Mettre à jour le statut d'une commande |
| `GET` | `/api/v1/admin/customers` | JWT requis | Lister les clients |
| `GET` | `/api/v1/admin/customers/{userId}/orders` | JWT requis | Commandes d'un client |
| `GET` | `/api/v1/admin/dashboard` | JWT requis | Tableau de bord admin |
| `GET` | `/api/v1/admin/stats/{type}` | JWT + `ADMIN` | Statistiques avancées |
