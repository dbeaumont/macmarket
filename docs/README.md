# Documentation — MacMarket

## Architecture

- [ARCHITECTURE.md](../ARCHITECTURE.md) — Vue d'ensemble, diagrammes, stack technique, modele de donnees, flux metier, securite

## ADR (Architecture Decision Records)

| # | Decision | Statut |
|---|----------|--------|
| [0001](adr/0001-monolithe-modulaire-spring-modulith.md) | Monolithe modulaire avec Spring Modulith | Accepte |
| [0002](adr/0002-ddd-architecture-hexagonale.md) | DDD et architecture hexagonale par module | Accepte |
| [0003](adr/0003-keycloak-authentification-oidc.md) | Keycloak pour l'authentification OAuth2/OIDC | Accepte |
| [0004](adr/0004-communication-inter-modules-events.md) | Communication inter-modules par Domain Events | Accepte |
| [0005](adr/0005-assistant-ia-ollama-mistral.md) | Assistant IA avec Ollama et Mistral 7B | Accepte |
| [0006](adr/0006-deux-frontends-react-separes.md) | Deux applications React separees | Accepte |
| [0007](adr/0007-paiement-simule.md) | Paiement simule (90% de succes) | Accepte |
| [0008](adr/0008-entites-jpa-read-only-module-admin.md) | Entites JPA read-only pour le module admin | Accepte |

## Conventions

- [CLAUDE.md](../CLAUDE.md) — Regles de developpement (TypeScript strict, DDD Java, nommage, immutabilite)
