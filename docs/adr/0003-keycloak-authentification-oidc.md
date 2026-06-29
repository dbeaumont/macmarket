# ADR-0003 — Keycloak pour l'authentification OAuth2/OIDC

## Statut

Accepte

## Contexte

L'application a deux frontends React (SPA) et un backend API REST stateless. L'authentification doit :
- Supporter le SSO entre boutique et backoffice
- Gerer 3 roles (CUSTOMER, MANAGER, ADMIN) avec RBAC
- Etre compatible avec des SPA (pas de session server-side)

## Decision

Utiliser **Keycloak** comme serveur d'identite avec le flow **Authorization Code + PKCE** pour les SPA React.

Le backend Spring Boot agit comme **Resource Server** OAuth2 : il valide les JWT et extrait les roles depuis le claim `realm_access.roles`.

### Configuration
- Un realm `macmarket` avec un client `macmarket-shop` et `macmarket-admin`
- Les roles (`CUSTOMER`, `MANAGER`, `ADMIN`) sont des realm roles Keycloak
- Le JWT contient les roles dans `realm_access.roles`
- Un `JwtAuthenticationConverter` mappe les roles vers des `GrantedAuthority` Spring Security (`ROLE_*`)

### Matrice RBAC

| Niveau | Pattern | Roles |
|--------|---------|-------|
| Public | `/api/v1/products/**`, `/api/v1/categories/**` | Aucun |
| Authentifie | `/api/v1/cart/**`, `/api/v1/orders/**`, etc. | Tout role |
| Gestion | `/api/v1/admin/**` (sauf stats) | MANAGER, ADMIN |
| Administration | `/api/v1/admin/stats/**` | ADMIN |

## Consequences

### Positives
- PKCE elimine le besoin de client_secret dans les SPA (securise)
- Keycloak gere le cycle de vie des tokens (refresh, revocation)
- Configuration du realm importee automatiquement au demarrage (fichier JSON)
- Separation claire entre authentification (Keycloak) et autorisation (Spring Security)

### Negatives
- Keycloak est un composant lourd (~500 Mo RAM) pour le dev local
- Dependance a un service externe pour l'authentification (SPOF en dev)
- Le realm JSON doit etre maintenu manuellement
