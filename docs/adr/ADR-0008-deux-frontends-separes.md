# ADR-0008 — Deux frontends Angular séparés (boutique et backoffice)

## Statut

Accepté

## Contexte

MacMarket adresse deux populations d'utilisateurs avec des besoins radicalement différents :

**Clients (boutique)** : navigation dans le catalogue, ajout au panier, checkout, suivi de commandes, assistant IA. Priorité sur l'expérience visuelle, la fluidité et la conversion.

**Équipe interne (backoffice)** : gestion des produits, traitement des commandes, consultation des statistiques, gestion des clients. Priorité sur la densité d'information, les tableaux et les actions bulk.

La question est : faut-il construire une seule application Angular qui sert les deux cas d'usage avec une gestion des rôles, ou deux applications indépendantes ?

## Décision

Créer **deux applications Angular indépendantes** :

| Critère | Boutique (`frontend-shop/`) | Backoffice (`frontend-admin/`) |
|---|---|---|
| Port dev | 4200 | 4201 |
| Port prod | 3000 | 3001 |
| Rôle Keycloak | `CUSTOMER` | `MANAGER` ou `ADMIN` |
| Design | Orienté client, carrousel, animations | Orienté données, tableaux, formulaires |
| Dépendances spécifiques | @lucide/angular (icônes) | Chart.js + ng2-charts (graphiques statistiques) |
| Build Docker | Image Nginx indépendante | Image Nginx indépendante |

Les deux applications partagent :
- La même version d'Angular / TypeScript / Angular Material / Tailwind CSS
- La même bibliothèque d'authentification (`angular-auth-oidc-client`)
- Le même client API backend (conventions communes)

## Conséquences

### Positives

- Séparation totale des surfaces d'attaque : un bug ou une vulnérabilité dans le backoffice n'impacte pas la boutique
- Bundles JavaScript distincts et optimisés pour chaque usage, renforcé par le lazy-loading des routes (`features/`) dans chaque application : la boutique ne charge pas le code des graphiques statistiques, le backoffice ne charge pas le carrousel produit
- Déploiement indépendant : la boutique peut être mise à jour sans toucher le backoffice
- Configuration Keycloak distincte : deux clients OIDC séparés (`macmarket-shop`, `macmarket-admin`) avec des scopes différents
- Isolation des dépendances : chaque frontend ne porte que ce dont il a besoin (Chart.js + ng2-charts uniquement côté backoffice)
- Routage simplifié : chaque application a son propre périmètre de routes sans conflit

### Négatives

- Duplication de la configuration (`tsconfig.json`, `angular.json`, `package.json`) entre les deux projets
- Pas de partage de code (composants UI communs, types API) sans un workspace monorepo ou une bibliothèque partagée
- Deux processus à lancer en développement (`make shop-run` et `make admin-run` en parallèle)
- Deux Dockerfiles et deux images Docker à maintenir et construire
- Si une règle de style commune évolue (ex. couleur primaire), elle doit être mise à jour dans les deux projets

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Application unique avec routing par rôle (`/shop/*` et `/admin/*`) | Complexité de la gestion des permissions dans l'UI ; bundle plus lourd chargé par tous les utilisateurs ; risque de fuite de code admin vers les clients |
| Microfrontend (Module Federation) | Surcharge architecturale disproportionnée pour deux applications de taille modeste ; complexité de versioning des modules partagés |
| Monorepo avec packages partagés (Nx) | Viable et recommandé pour un projet plus grand, notamment pour partager des bibliothèques Angular entre les deux frontends ; ajouterait de la valeur si un troisième frontend était envisagé ; actuellement, le gain ne justifie pas la complexité de setup |
| Mélanger deux frameworks frontend (ex. Angular pour l'un, React pour l'autre) | Incompatible avec la règle du projet d'une stack frontend unique par organisation — ADR-0006 acte Angular comme seul framework frontend |
| Rendu serveur-side (Spring MVC + Thymeleaf pour l'admin) | Incompatible avec l'architecture SPA + API REST choisie ; nécessiterait un backend template engine séparé |

## Plan d'implémentation

- `frontend-shop/` et `frontend-admin/` sont deux répertoires indépendants à la racine du monorepo
- Chaque frontend a ses propres `package.json`, `node_modules`, scripts et Dockerfile
- Les URLs (API, Keycloak) sont externalisées par fichiers `src/environments/environment.ts` / `environment.prod.ts` (mécanisme natif Angular, remplace les variables d'environnement Vite)
- En développement : `ng serve` sur les ports 4200 (boutique) et 4201 (backoffice)
- En production Docker : Nginx sert les fichiers statiques et proxifie `/api` vers le backend
- Les deux images Docker sont construites et démarrées par Docker Compose (`frontend-shop`, `frontend-admin`)

## Références

- ADR-0003 — Keycloak (deux clients OIDC distincts)
- [ADR-0006](ADR-0006-angular-frontends.md) — Angular pour les frontends (stack commune)
- [docs/06-packaging.md](../06-packaging.md) — Dockerfiles et Docker Compose
- [docs/05-security.md](../05-security.md) — modèle RBAC par frontend
