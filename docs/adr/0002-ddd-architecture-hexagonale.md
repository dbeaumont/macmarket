# ADR-0002 — DDD et architecture hexagonale par module

## Statut

Accepte

## Contexte

Chaque module Spring Modulith a besoin d'une organisation interne claire. Le risque principal d'un monolithe est le couplage progressif entre les couches techniques.

## Decision

Adopter une architecture **hexagonale (ports & adapters)** structuree par les principes **DDD** a l'interieur de chaque bounded context :

```
[module]/
├── domain/           Java pur, 0 dependance framework
│   ├── model/        Agregats, Value Objects, enums
│   ├── event/        Domain Events (records immuables)
│   └── repository/   Interfaces (ports sortants)
├── application/      Orchestration, @Transactional
│   ├── command/      Commands (records immuables)
│   └── service/      Application Services, ports
├── infrastructure/   Implementations techniques
│   ├── persistence/  JPA entities + mapper + Spring Data
│   └── messaging/    Event listeners
└── presentation/     API REST
    ├── rest/         Controllers
    └── dto/          Request/Response DTOs + mappers
```

### Regles structurantes
- La couche `domain` est du Java pur : aucun import Spring, JPA ou framework
- Les entites JPA sont **separees** des entites du domaine, avec un mapper explicite
- `@Transactional` est pose uniquement dans la couche `application`
- Les controllers n'importent que la couche application (commands, services), jamais le domaine directement
- Les IDs sont des Value Objects types (`ProductId`, `OrderId`), jamais des `UUID` nus
- Les references vers d'autres bounded contexts utilisent des types locaux (`OrderReference`, `ProductReference`)

## Consequences

### Positives
- Le domaine est testable unitairement sans Spring (`new Product(...)`, pas de mock)
- Les changements d'infrastructure (migration JPA → jOOQ, changement de broker) n'impactent pas le domaine
- Les invariants metier sont garantis par les agregats (pas de setters publics)

### Negatives
- Duplication apparente : entite JPA + entite domaine + mapper pour chaque agregat
- Courbe d'apprentissage plus raide pour les nouveaux developpeurs
- Les modules simples (user) ont peu de domaine mais suivent quand meme la structure
