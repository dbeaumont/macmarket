# ADR-0006 — Angular pour les frontends (migration depuis React)

## Statut

Accepté (remplace la décision initiale de cet ADR, qui actait React pour les frontends)

## Contexte

MacMarket requiert deux interfaces utilisateur distinctes :
- `frontend-shop` : boutique publique (catalogue, panier, commandes, chat IA)
- `frontend-admin` : back-office interne (gestion produits, commandes, clients, statistiques)

L'implémentation initiale utilisait React 18 avec Vite, TanStack Query et Zustand. Suite à une décision d'alignement sur le standard frontend de l'organisation, une migration vers Angular a été effectuée.

## Décision

Migrer les deux frontends vers **Angular 21** avec :
- **Angular Material 21** pour les composants UI (Material Design 3)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) pour les utilitaires CSS
- **angular-auth-oidc-client v21** pour l'authentification OIDC/OAuth2 avec Keycloak
- **Angular Signals** pour la gestion d'état réactif (remplace Zustand + TanStack Query)
- **Composants standalone** (pas de NgModules), `inject()`, `@for`/`@if` control flow

## Stratégie de migration

- Remplacement **in-place** : les répertoires `frontend-shop/` et `frontend-admin/` conservent leurs noms
- Les Dockerfiles existants (multi-stage Node build + nginx:alpine) restent inchangés
- Le `outputPath` Angular est configuré sur `dist/` directement (`{ "base": "dist", "browser": "" }`)
- Les `nginx.conf` existants (proxy `/api/` + SPA routing) restent valides

## Architecture Angular

```
src/app/
├── core/
│   ├── guards/        — CanActivateFn (auth.guard, admin.guard)
│   ├── models/        — Interfaces TypeScript (readonly, no class)
│   └── services/      — Services injectables (Signals pour l'état)
├── shared/
│   └── components/    — Composants réutilisables (header, cart-drawer, product-card…)
├── features/          — Pages lazy-loadées
│   ├── home/
│   ├── products/
│   ├── checkout/
│   ├── orders/
│   ├── account/       (shop uniquement)
│   ├── chat/          (shop uniquement)
│   ├── dashboard/     (admin uniquement)
│   ├── inventory/     (admin uniquement)
│   ├── customers/     (admin uniquement)
│   └── stats/         (admin uniquement, rôle ADMIN requis)
├── app.routes.ts      — Routes lazy-loadées
├── app.config.ts      — Providers (router, http, animations, OIDC)
└── app.ts             — Composant racine
```

## Conséquences

**Avantages :**
- Alignement sur le standard organisationnel Angular
- Angular Signals offre une réactivité fine-grained sans boilerplate Zustand
- TypeScript strict appliqué nativement
- Angular Material fournit des composants accessibles clé-en-main

**Inconvénients / risques :**
- Bundle initial plus lourd qu'une app Vite/React (géré via lazy-loading)
- Courbe d'apprentissage si l'équipe est habituée à React

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Conserver React 19 (décision initiale) | Ne répondait plus à la contrainte d'alignement sur le standard frontend Angular de l'organisation, actée après la mise en production initiale |
| Vue.js 3 | Écosystème plus petit qu'Angular pour l'outillage d'entreprise (CLI, DI, formulaires réactifs) |
| Next.js (SSR/SSG) | SSR complexifie l'intégration OAuth2 PKCE (cookies serveur vs. localStorage) ; la marketplace ne requiert pas de SEO critique |

## Références

- [docs/04-technical.md](../04-technical.md) — stack frontend détaillée et versions
- ADR-0003 — Keycloak (intégration `angular-auth-oidc-client`)
- ADR-0008 — Deux frontends séparés
- [Angular Documentation](https://angular.dev/)
- [Angular Material Documentation](https://material.angular.io/)
