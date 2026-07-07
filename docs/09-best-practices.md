# 09 — Bonnes pratiques

## Conventions de code — Backend Java

### Architecture DDD hexagonale

Chaque bounded context suit la structure `domain / application / infrastructure / presentation`. La règle de dépendance est stricte :

```
Presentation → Application → Domain ← Infrastructure
```

**Le domaine ne dépend d'aucun framework.** Aucun import Spring, JPA ou framework externe dans les packages `domain/`.

### Agrégats

- Constructeur privé + factory method statique (`Order.place(...)`, `Product.create(...)`, `Payment.initiate(...)`)
- Pas de setters publics — les modifications d'état passent par des méthodes de comportement (`markAsPaid()`, `confirm()`, `cancel()`)
- Validation des invariants dans chaque méthode de comportement avec levée d'une `DomainException`
- Méthode `pullDomainEvents()` pour collecter et vider la liste des events avant publication

### Value Objects

- Utilisation systématique de `record` Java pour l'immuabilité
- IDs fortement typés (`OrderId`, `ProductId`, `PaymentId`) — jamais `Long` ou `UUID` nus dans les signatures
- Auto-validation dans le constructeur compact

### Domain Events

- Produits par les agrégats lors de changements d'état significatifs
- Immuables (`record`), contiennent `Instant occurredOn`
- Publiés par la couche application via Spring Modulith **après** la persistence

### Application Services

- `@Transactional` uniquement dans la couche application
- Pattern : load → behavior → save → publish events
- Commands et Queries sous forme de `record` immuables

## Conventions de code — Frontend React

### Typage strict

- `strict: true` dans `tsconfig.json`
- Aucun `any` — utiliser `unknown` puis type guard
- Toutes les propriétés d'interface en `readonly`

### Immutabilité

- Jamais de mutation directe : utiliser spread `{...obj}`, `[...arr]`
- Store Zustand toujours mis à jour par spread (`set(state => ({ items: [...state.items, item] }))`)

### Séparation des responsabilités

- Composants fonctionnels — aucune logique métier
- Appels API dans des **custom hooks** (`use-orders.ts`, `use-products.ts`) via TanStack Query
- État client partagé dans des **stores Zustand** (`cart-store.ts`)

### Gestion de l'authentification

- Token OIDC géré par `react-oidc-context`
- Le token est injecté dans les requêtes via `setTokenProvider()` dans `api.ts`
- Les rôles Keycloak sont extraits du claim `realm_access.roles`

## Patterns appliqués

| Pattern | Où | Pourquoi |
|---------|-----|---------|
| DDD Hexagonal | Backend | Isolation du domaine, testabilité |
| Factory Method | Agrégats | Encapsulation de la création |
| Domain Events | Inter-modules | Découplage, cohérence éventuelle |
| Repository | Domaine → Infrastructure | Abstraction de la persistence |
| Command/Query | Application layer | Séparation lecture/écriture (CQRS light) |
| Snapshot dénormalisé | Panier / Commandes | Immuabilité historique des prix |
| Guest Token | Panier | UX — panier sans compte |
| SSE Streaming | Assistant IA | Expérience temps-réel |

## Stratégie de tests

| Niveau | Backend | Frontend |
|--------|---------|---------|
| Unitaire domaine | JUnit 5 — pur Java, sans Spring | Vitest + Testing Library |
| Unitaire store/hook | — | Vitest |
| Modulaire | Spring Modulith `verify()` | — |
| Intégration | `@SpringBootTest` + Testcontainers PostgreSQL | — |
| Sécurité | `spring-security-test` | — |

**Principe** : les tests du domaine sont des tests Java purs, sans contexte Spring, ce qui les rend rapides et fiables.

## Gestion des erreurs

### Backend

- Exceptions métier dans le domaine → héritent de `DomainException`
- `GlobalExceptionHandler` (`@ControllerAdvice`) traduit les exceptions en `ErrorResponse` structurées
- Format uniforme : `{ code, message, timestamp }`
- Logging SLF4J — jamais `System.out.println`

### Frontend

- `apiFetch()` lève une `Error` avec le message de l'API ou `API error ${status}`
- TanStack Query expose `error` dans les hooks pour affichage dans l'UI
- Sonner (toasts) pour les retours utilisateur (ajout panier, erreurs)

## Bonnes pratiques de configuration

- Toutes les configurations externalisées dans `application.yml` + variables d'environnement
- `@ConfigurationProperties` recommandé pour regrouper la config par module
- Profil `docker` pour la résolution DNS des services internes
- Fichier `.env` créé depuis `.env.template`, jamais commité

## Dette technique identifiée

| Point | Priorité | Description |
|-------|:---:|-------------|
| Scan CVE | Haute | Pas de OWASP Dependency-Check ni Trivy dans le pipeline |
| Métriques | Moyenne | Seul `/actuator/health` exposé — pas de Micrometer/Prometheus |
| Coverage | Moyenne | Pas de configuration JaCoCo ni de seuil de coverage |
| Rate limiting | Moyenne | Aucun rate limiting sur `/api/v1/assistant/chat` |
| Image Docker `latest` | Basse | `ollama/ollama:latest` non fixé en production |
| CI/CD | Haute | Aucun pipeline CI/CD automatisé détecté |
| Audit trail | Moyenne | Pas de log d'audit pour les actions sensibles |
