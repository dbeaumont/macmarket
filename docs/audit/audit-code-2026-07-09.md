# Revue de code — MacMarket

> **Note** : cet audit est un instantané historique daté, réalisé **avant** la migration des frontends de React vers Angular (voir [ADR-0006](../adr/ADR-0006-angular-frontends.md)). Les sections « Frontend Shop » et « Frontend Admin » ci-dessous décrivent l'ancien code React et ne reflètent plus l'état actuel du dépôt ; seule la section backend reste directement applicable.

**Date de revue** : 2026-07-09

**Périmètre analysé** :
- `backend/` — modules `order`, `catalog`, `payment`, `cart`, `user` + classes transversales
- `frontend-shop/src/` — stores, hooks, pages, composants, lib
- `frontend-admin/src/` — pages, hooks, composants, lib

---

## Revue de code — Backend Java / Spring Boot DDD

### ✅ Conformes

- Architecture hexagonale respectée : `domain/` sans aucun import Spring/JPA dans tous les modules
- Value Objects correctement déclarés en `record` avec validation dans le constructeur compact (`OrderId`, `ProductId`, `PaymentId`, `UserId`, `Money`, `Email`, etc.)
- IDs fortement typés — aucun `Long`/`String`/`UUID` nu dans les signatures du domaine
- Constructeurs privés + factory methods sur tous les agrégats (`Order.place()`, `Product.create()`, `Payment.initiate()`)
- Pas de setters publics sur les agrégats — modifications uniquement via méthodes comportementales
- `@Transactional` exclusivement dans la couche application
- Domain Events publiés après chaque changement d'état (`pullDomainEvents()`)
- Entités JPA séparées du domaine (`infrastructure/persistence/entity/`)
- Mappers dédiés domaine ↔ JPA (`ProductPersistenceMapper`, `OrderPersistenceMapper`)
- Contrôleurs utilisant `@Valid`, `ResponseEntity<T>` et codes HTTP explicites
- `@ControllerAdvice` global avec réponses structurées (`ErrorResponse`)
- SLF4J utilisé là où des logs sont présents (`ProcessPaymentService`)
- `OrderQueryService` correctement annoté `@Transactional(readOnly = true)`
- `PlaceOrderCommand`, `UpdateProductCommand` déclarés en `record`

---

### ❌ Violations

| # | Règle | Fichier | Problème | Correction |
|---|---|---|---|---|
| 1 | Sécurité — IDOR (OWASP A1) | `order/presentation/rest/OrderController.java` | `getOrder()` reçoit `@AuthenticationPrincipal Jwt jwt` mais ne vérifie jamais que `jwt.getSubject()` correspond à `order.getUserId()`. Tout utilisateur authentifié peut lire la commande de n'importe quel autre utilisateur. | Ajouter : `if (!order.getUserId().value().equals(jwt.getSubject())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();` |
| 2 | Sécurité — IDOR (OWASP A1) | `order/presentation/rest/OrderController.java` | `downloadInvoice()` n'a aucun paramètre `@AuthenticationPrincipal` — aucun contrôle d'appartenance n'est possible. Tout utilisateur authentifié peut télécharger la facture de n'importe quelle commande. | Ajouter `@AuthenticationPrincipal Jwt jwt` et vérifier l'appartenance avant de générer le PDF. |
| 3 | Sécurité — défense en profondeur | `SecurityConfig.java` | `.anyRequest().permitAll()` en fin de chaîne autorise toutes les routes non explicitement listées (actuator, endpoints futurs, etc.). | Remplacer par `.anyRequest().denyAll()` ou `.anyRequest().authenticated()`. |
| 4 | DTO non typé | `catalog/presentation/rest/CatalogController.java` | `listProducts` retourne `ResponseEntity<Map<String, Object>>` — type non sûr, non documentable, non contrat API. | Créer un record `ProductPageResponse(List<ProductResponse> content, long totalElements, int totalPages, int size, int number)` et utiliser `ResponseEntity<ProductPageResponse>`. |
| 5 | Champ mort / bug silencieux | `catalog/presentation/dto/UpdateProductRequest.java` + `CatalogController.java` | `Boolean active` est déclaré dans le DTO request mais absent de `UpdateProductCommand` et non transmis au service. Le champ est accepté dans la requête HTTP mais complètement ignoré — comportement trompeur pour le client de l'API. | Soit supprimer `Boolean active` du DTO, soit l'ajouter à `UpdateProductCommand` et gérer l'activation/désactivation dans `UpdateProductService`. |
| 6 | Bug de persistance | `catalog/infrastructure/persistence/repository/ProductJpaRepository.java` | Dans la branche `save()` pour un produit existant, `entity.setSpecs(...)` est absent. Les spécifications techniques ne sont jamais mises à jour en base lors d'un `updateDetails()`. Seuls les produits créés bénéficient de la persistance des specs. | Ajouter la mise à jour des specs dans la branche `existing.isPresent()`, de la même façon que `mapper.toJpa()` le fait pour les nouveaux produits. |
| 7 | `@SuppressWarnings("unchecked")` — cast non sécurisé | `SecurityConfig.java` | Double cast `(Map<String, Object>)` et `(List<String>)` sur des claims JWT non vérifiés. Si le token est malformé, cela provoque une `ClassCastException` non gérée. | Utiliser `jwt.getClaimAsMap("realm_access")` et `jwt.getClaimAsStringList(...)` ou une vérification `instanceof` avant le cast. |

---

### ⚠️ Suggestions (non-bloquant)

- **`PlaceOrderService.java`** — La méthode `execute()` retourne le domaine `Order` directement à la couche présentation. Le mapping DTO est fait dans le contrôleur, ce qui est acceptable, mais un `OrderResponse` retourné depuis le service applicatif serait plus strictement conforme à la séparation des couches.
- **`CartApplicationService.java`** — La méthode `getCart()` porte `@Transactional(readOnly = true)` alors que la classe est déjà `@Transactional`. C'est techniquement valide (surcharge de méthode) mais mérite un commentaire pour la lisibilité.
- **`CatalogController.java`** — Les routes sont définies directement sur chaque méthode (`@GetMapping("/api/v1/products")`) plutôt que sur la classe via `@RequestMapping`. Cela nuit à la cohérence avec `OrderController` qui utilise `@RequestMapping("/api/v1/orders")`.
- **`UpdateProductCommand.java`** — Le champ `UUID productId` utilise le type nu `UUID` au lieu du Value Object `ProductId`. Cohérence à revoir.

### Verdict Backend : ⚠️ À corriger

Violations 1 et 2 sont **bloquantes de sécurité** (OWASP A1 — Broken Access Control). La violation 6 est un **bug fonctionnel** (données perdues silencieusement). Les autres violations (3, 4, 5, 7) doivent être corrigées avant mise en production.

---

## Revue de code — Frontend Shop (React/TypeScript)

### ✅ Conformes

- Toutes les `interface` Props déclarent les propriétés en `readonly` (`ShippingFormProps`, `CartDrawer Props`, `ProtectedRouteProps`)
- Composants fonctionnels uniquement, pas de class components
- Séparation composant / logique : les appels réseau passent par des custom hooks (`use-place-order`, `use-shipping-profile`, `use-products`, etc.)
- État serveur géré exclusivement avec **TanStack Query**
- `useCartStore` (Zustand) mis à jour de façon immuable — spread operator utilisé systématiquement
- `Cart`, `CartItem` interfaces avec `readonly` et `readonly T[]`
- `api.ts` : toutes les interfaces DTO en `readonly`
- `ProductListPage` — aucune logique métier dans le composant
- `ProtectedRoute` correctement découplé

---

### ❌ Violations

| # | Règle | Fichier | Problème | Correction |
|---|---|---|---|---|
| 1 | Interdit : `any` implicite | `frontend-shop/src/lib/api.ts` | `const body = await res.json().catch(() => ({}))` — `res.json()` retourne `Promise<any>`. `body` est donc typé `any` implicitement, et `body.message` est un accès non sécurisé. Le `frontend-admin` corrige ce point. | Déclarer `const body: unknown = ...` puis affiner avec un type guard, comme dans `frontend-admin/src/lib/api.ts`. |
| 2 | Typage faible | `frontend-shop/src/pages/CheckoutPage.tsx` | `updateField(field: string, value: string)` — `field` est `string` au lieu de `keyof typeof form`. N'importe quelle chaîne est acceptée, les erreurs de frappe ne sont pas détectées. | Remplacer par `field: keyof typeof form`. |
| 3 | Type d'état non déclaré | `frontend-shop/src/pages/CheckoutPage.tsx` | `const [form, setForm] = useState({...})` — le type de l'état est inféré et non explicite. Viole la règle « tout paramètre et variable doit avoir un type explicite ». | Déclarer `interface ShippingForm { readonly shippingName: string; readonly shippingAddress: string; readonly shippingEmail: string; }` et utiliser `useState<ShippingForm>({...})`. |

---

### ⚠️ Suggestions (non-bloquant)

- **`App.tsx` — `TokenSync`** — le `useEffect` ne retourne pas de cleanup. Si jamais ce composant est démonté (cas edge), `_getToken` reste défini avec une référence caduque. Ajouter `return () => setTokenProvider(null)` (après avoir adapté `setTokenProvider` à accepter `null`).
- **`use-cart-sync.ts`** — le hook combine TanStack Query et un `useEffect` pour synchroniser vers Zustand. C'est fonctionnel mais le double état (Query cache + Zustand) peut créer des désynchronisations. Envisager de lire directement depuis le cache Query dans les composants.

### Verdict frontend-shop : ⚠️ À corriger

Violation 1 (implicite `any`) est bloquante selon les règles du projet. Violations 2 et 3 doivent être corrigées.

---

## Revue de code — Frontend Admin (React/TypeScript)

### ✅ Conformes

- `lib/api.ts` — gestion exemplaire de l'erreur HTTP : `body: unknown`, type guard complet avant accès à `.message`
- Toutes les interfaces DTO en `readonly` (`DashboardData`, `LowStockProduct`, `RecentOrder`, etc.)
- Custom hooks isolent les appels réseau (`use-dashboard`, `use-inventory`, `use-customers`, etc.)
- `lib/auth.ts` — typage strict avec `KeycloakProfile`, `readonly` partout, pas d'`any`
- `AdminGuard` — logique d'autorisation isolée du rendu
- `CATEGORIES` déclaré `as const` avec `type Category = typeof CATEGORIES[number]`
- `useSpecEntries` — tableau `readonly SpecEntry[]` mis à jour de façon immuable (slice, spread, map)
- `ProductFormPage` — `handleSubmit` explicitement typé `(e: React.FormEvent<HTMLFormElement>): void`

---

### ❌ Violations

| # | Règle | Fichier | Problème | Correction |
|---|---|---|---|---|
| 1 | Interdit : `!` non-null assertion | `frontend-admin/src/hooks/use-product-form.ts` | `updateProduct(id!, data)` — `id` peut être `undefined` (cas création). L'assertion `!` contourne le compilateur ; si appelé sans `id`, l'URL devient `undefined` et la requête échoue silencieusement. | Ajouter une garde : `if (!id) throw new Error('id is required for update');` avant la mutation, ou conditionner l'activation de `updateMutation` à `Boolean(id)`. |
| 2 | Props sans `readonly` | `frontend-admin/src/App.tsx` | `function AdminPage({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'ADMIN' })` — les props inline ne sont pas `readonly`. | Extraire une `interface AdminPageProps { readonly children: React.ReactNode; readonly requiredRole?: 'ADMIN'; }` et l'utiliser. |

---

### ⚠️ Suggestions (non-bloquant)

- **`use-product-form.ts` — `useEditableProduct`** — pour trouver un produit par son `id`, le hook charge **1000 produits** et filtre côté client. Il faudrait un endpoint `GET /api/v1/admin/products/{id}` dédié pour éviter ce sur-chargement.
- **`App.tsx` — `TokenSync` admin** — `setTokenProvider(async () => auth.user?.access_token)` ne gère pas l'expiration du token ni le renouvellement silencieux. Si le token expire pendant la session, toutes les requêtes API retourneront 401 sans tentative de refresh. La version shop est plus robuste sur ce point.
- **`CustomersPage.tsx`** — `data: data?.content ? [...data.content] : []` — le spread d'un `readonly T[]` vers un tableau mutable est uniquement justifié par l'API de `@tanstack/react-table`. Un commentaire explicatif est recommandé.

### Verdict frontend-admin : ⚠️ À corriger

Violation 1 (`id!`) est bloquante. Violation 2 doit être corrigée.

---

## Récapitulatif global

| Sévérité | Nombre | Principaux sujets |
|---|---|---|
| ❌ Bloquant sécurité | 3 | IDOR sur `getOrder` et `downloadInvoice`, `anyRequest().permitAll()` |
| ❌ Bloquant fonctionnel | 1 | Specs produit non persistées lors d'une mise à jour |
| ❌ Bloquant qualité | 5 | `Map<String,Object>` non typé, champ `active` mort, `any` implicite, `id!`, props sans `readonly` |
| ⚠️ Suggestion | 8 | Diverses améliorations de robustesse et de cohérence |

### Verdict global : ❌ À corriger avant mise en production

Les violations de sécurité (IDOR) et le bug de persistance des specs constituent des points bloquants absolus.
