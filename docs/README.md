# Documentation MacMarket

> Générée le 2026-07-07 par analyse statique du code source.

---

## Index de la documentation

| # | Fichier | Description |
|---|---------|-------------|
| 01 | [Vue d'ensemble](01-overview.md) | Présentation, stack, points d'entrée |
| 02 | [Architecture](02-architecture.md) | Couches, modules, patterns, flux |
| 03 | [Fonctionnel](03-functional.md) | Cas d'usage, entités, workflows |
| 04 | [Technique](04-technical.md) | Stack détaillée, endpoints REST, config |
| 05 | [Sécurité](05-security.md) | Auth, RBAC, OWASP, secrets |
| 06 | [Packaging](06-packaging.md) | Docker, build, artefacts |
| 07 | [CI/CD](07-ci-cd.md) | Tests, pipeline, Makefile |
| 08 | [Modèle de données](08-data-model.md) | Tables, relations, migrations Flyway |
| 09 | [Bonnes pratiques](09-best-practices.md) | Conventions, patterns, recommandations |
| D | [Index des diagrammes](diagrams/DIAGRAMS.md) | Tous les diagrammes Mermaid |

---

## Guides rapides par persona

### 👨‍💻 Développeur — par où commencer ?

1. Lire [01-overview.md](01-overview.md) pour comprendre le projet
2. Lire [02-architecture.md](02-architecture.md) pour les modules et leurs dépendances
3. Lire [04-technical.md](04-technical.md) pour les endpoints REST et la configuration
4. Lancer la stack localement : `make up` depuis la racine du projet

### 🏗️ Architecte

1. [02-architecture.md](02-architecture.md) — structure modulaire et dépendances inter-modules
2. [05-security.md](05-security.md) — sécurité et RBAC
3. [08-data-model.md](08-data-model.md) — modèle de données complet
4. [diagrams/DIAGRAMS.md](diagrams/DIAGRAMS.md) — diagrammes de classes et séquences

### 🚢 DevOps

1. [06-packaging.md](06-packaging.md) — Dockerfiles, compose, healthchecks
2. [07-ci-cd.md](07-ci-cd.md) — tests et pipeline
3. [04-technical.md](04-technical.md) — ports, variables d'environnement

### 🔐 Sécurité

1. [05-security.md](05-security.md) — mécanismes d'auth, RBAC, OWASP Top 10
2. [02-architecture.md](02-architecture.md) — classification DICP

---

## Métadonnées

| Champ | Valeur |
|-------|--------|
| Version de la documentation | 1.0 |
| Date d'analyse | 2026-07-07 |
| Méthode | Analyse statique du code source |
| Backend | Spring Boot 4.1.0 / Java 25 |
| Frontend | React 19 / TypeScript 5.9 |
| Outil de génération | GitHub Copilot (mode retrodoc) |
