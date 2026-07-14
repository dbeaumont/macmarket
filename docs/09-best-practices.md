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

## Conventions de code — Frontend Angular

### Typage strict

- `strict: true` dans `tsconfig.json` (+ `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`)
- Aucun `any` — utiliser `unknown` puis type guard
- Toutes les propriétés d'interface en `readonly` (voir `core/models/*.ts`)

### Immutabilité

- Jamais de mutation directe : utiliser spread `{...obj}`, `[...arr]`
- État réactif mis à jour via `signal.update()` avec de nouveaux tableaux/objets (`[...prev.slice(0, -1), ...]`), jamais de `push`/`splice`/`sort` en place

### Séparation des responsabilités

- Composants standalone, fonctionnels — aucune logique métier dans le template ou la classe de présentation
- Composants standalone (pas de `NgModule`), `inject()` plutôt que l'injection par constructeur
- Appels API et logique métier isolés dans des **services injectables** (`providedIn: 'root'`), état exposé via **Angular Signals** (`signal`/`computed`/`asReadonly()`) — ex. `cart.service.ts`, `chat.service.ts`
- Composants réutilisables dans `shared/components/`, pages lazy-loadées dans `features/`

### Gestion de l'authentification

- Token OIDC géré par `angular-auth-oidc-client`
- Guards `CanActivateFn` (`auth.guard.ts`, `admin.guard.ts`) protègent les routes selon le rôle
- Les rôles Keycloak sont extraits du claim `realm_access.roles`

> **Point de vigilance identifié en revue** : plusieurs `.subscribe()` manuels ne sont pas nettoyés via `takeUntilDestroyed()` (et le pipe `async` n'est utilisé nulle part dans les deux projets) — voir [Dette technique identifiée](#dette-technique-identifiée).

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
| Unitaire domaine | JUnit 5 — pur Java, sans Spring | Vitest (`*.spec.ts`, builder `@angular/build`) |
| Unitaire composant/service | — | Vitest |
| Modulaire | Spring Modulith `verify()` | — |
| Intégration | `@SpringBootTest` + Testcontainers PostgreSQL | — |
| Sécurité | `spring-security-test` | — |
| Vérification de types | — | `tsc --noEmit` (étape CI dédiée) |

**Principe** : les tests du domaine sont des tests Java purs, sans contexte Spring, ce qui les rend rapides et fiables.

## Gestion des erreurs

### Backend

- Exceptions métier dans le domaine → héritent de `DomainException`
- `GlobalExceptionHandler` (`@ControllerAdvice`) traduit les exceptions en `ErrorResponse` structurées
- Format uniforme : `{ code, message, timestamp }`
- Logging SLF4J — jamais `System.out.println`

### Frontend

- Les services HTTP lèvent une erreur exploitée par les composants appelants pour affichage dans l'UI
- Angular Material (`MatSnackBar`) pour les retours utilisateur (ajout panier, erreurs)
- ⚠️ Plusieurs blocs `catch` avalent silencieusement l'erreur sans typage `unknown` ni log (ex. `cart.service.ts`, `chat.service.ts` — commentaires `// Ignore ... errors` sans traitement) : à corriger, contraire à la règle « pas de try/catch vides »

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
| Coverage | Moyenne | Pas de configuration JaCoCo ni de seuil de coverage, ni de coverage frontend |
| Rate limiting | Moyenne | Aucun rate limiting sur `/api/v1/assistant/chat` |
| Image Docker `latest` | Basse | `ollama/ollama:latest` non fixé en production |
| CI/CD — CD manquant | Moyenne | `ci.yml` couvre build+tests mais ne construit pas les images Docker et n'exécute aucun déploiement |
| CI/CD — Lint absent | Basse | Aucune étape ESLint dans `ci.yml` |
| Audit trail | Moyenne | Pas de log d'audit pour les actions sensibles |
| Cart — encapsulation | Moyenne | `Cart.getItems()` expose l'entité interne mutable `CartItem` hors de l'agrégat (lue directement par `CartResponseMapper`) |
| Cart — ID faible | Basse | `Cart`/`CartRepository` utilisent `String userId` au lieu du VO `UserId` (incohérent avec `order`/`user`) |
| Domain Events manquants | Basse | `user` (ShippingProfile) ne publie aucun Domain Event ; `StockInsufficientEvent` (catalog) n'est jamais publié |
| Presentation → Domain | Moyenne | 4 contexts (`cart`, `catalog`, `order`, `payment`) retournent l'agrégat du domaine depuis les Application Services, mappé en DTO dans un mapper de présentation qui importe directement le domaine |
| Frontend — cleanup Observable | Moyenne | `takeUntilDestroyed()` / pipe `async` non généralisés — plusieurs `.subscribe()` sans nettoyage dans les deux frontends |
| Frontend — catch silencieux | Basse | Quelques `catch` sans typage `unknown` ni log (`cart.service.ts`, `chat.service.ts`) |
| Frontend — état non-signal | Basse | Champs de filtre/pagination mutables (`search = ''`, `page = 0`) au lieu de `signal()`, incohérent avec le reste des composants |
