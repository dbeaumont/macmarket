# Agents GitHub Copilot — Guide de référence

Ce document décrit le rôle de chaque agent disponible dans `.github/agents` et fournit un exemple d'invocation pour chacun.

> **Comment invoquer un agent** : dans le panneau Copilot (VS Code), déplier le menu **Agent / Ask / Plan**, sélectionner l'agent souhaité, puis saisir le prompt.

---

## Sommaire

| Agent | Catégorie | Rôle résumé |
|---|---|---|
| [doc-adr](#adr-generator) | Documentation | Rédiger un ADR au format MADR |
| [doc-api-contract](#api-contract-documenter) | Documentation | Documenter les contrats d'API REST |
| [doc-changelog](#changelog-writer) | Documentation | Générer un CHANGELOG depuis les commits Git |
| [doc-openapi](#openapi-spec-generator) | Documentation | Génération de spécification OpenAPI 3.0 |
| [doc-retro](#retrodoc) | Documentation | Rétrodocumentation complète ou diagramme ciblé |
| [codegen-feature](#feature-scaffolder) | Génération de code | Squelette de code pour une feature DDD |
| [codegen-db-migration](#db-migration-generator) | Génération de code | Génération de scripts Flyway / Liquibase |
| [arch-review-backend](#architecture-reviewer-backend) | Audit d'architecture | Audit de conformité DDD hexagonale (Java) |
| [arch-review-frontend](#architecture-reviewer-frontend) | Audit d'architecture | Audit de conformité architecturale Angular |
| [arch-review-db](#architecture-reviewer-database) | Audit d'architecture | Audit de conformité de la couche base de données (DDL, procédures, sécurité) |
| [arch-bounded-context](#bounded-context-designer) | Audit d'architecture | Conception d'un découpage en Bounded Contexts |
| [audit-code](#code-reviewer) | Audit qualité | Revue de code qualité (naming, erreurs, anti-patterns) |
| [audit-perf](#performance-reviewer) | Audit qualité | Détection des anti-patterns de performance |
| [audit-security](#security-auditor) | Audit sécurité | Audit de sécurité OWASP Top 10 |
| [audit-techdebt](#technical-debt-mapper) | Audit qualité | Cartographie et priorisation de la dette technique |
| [audit-test-strategy](#test-strategy-advisor) | Audit qualité | Stratégie de tests pour un module ou une feature (JUnit 5, TestBed/Vitest Angular, TestContainers) |
| [audit-ddl](#ddl-auditor) | Audit données | Audit d’un fichier DDL SQL fourni |
| [devops-cicd](#cicd-pipeline-generator) | DevOps | Génération de pipelines GitLab CI / GitHub Actions |
| [devops-docker](#dockerfile-advisor) | DevOps | Génération et audit de Dockerfiles optimisés |
| [compliance-gdpr](#gdpr-compliance-reviewer) | Conformité | Détection des non-conformités RGPD |
| [compliance-license](#license-checker) | Conformité | Audit des licences des dépendances |
| [ops-postmortem](#incident-post-mortem-writer) | Exploitation | Rédaction de post-mortems structurés |
| [ops-observability](#observability-advisor) | Exploitation | Stratégie métriques, traces, logs, alertes |

---

## Documentation

### doc-adr

**Rôle** : Rédige des ADRs (Architecture Decision Records) au format MADR, en français. Détermine automatiquement le prochain numéro disponible en lisant `docs/adr/`, crée le fichier avec les sections Contexte, Décision, Conséquences, Alternatives considérées, Plan d'implémentation et Références.

**Quand l'utiliser** : dès qu'une décision technique structurante est prise et doit être documentée (choix de framework, stratégie d'authentification, format d'API, approche de cache…).

**Exemple d'invocation** :
```
Génère un ADR pour le choix de Redis comme solution de cache distribué.
Le contexte : les sessions utilisateurs doivent survivre au redémarrage des pods.
L'alternative principale était un cache in-memory (Caffeine).
```

---

### doc-api-contract

**Rôle** : Analyse les `@RestController` Spring Boot d'un module et génère une documentation de contrat d'API structurée : endpoints, méthodes HTTP, paramètres, body, codes de retour, DTOs et règles de sécurité (`@PreAuthorize`).

**Quand l'utiliser** : pour documenter les routes exposées par un module avant une mise en production ou une intégration avec un client front/tiers.

**Exemple d'invocation** :
```
Documente le contrat d'API du module order (OrderController).
```

---

### doc-changelog

**Rôle** : Analyse l'historique Git et génère un CHANGELOG structuré en sections (`feat`, `fix`, `refactor`, `chore`…) selon la convention Conventional Commits. Produit un fichier `CHANGELOG.md` lisible par des humains.

**Quand l'utiliser** : à chaque release ou sprint, pour produire les notes de version.

**Exemple d'invocation** :
```
Génère le CHANGELOG des 50 derniers commits.
```

```
Génère le CHANGELOG entre le tag v1.2.0 et HEAD.
```

---

### doc-retro

**Rôle** : Deux modes d'utilisation —

1. **Rétrodocumentation complète** : analyse le codebase et produit une documentation exhaustive dans `docs/` (overview, architecture, fonctionnel, technique, sécurité, packaging, CI/CD, modèle de données, bonnes pratiques) avec des diagrammes Mermaid.
2. **Diagramme ciblé** : génère un unique diagramme Mermaid pour un flux, un bounded context ou des domain events spécifiques, sans produire la documentation globale.

**Quand l'utiliser** :
- Mode complet : première documentation d'un projet existant, mise à jour après une refonte.
- Mode diagramme : illustrer un cas d'usage précis, documenter les agrégats d'un module, cartographier les events inter-domaines.

**Exemples d'invocation** :
```
Génère la documentation complète du projet et positionne les résultats dans docs/.
```

```
Génère un diagramme de séquence pour le flux de confirmation de commande dans le module order.
```

```
Génère un diagramme de classes pour les agrégats et Value Objects du module payment.
```

```
Génère un diagramme des Domain Events qui traversent les frontières de bounded contexts.
```

---

## Architecture

### arch-review-backend

**Rôle** : Audite la conformité architecturale DDD hexagonale du code Java Spring Boot : règle de dépendance (Domain ← Infrastructure), pureté du domaine (absence d'imports Spring/JPA), agrégats (factory methods, comportements, invariants), Value Objects immuables, interfaces Repository dans le domaine.

**Quand l'utiliser** : lors d'une PR ajoutant un nouveau module ou bounded context, ou pour auditer un module existant. **Ne pas utiliser pour une revue de qualité générale → Code Reviewer.**

**Exemple d'invocation** :
```
Vérifie la conformité architecturale DDD du module order (backend/src/main/java/order/).
```

```
Audite la PR : est-ce que la couche domain reste pure dans le module catalog ?
```

---

### arch-review-frontend

**Rôle** : Audite la conformité architecturale Angular/TypeScript : séparation des responsabilités (composant = affichage uniquement), services et injection de dépendances (`inject()`), composants standalone, gestion de l'état réactif (Signals vs BehaviorSubject), désabonnement des Observables, typage TypeScript strict.

**Quand l'utiliser** : lors d'une PR ajoutant un nouveau composant ou service Angular. **Ne pas utiliser pour une revue de qualité générale → Code Reviewer.**

**Exemple d'invocation** :
```
Vérifie la conformité architecturale Angular du composant OrderListComponent et son service associé.
```

---

### arch-bounded-context

**Rôle** : Analyse une description fonctionnelle ou métier et propose un découpage en Bounded Contexts DDD cohérent : identification des sous-domaines (Core/Supporting/Generic), définition des agrégats et racines, identification des Domain Events, proposition de Context Mapping (Shared Kernel, Customer/Supplier, ACL…).

**Quand l'utiliser** : en phase de conception, avant de créer un nouveau module, ou pour remettre en question le découpage existant.

**Exemple d'invocation** :
```
Je veux ajouter la gestion des retours produits (RMA).
Propose un découpage en bounded contexts et identifie les domain events avec les contextes existants (order, catalog, payment).
```

---

### codegen-feature

**Rôle** : Génère le squelette de code complet d'une feature DDD hexagonale : Command/Query, Application Service, interface Repository, entité/agrégat, DTO de présentation, Controller Spring Boot. Respecte les conventions de nommage et la structure des packages du projet.

**Quand l'utiliser** : pour démarrer l'implémentation d'un nouveau cas d'usage sans partir d'une feuille blanche.

**Exemple d'invocation** :
```
Génère le squelette de la feature "annuler une commande" dans le module order.
```

```
Génère le squelette de la feature "ajouter un produit au catalogue" dans le module catalog.
```

---

## Qualité

### audit-code

**Rôle** : Effectue une revue de code orientée qualité quotidienne : conventions de nommage (Java PascalCase/suffixes, Angular kebab-case), gestion des erreurs (try/catch typés, pas de catch vides), logging (SLF4J, pas de `System.out.println`), typage TypeScript strict (`unknown` vs `any`, readonly), immutabilité des tableaux et objets.

**Quand l'utiliser** : pour toute PR ou fichier isolé, en complément de la CI. **Pour un audit architectural → Architecture Reviewer Backend/Frontend.**

**Exemple d'invocation** :
```
Effectue une revue de code sur src/app/features/order/order-list.component.ts.
```

```
Revue de code sur backend/src/main/java/order/application/ConfirmOrderService.java.
```

---

### audit-security

**Rôle** : Audite le code selon l'OWASP Top 10 : contrôle d'accès (`@PreAuthorize`, rôles), échecs cryptographiques (secrets en dur, HTTP non sécurisé), injections (JPQL/SQL par concaténation), mauvaise configuration (CORS `*`, Actuator exposé, `permitAll()`), authentification JWT, journalisation insuffisante, et inventaire des dépendances vulnérables (CVE dans `pom.xml`/`package.json`).

**Quand l'utiliser** : avant une mise en production, lors d'un audit sécurité, ou après l'ajout de nouveaux endpoints exposés.

**Exemple d'invocation** :
```
Audite la sécurité des controllers REST du module order selon OWASP Top 10.
```

```
Vérifie s'il y a des secrets exposés ou des CVE dans les dépendances du projet.
```

---

### audit-test-strategy

**Rôle** : Propose une stratégie de tests complète et pragmatique pour un bounded context ou une feature : pyramide de tests (unitaires domaine, intégration `@WebMvcTest`/`@SpringBootTest`/TestContainers, E2E), choix des outils (JUnit, Mockito, Vitest, React Testing Library, TanStack Query mock), exemples de cas de test à couvrir.

**Quand l'utiliser** : en début d'implémentation d'une feature pour définir la couverture de tests, ou pour auditer la stratégie de tests d'un module existant.

**Exemple d'invocation** :
```
Propose une stratégie de tests pour la feature "confirmer une commande" dans le module order.
```

```
Audite la couverture de tests du module catalog et propose les tests manquants.
```

```
Propose une stratégie de tests pour le composant ProductListComponent : TestBed, HttpTestingController, cas limites.
```

---

### audit-perf

**Rôle** : Détecte les anti-patterns de performance dans le code Java/Spring Boot (requêtes N+1, chargements `EAGER` non justifiés, pagination absente, boucles avec appels BDD/HTTP, transactions trop larges) et Angular/TypeScript (`ChangeDetectionStrategy.Default`, Observables non partagés, fonctions dans les templates). Produit un rapport priorisé avec corrections concrètes.

**Quand l'utiliser** : lors d'une PR introduisant de nouvelles requêtes JPA ou de nouveaux composants Angular, ou pour auditer un module en cas de dégradation de performance constatée.

**Exemple d'invocation** :
```
Analyse les performances du module order : détecte les requêtes N+1 et les problèmes de pagination.
```

```
Audite les performances du composant ProductListComponent : re-rendus inutiles, Observables non optimisés.
```

---

### audit-techdebt

**Rôle** : Cartographie la dette technique d'un projet en analysant les marqueurs explicites (`TODO`, `FIXME`, `HACK`), les anti-patterns structurels (God classes, couplage fort, duplication), la couverture de tests, et les dépendances obsolètes. Produit un backlog de remédiation priorisé avec estimation d'effort.

**Quand l'utiliser** : avant une session de refactoring, pour préparer un chiffrage de dette à présenter à la direction, ou en début de projet sur du code legacy.

**Exemple d'invocation** :
```
Cartographie la dette technique du backend et produis un backlog priorisé.
```

```
Estime la dette technique du module order uniquement, avec un focus sur les tests manquants.
```

---

## DevOps

### devops-cicd

**Rôle** : Analyse le projet (technologies, modules, outils qualité) et génère un pipeline CI/CD complet adapté : stages validate, test, quality (SonarQube), security (OWASP), build, Docker, déploiement par environnement (dev/UAT/prod) avec protections sur les déploiements production. Supporte GitLab CI (`.gitlab-ci.yml`) et GitHub Actions.

**Quand l'utiliser** : à la création d'un nouveau projet forké, ou pour mettre à niveau un pipeline existant incomplet.

**Exemple d'invocation** :
```
Génère un pipeline GitLab CI pour ce projet Spring Boot + Angular avec Docker et déploiement ArgoCD.
```

```
Génère un workflow GitHub Actions avec build Maven, tests, SonarQube et push Docker sur ghcr.io.
```

---

### devops-docker

**Rôle** : Génère un `Dockerfile` multi-stage optimisé et sécurisé (utilisateur non-root, image base épinglée, healthcheck, layer caching), ou audite un `Dockerfile` existant pour détecter les problèmes de sécurité (secrets dans l'image, `root`, `latest`) et d'optimisation (build non multi-stage, cache invalidé). Génère aussi un `docker-compose.yml` de développement local.

**Quand l'utiliser** : à la containerisation initiale d'un service, ou lors d'un audit sécurité des images.

**Exemple d'invocation** :
```
Génère un Dockerfile multi-stage optimisé pour ce projet Spring Boot (JDK 21).
```

```
Audite le Dockerfile existant et corrige les problèmes de sécurité et d'optimisation.
```

---

## Données

### audit-ddl

**Rôle** : Audite un fichier DDL SQL fourni explicitement. Commence par demander le chemin du fichier si absent. Lit le DDL en intégralité, extrait les principes des documents d’architecture transmis (PDF, ADC, ADR…) et les transforme en contrôles supplémentaires. Vérifie nommage, typage, intégrité référentielle, normalisation, index, règles sur les procédures stockées (périmètre technique, documentation en-tête, gestion des erreurs, pas de valeurs métier en dur, portabilité SQL), séparation métier/persistance et sécurité. Produit un rapport complet dans `_audit/`.

**Quand l’utiliser** : quand un fichier DDL SQL est disponible directement (script de création, export de schéma, fichier de migration complet). Pour un projet sans DDL explicité → **Architecture Reviewer Database**.

**Exemple d’invocation** :
```
Voici le DDL de notre base PostgreSQL partagée entre microservices : @ddl_prod.sql
Effectue un audit complet.
```

```
Audite le fichier db/schema.sql selon les bonnes pratiques SQL et nos règles
sur les procédures stockées (périmètre technique uniquement, pas de dialecte
PostgreSQL spécifique).
```

---

### arch-review-db

**Rôle** : Audite la couche base de données d'un projet à partir de l'ensemble des artefacts disponibles : DDL SQL si fourni, ou découverte automatique dans le projet (scripts Flyway/Liquibase, entités JPA, `@Query` natives, `@Procedure`, configuration `datasource`). Vérifie le respect des principes d'architecture fournis et des bonnes pratiques du marché : nommage, typage, intégrité référentielle, normalisation, index, périmètre technique des procédures, gestion des erreurs, absence de valeurs métier en dur, portabilité SQL, séparation logique métier/persistance, couplage inter-microservices. Produit un rapport d'audit complet et honnête dans `docs/audit/`.

**Quand l’utiliser** : lors d’un audit qualité, avant une mise en production majeure, en réponse à des problèmes de performance ou de maintenabilité sur la base, ou pour évaluer la conformité d’un schéma legacy à des principes d’architecture définis.

**Exemple d’invocation** :
```
Ce projet est une application composée de microservices Java qui s’appuie sur une base de données PostgreSQL unique et partagée.
Effectue un audit complet.
```

```
Audite le DDL joint selon les bonnes pratiques PostgreSQL et nos règles sur les procédures stockées :
elles doivent être purement techniques (pas de logique métier), correctement documentées et ne pas utiliser de dialecte PostgreSQL spécifique.
```

---

### codegen-db-migration

**Rôle** : Génère des scripts de migration Flyway ou Liquibase à partir d'une description de changement de schéma ou en comparant avec les entités JPA existantes. Applique les bonnes pratiques : nommage séquentiel, zero-downtime deployment (nouvelles colonnes avec DEFAULT, index `CONCURRENTLY`), scripts idempotents et rollback documenté.

**Quand l'utiliser** : avant chaque déploiement modifiant le schéma de base de données.

**Exemple d'invocation** :
```
Génère le script Flyway pour ajouter une colonne 'email_verified' (boolean, NOT NULL, default false) à la table 'users'.
```

```
Génère les migrations nécessaires pour renommer la table 'order' en 'purchase_order' sans interruption de service.
```

---

## Documentation

### doc-openapi

**Rôle** : Génère un fichier `openapi.yaml` (OpenAPI 3.0) complet à partir des `@RestController` Spring Boot : endpoints, paramètres, corps de requête/réponse, schémas de DTOs avec contraintes Bean Validation, codes HTTP, exemples et configuration de sécurité OAuth2. Utilisable pour la génération de clients TypeScript/Python, les tests de contrat (Pact) et les portails API.

**Quand l'utiliser** : avant une intégration avec un client front ou un service tiers, ou pour alimenter un portail API (Apigee, Kong, Azure APIM).

**Exemple d'invocation** :
```
Génère le fichier openapi.yaml complet pour le module order.
```

```
Mets à jour l'openapi.yaml existant avec les nouveaux endpoints du module payment.
```

---

## Conformité

### compliance-gdpr

**Rôle** : Analyse le code pour détecter les non-conformités RGPD : données personnelles (PII) dans les logs, stockage de données sensibles en clair, absence de durée de conservation, sur-exposition dans les DTOs de réponse, données personnelles dans les URLs, absence de mécanisme de droit à l'effacement. Produit un rapport structuré par article RGPD.

**Quand l'utiliser** : avant la mise en production d'une feature traitant des données personnelles, ou lors d'un audit de conformité CNIL.

**Exemple d'invocation** :
```
Analyse la conformité RGPD du module user : logs, entités JPA, DTOs et endpoints.
```

```
Vérifie que le module order ne logue pas de données personnelles et que les durées de conservation sont définies.
```

---

### compliance-license

**Rôle** : Analyse les licences des dépendances Maven (`pom.xml`) et npm (`package.json`) et détecte les incompatibilités avec la licence du projet (ex : dépendance GPL dans un projet propriétaire). Produit un rapport classé par niveau de risque (critique, vigilance, conforme) avec recommandations de remplacement.

**Quand l'utiliser** : avant une mise en production majeure, lors d'un audit de conformité, ou à l'ajout d'une nouvelle dépendance de licence inconnue.

**Exemple d'invocation** :
```
Vérifie la compatibilité des licences de toutes les dépendances avec la licence propriétaire du projet.
```

```
Analyse les licences des dépendances npm du frontend et signale tout risque GPL ou AGPL.
```

---

## Exploitation

### ops-observability

**Rôle** : Propose une stratégie d'observabilité complète pour un service : métriques techniques (Micrometer/Prometheus) et métier, SLI/SLO mesurables, points de trace OpenTelemetry à ajouter manuellement, configuration des logs structurés (JSON + MDC), et alertes Grafana prioritaires (taux d'erreur, latence P99, pool BDD, mémoire JVM).

**Quand l'utiliser** : lors de la mise en production d'un nouveau service, ou quand un service manque de visibilité en production (alertes insuffisantes, logs non corrélés).

**Exemple d'invocation** :
```
Propose une stratégie d'observabilité complète pour le module order : métriques métier, SLO et alertes.
```

```
Identifie les métriques Micrometer manquantes dans le service de paiement et propose les alertes Grafana associées.
```

---

### ops-postmortem

**Rôle** : Rédige un post-mortem structuré et blameless à partir de la description d'un incident : résumé exécutif, chronologie horodatée, analyse causes racines (méthode 5 Why), ce qui a bien/mal fonctionné, et tableau d'actions correctives avec responsables et échéances. Crée le fichier dans `docs/postmortems/`.

**Quand l'utiliser** : dans les 24-48h suivant la résolution d'un incident de production, dans une démarche SRE / amélioration continue.

**Exemple d'invocation** :
```
Rédige le post-mortem de la panne API paiement du 05/07 : timeout base de données de 14h à 16h, 500 utilisateurs impactés, rollback effectué à 15h45.
```

```
Rédige un post-mortem pour l'incident de déploiement raté du 03/07 : mauvaise migration Flyway, rollback en 20 minutes, aucun impact utilisateur final.
```
