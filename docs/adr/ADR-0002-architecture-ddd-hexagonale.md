# ADR-0002 — Architecture DDD hexagonale (ports & adapters)

## Statut

Accepté

## Contexte

Chaque module Spring Modulith du projet encapsule un bounded context DDD. La question est : comment organiser le code à l'intérieur de chaque module pour garantir que la logique métier reste indépendante des frameworks techniques (Spring, JPA, Keycloak, Ollama, etc.) ?

Plusieurs problèmes récurrents justifient une décision explicite :

- Les annotations JPA (@Entity, @Column) et Spring (@Service, @Transactional) dans les classes de domaine introduisent un couplage fort avec l'infrastructure
- L'absence de frontières claires entre couches rend les tests unitaires difficiles (besoin de mocker toute l'infrastructure)
- La logique métier dispersée dans les contrôleurs REST devient difficile à tester et à faire évoluer
- Les règles métier (invariants des agrégats) doivent être protégées des modifications accidentelles via des setters publics

## Décision

Appliquer l'**architecture hexagonale (ports & adapters)** dans chaque module, selon la règle de dépendance stricte :

```
Presentation → Application → Domain ← Infrastructure
```

Chaque module suit cette structure de packages :

```
[module]/
├── domain/
│   ├── model/          — Agrégats, Entités, Value Objects (Java pur, aucun import framework)
│   ├── event/          — Domain Events (records immuables)
│   ├── repository/     — Interfaces de repository (ports sortants)
│   └── service/        — Domain Services (logique multi-agrégats)
├── application/
│   ├── command/        — Commands + CommandHandlers
│   ├── query/          — Queries + QueryHandlers
│   └── service/        — Application Services (@Transactional, orchestration)
├── infrastructure/
│   ├── persistence/
│   │   ├── entity/     — Entités JPA (séparées du domaine)
│   │   ├── repository/ — Spring Data JPA interfaces
│   │   └── mapper/     — Mapper domain ↔ JPA entity
│   ├── messaging/      — Publication et consommation de Domain Events
│   └── external/       — Adapters vers APIs tierces (Ollama, SMTP)
└── presentation/
    ├── rest/           — @RestController
    └── dto/            — Request/Response DTOs + Mappers
```

**Règles absolues :**
- Aucun import Spring, JPA ou framework dans le package `domain/`
- Les IDs sont des Value Objects fortement typés (`OrderId`, `ProductId`), jamais des `Long` ou `String` nus
- Les agrégats n'ont pas de setters publics — modification d'état uniquement via des méthodes de comportement
- `@Transactional` uniquement dans la couche application
- Les entités JPA sont séparées des entités du domaine avec un mapper explicite

## Conséquences

### Positives

- Le domaine est du Java pur : testable sans Spring context, sans base de données
- Les invariants métier sont centralisés dans les agrégats et protégés par des factory methods
- L'infrastructure peut être remplacée (ex : changer de base de données) sans modifier le domaine
- Les Domain Events sont produits par le domaine et publiés par la couche application après persistence
- La séparation command/query prépare une migration vers CQRS complet si nécessaire

### Négatives

- Verbosité : chaque concept métier nécessite plusieurs classes (agrégat, Value Objects, entité JPA, mapper, DTO)
- Courbe d'apprentissage pour les développeurs habitués à des architectures en couches simples (MVC)
- Le mapping domaine ↔ JPA ↔ DTO est du code de boilerplate à maintenir
- Risk de sur-ingénierie pour des modules simples avec peu de règles métier (ex. `notification`)

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Architecture MVC en couches (Controller → Service → Repository) | Pas de frontière entre logique métier et infrastructure ; les entités JPA deviennent les entités du domaine, ce qui couple le schéma de base de données au modèle métier |
| CQRS + Event Sourcing | Complexité très élevée ; reconstruction d'état depuis les événements inadaptée à la taille du projet ; pas de besoin de replay d'audit complet identifié |
| Architecture anémique (services procéduraux sur des DTOs) | La logique métier fuit dans les services applicatifs ; les invariants des agrégats ne sont pas garantis |

## Plan d'implémentation

- Les constructeurs des agrégats sont privés ; la création passe par des `factory methods` statiques
- Les Value Objects utilisent les `record` Java pour l'immuabilité et l'égalité par valeur
- `DomainException` est la classe de base pour toutes les exceptions métier ; elle est dans le domaine
- Les `DomainEvent` sont collectés par la racine d'agrégat via `pullDomainEvents()` et publiés après `save()` dans l'Application Service
- Un `@ControllerAdvice` global traduit les `DomainException` en réponses HTTP 422 structurées

## Références

- [docs/02-architecture.md](../02-architecture.md) — diagramme des couches
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — vue d'ensemble du projet
- ADR-0001 — Monolithe modulaire avec Spring Modulith (organisation des modules)
- ADR-0004 — PostgreSQL (séparation entités JPA / entités domaine)
- [Hexagonal Architecture — Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
