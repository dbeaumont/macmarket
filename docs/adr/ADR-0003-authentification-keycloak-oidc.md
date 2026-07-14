# ADR-0003 — Authentification avec Keycloak OAuth2/OIDC

## Statut

Accepté

## Contexte

MacMarket dispose de deux frontends distincts (boutique client et backoffice admin) et d'une API REST Spring Boot. Le projet requiert :

- Un système d'authentification avec 3 rôles distincts : `CUSTOMER`, `MANAGER`, `ADMIN`
- Le support des visiteurs non authentifiés pour le catalogue et le panier
- Un flux sécurisé pour les SPA Angular (Single Page Applications) sans secret côté client
- La gestion des tokens JWT pour l'API REST
- La possibilité de centraliser la gestion des comptes utilisateurs sans développer un système d'authentification custom

Les risques d'une implémentation maison sont significatifs : stockage des mots de passe, gestion des sessions, rotation des tokens, conformité OWASP A07.

## Décision

Utiliser **Keycloak 26** comme Identity Provider externalisé, avec le protocole **OAuth2/OIDC PKCE** côté frontends et la validation **JWT Bearer Token** côté API REST.

**Architecture d'authentification :**

```
Angular SPA → Authorization Request PKCE → Keycloak
         ← Authorization Code
         → Token Request (code + code_verifier)
         ← access_token JWT (RS256) + refresh_token + id_token

Angular SPA → GET /api/v1/orders (Authorization: Bearer JWT)
Spring Boot → valide JWT via JWK URI (Keycloak)
           → extrait realm_access.roles → ROLE_CUSTOMER / ROLE_MANAGER / ROLE_ADMIN
```

**Choix techniques associés :**
- Bibliothèque frontend : `angular-auth-oidc-client`
- Spring Boot : `spring-boot-starter-oauth2-resource-server` (validation JWT stateless)
- Les rôles Keycloak (`realm_access.roles`) sont convertis en `GrantedAuthority` Spring Security
- Sessions Spring stateless (`SessionCreationPolicy.STATELESS`)
- CSRF désactivé (API REST pure, pas de formulaires HTML — conforme OWASP pour ce cas d'usage)

**Modèle RBAC :**

| Route | Visiteur | CUSTOMER | MANAGER | ADMIN |
|-------|:---:|:---:|:---:|:---:|
| `GET /api/v1/products` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/orders` | ❌ | ✅ | ✅ | ✅ |
| `GET /api/v1/admin/orders` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/v1/admin/stats/*` | ❌ | ❌ | ❌ | ✅ |

## Conséquences

### Positives

- Aucun mot de passe stocké dans l'application — Keycloak gère le stockage sécurisé des credentials
- PKCE élimine le risque d'interception du code d'autorisation dans les SPA (pas de `client_secret` côté navigateur)
- JWT RS256 signé par Keycloak : l'API valide les tokens sans appel réseau (via JWK cache), ce qui garantit des performances élevées
- Gestion centralisée des utilisateurs et des rôles dans la console Keycloak
- Conformité OWASP A07 (Identification et authentification) assurée par un produit éprouvé
- Realm exporté sous `keycloak/macmarket-realm.json` : configuration reproductible, versionnée dans Git

### Négatives

- Dépendance à un service externe (Keycloak) dans le chemin critique d'authentification : si Keycloak est indisponible, les fonctionnalités authentifiées sont inaccessibles
- Complexité de configuration initiale (realm, clients OIDC, rôles, mappers JWT)
- Keycloak consomme des ressources significatives (JVM, mémoire) même en développement
- Mise à jour de Keycloak nécessite de valider la compatibilité du realm exporté

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Spring Security avec stockage custom (BCrypt + JWT maison) | Implémentation d'un système d'authentification de A à Z : risques de sécurité élevés, maintenance lourde, hors de la responsabilité du projet |
| Auth0 / Okta (SaaS) | Dépendance à un service cloud payant incompatible avec le contexte local/offline du projet (Ollama local, Mailpit local) |
| Spring Authorization Server | Solution Spring native mais moins mature que Keycloak pour la gestion des utilisateurs et la console d'administration ; plus adapté à exposer une API OAuth2 qu'à gérer une base d'identités |
| Sessions HTTP classiques | Incompatible avec une architecture SPA + API REST stateless ; ne supporte pas nativement le RBAC multi-frontend |

## Plan d'implémentation

- Le realm `macmarket` est provisionné automatiquement au démarrage via `keycloak/macmarket-realm.json`
- 4 comptes de test préconfigurés : `client@macmarket.com`, `client2@macmarket.com`, `manager@macmarket.com`, `admin@macmarket.com`
- L'URI JWK `${SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI}` est externalisée dans `application.yml`
- En environnement Docker, l'issuer URI est `http://keycloak:8180/realms/macmarket` (profil `docker`)
- En développement local, l'issuer URI est `http://localhost:8180/realms/macmarket`

## Références

- [docs/05-security.md](../05-security.md) — détail du modèle RBAC et de la configuration Spring Security
- ADR-0001 — Monolithe modulaire (contexte de déploiement)
- [ADR-0006](ADR-0006-angular-frontends.md) — Angular pour les frontends (intégration `angular-auth-oidc-client`)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth 2.0 PKCE — RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)
