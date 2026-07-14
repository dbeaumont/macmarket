# Configuration GitHub — MacMarket

Ce dossier contient toute la configuration GitHub du projet : automatisation CI/CD, gouvernance des PR, agents Copilot, sécurité des dépendances.

---

## Gouvernance

| Fichier | Rôle |
|---|---|
| `CODEOWNERS` | Définit les propriétaires de code par répertoire — revue obligatoire sur les workflows CI et `SecurityConfig` |
| `PULL_REQUEST_TEMPLATE.md` | Checklist affichée à chaque PR : type de changement, qualité (typage, tests, secrets), documentation OpenAPI si endpoint REST |
| `ISSUE_TEMPLATE/bug_report.md` | Template d'issue pour les bugs : comportement observé vs attendu, étapes de reproduction, logs |
| `ISSUE_TEMPLATE/feature_request.md` | Template d'issue pour les features : besoin métier, bounded context concerné, critères d'acceptation |

## CI/CD

| Fichier | Rôle |
|---|---|
| `workflows/ci.yml` | Pipeline CI déclenché sur chaque push et PR vers `main`/`develop` — compile et teste le backend (Java 25 / Maven) puis les deux frontends (Node 22 / Vitest / `tsc --noEmit`) |
| `dependabot.yml` | Mises à jour automatiques de sécurité chaque lundi : dépendances Maven (`/backend`), npm (`/frontend-admin`, `/frontend-shop`) et actions GitHub |

## Standards de développement

| Fichier | Rôle |
|---|---|
| `copilot-instructions.md` | Standards de développement chargés automatiquement par GitHub Copilot : typage strict TypeScript, immutabilité, architecture Angular (Signals, standalone, `inject()`), architecture DDD hexagonale Java, documentation OpenAPI obligatoire sur tous les `@RestController` |

## Agents Copilot (`agents/`)

Les agents sont invocables depuis le panneau Copilot de VS Code. Voir [`agents/README.md`](agents/README.md) pour les exemples d'invocation détaillés.

### Architecture

| Agent | Rôle |
|---|---|
| `arch-review-backend` | Audit de conformité DDD hexagonale Java : règle de dépendance, pureté du domaine, agrégats, Value Objects, interfaces Repository |
| `arch-review-frontend` | Audit de conformité Angular : SRP, `inject()`, composants standalone, Signals, désabonnement des Observables, typage strict |
| `arch-review-db` | Audit de la couche base de données : DDL, entités JPA, requêtes natives, couplage inter-contextes |
| `arch-bounded-context` | Conception d'un découpage en Bounded Contexts DDD : sous-domaines, agrégats, Domain Events, Context Mapping |

### Génération de code

| Agent | Rôle |
|---|---|
| `codegen-feature` | Squelette complet d'une feature DDD : Command/Query, Application Service, agrégat, DTO, Controller + documentation OpenAPI |
| `codegen-db-migration` | Scripts de migration Flyway/Liquibase : zero-downtime, idempotents, avec rollback documenté |

### Audit qualité

| Agent | Rôle |
|---|---|
| `audit-code` | Revue de code quotidienne : conventions de nommage, gestion des erreurs, logging, typage, immutabilité — produit un rapport dans `docs/audit/` |
| `audit-perf` | Détection des anti-patterns de performance : N+1 JPA, `EAGER` injustifié, pagination absente, re-rendus Angular inutiles |
| `audit-security` | Audit sécurité OWASP Top 10 : contrôle d'accès, injections, secrets, CORS, JWT, CVE dans les dépendances |
| `audit-techdebt` | Cartographie de la dette technique : `TODO`/`FIXME`, God classes, duplication, dépendances obsolètes — backlog priorisé |
| `audit-test-strategy` | Stratégie de tests pour un bounded context ou une feature : JUnit 5 / AssertJ (domain), TestBed / Vitest (Angular), TestContainers (infra) |
| `audit-ddl` | Audit d'un fichier DDL SQL fourni : nommage, typage, contraintes, index, procédures stockées |

### Documentation

| Agent | Rôle |
|---|---|
| `doc-adr` | Rédaction d'un ADR au format MADR en français, numéroté automatiquement dans `docs/adr/` |
| `doc-api-contract` | Documentation des contrats d'API REST à partir des `@RestController` : endpoints, paramètres, DTOs, sécurité |
| `doc-openapi` | Génération d'un fichier `openapi.yaml` complet (OpenAPI 3.0) utilisable pour la génération de clients ou un portail API |
| `doc-changelog` | Génération d'un `CHANGELOG.md` à partir de l'historique Git (Conventional Commits) |
| `doc-retro` | Rétrodocumentation complète du projet dans `docs/`, ou diagramme Mermaid ciblé (séquence, classes, Domain Events) |

### DevOps

| Agent | Rôle |
|---|---|
| `devops-cicd` | Génération de pipelines CI/CD complets : GitLab CI ou GitHub Actions, avec stages qualité, sécurité, Docker, déploiement par environnement |
| `devops-docker` | Génération et audit de `Dockerfile` multi-stage sécurisé (non-root, image épinglée, healthcheck) et `docker-compose.yml` de développement |

### Conformité

| Agent | Rôle |
|---|---|
| `compliance-gdpr` | Détection des non-conformités RGPD : PII dans les logs, données sensibles en clair, absence de durée de conservation, sur-exposition dans les DTOs |
| `compliance-license` | Audit des licences Maven et npm : incompatibilités avec la licence du projet, risques GPL/AGPL, recommandations de remplacement |

### Exploitation

| Agent | Rôle |
|---|---|
| `ops-observability` | Stratégie d'observabilité : métriques Micrometer/Prometheus, SLI/SLO, traces OpenTelemetry, logs structurés JSON, alertes Grafana |
| `ops-postmortem` | Rédaction de post-mortems blameless (5 Why, chronologie, actions correctives) dans `docs/postmortems/` |
