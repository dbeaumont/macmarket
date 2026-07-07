# Architecture Decision Records — MacMarket

Ce répertoire contient les ADRs (Architecture Decision Records) du projet MacMarket, au format MADR.

## Liste des décisions

| ADR | Titre | Statut |
|-----|-------|--------|
| [ADR-0001](ADR-0001-monolithe-modulaire-spring-modulith.md) | Monolithe modulaire avec Spring Modulith | Accepté |
| [ADR-0002](ADR-0002-architecture-ddd-hexagonale.md) | Architecture DDD hexagonale (ports & adapters) | Accepté |
| [ADR-0003](ADR-0003-authentification-keycloak-oidc.md) | Authentification avec Keycloak OAuth2/OIDC | Accepté |
| [ADR-0004](ADR-0004-postgresql-base-de-donnees.md) | PostgreSQL comme base de données principale | Accepté |
| [ADR-0005](ADR-0005-assistant-ia-ollama-local.md) | Assistant IA avec Ollama et modèle local (qwen2.5:3b) | Accepté |
| [ADR-0006](ADR-0006-react-frontends.md) | React pour les frontends | Accepté |
| [ADR-0007](ADR-0007-paiement-simule.md) | Paiement simulé | Accepté |
| [ADR-0008](ADR-0008-deux-frontends-separes.md) | Deux frontends React séparés (boutique et backoffice) | Accepté |

## Conventions

- Format : [MADR](https://adr.github.io/madr/)
- Langue : français
- Nommage : `ADR-NNNN-titre-en-kebab-case.md`
- Statuts possibles : `Proposé` | `Accepté` | `Déprécié` | `Remplacé par ADR-NNNN`

## Relations entre ADRs

```mermaid
graph TD
    ADR001["ADR-0001\nMonolithe modulaire\nSpring Modulith"]
    ADR002["ADR-0002\nArchitecture DDD\nhexagonale"]
    ADR003["ADR-0003\nAuthentification\nKeycloak OIDC"]
    ADR004["ADR-0004\nPostgreSQL"]
    ADR005["ADR-0005\nAssistant IA\nOllama local"]
    ADR006["ADR-0006\nReact frontends"]
    ADR007["ADR-0007\nPaiement simulé"]
    ADR008["ADR-0008\nDeux frontends\nséparés"]

    ADR001 --> ADR002
    ADR001 --> ADR004
    ADR001 --> ADR007
    ADR002 --> ADR004
    ADR003 --> ADR006
    ADR003 --> ADR008
    ADR006 --> ADR008
    ADR005 --> ADR001
```
