# ADR-0006 — Angular pour les frontends (migration depuis React)

## Statut

Supersédé (remplace ADR-0006 initial « React pour les frontends »)

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

## Liens

- [ADR-0003 — Authentification Keycloak OIDC](ADR-0003-authentification-keycloak-oidc.md)
- [ADR-0008 — Deux frontends séparés](ADR-0008-deux-frontends-separes.md)


1. **Boutique client** : catalogue de produits Mac, panier, checkout, commandes, assistant IA
2. **Backoffice admin** : gestion des produits, commandes, clients, statistiques et dashboard

Les exigences techniques sont :

- Applications SPA (Single Page Application) capables d'intégrer OAuth2/OIDC PKCE sans bibliothèque serveur
- TypeScript strict pour la robustesse et la maintenabilité
- Gestion d'état serveur (données distantes paginées, invalidation de cache)
- Gestion d'état client (panier, préférences) entre les composants
- Composants UI modernes et accessibles sans développer un design system from scratch
- Outillage de build rapide (hot-reload en développement)

## Décision

Utiliser **React 19** avec **TypeScript 5.9** et **Vite 7** pour les deux frontends, avec la stack suivante :

| Bibliothèque | Usage | Boutique | Backoffice |
|---|---|:---:|:---:|
| React 19 | Framework UI | ✅ | ✅ |
| TypeScript 5.9 | Typage strict | ✅ | ✅ |
| Vite 7 | Build + HMR | ✅ | ✅ |
| TanStack Query 5 | État serveur (fetch, cache, mutation) | ✅ | ✅ |
| TanStack Table 8 | Tableaux paginés côté client | — | ✅ |
| Zustand 5 | État client global (panier) | ✅ | — |
| react-oidc-context 3 | Intégration OAuth2/OIDC PKCE | ✅ | ✅ |
| shadcn/ui + Tailwind CSS 4 | Composants UI | ✅ | ✅ |
| Recharts 3 | Graphiques statistiques | ✅ | ✅ |
| Sonner | Notifications toast | ✅ | — |
| Embla Carousel | Carrousel produits | ✅ | — |

**Conventions architecturales React appliquées :**
- Composants fonctionnels uniquement — pas de class components
- Logique métier et appels réseau dans des **custom hooks** (`use-xxx.ts`)
- État serveur via TanStack Query — pas de `useEffect + fetch` manuel
- État client partagé via Zustand avec mises à jour immuables (spread)
- Props typées via `interface XxxProps` avec `readonly`
- `useEffect` toujours accompagné d'une fonction de cleanup

## Conséquences

### Positives

- React 19 dispose d'un écosystème très large : TanStack Query, Zustand, react-oidc-context sont des bibliothèques matures avec support actif
- TanStack Query élimine le code de data-fetching manuel (`useEffect + useState + loading/error`) et apporte le cache, la revalidation et les mutations optimistes
- Zustand est minimal et performant pour un état client comme le panier (pas de boilerplate Redux)
- Vite 7 offre un démarrage quasi-instantané en développement et des builds de production optimisés
- shadcn/ui génère des composants copiés dans le projet (pas de dépendance runtime) : personnalisation totale et contrôle complet du bundle
- Typage strict TypeScript (`strict: true`) et immutabilité (`readonly`) réduisent les bugs à l'exécution

### Négatives

- React n'est pas opinionné sur l'organisation du code : les conventions (hooks, stores, DTOs) doivent être explicitement définies et documentées
- Deux applications React séparées impliquent une duplication de la configuration (`tsconfig`, `vite.config`, `eslint.config`)
- L'absence de Server-Side Rendering (SSR) pénalise légèrement le SEO de la boutique (acceptable pour une marketplace spécialisée B2C)
- React 19 (Server Components, Actions) introduit des paradigmes nouveaux non utilisés ici — risque de dette technique si la migration vers ces patterns est différée

## Alternatives considérées

| Alternative | Raison du rejet |
|-------------|----------------|
| Angular | Framework plus opinionnated et plus verbeux ; courbe d'apprentissage plus longue pour un projet de cette taille ; Angular 19 avec Signals est mature mais React reste plus adopté dans l'écosystème Open Source |
| Vue.js 3 | Écosystème plus petit que React pour les bibliothèques tier (TanStack, shadcn/ui) ; Composition API est comparable aux hooks React mais avec moins de ressources communautaires |
| Next.js (SSR/SSG) | SSR complexifie l'intégration OAuth2 PKCE (cookies serveur vs. localStorage) ; la marketplace ne requiert pas de SEO critique ; surcharge sans bénéfice identifié |
| Svelte / SvelteKit | Excellent pour des projets from-scratch mais écosystème UI moins riche ; TanStack Query pour Svelte moins mature |
| Application unique (boutique + backoffice dans un seul projet) | Mélange les contraintes d'UI (UX client ≠ UX admin) et les dépendances ; montée en charge et déploiement moins flexibles — voir ADR-0008 |

## Plan d'implémentation

- Chaque frontend (`frontend-shop/`, `frontend-admin/`) est une application Vite indépendante
- `tsconfig.json` avec `"strict": true` dans les deux projets
- `eslint.config.js` avec les règles React et TypeScript recommandées
- Les variables d'environnement Vite (`VITE_*`) externalisent les URLs de l'API et de Keycloak
- En production, chaque frontend est servi par Nginx Alpine (build multi-stage Docker)
- `make shop-run` et `make admin-run` lancent les dev servers avec HMR

## Références

- [docs/04-technical.md](../04-technical.md) — stack frontend détaillée et versions
- ADR-0003 — Keycloak (intégration `react-oidc-context`)
- ADR-0008 — Deux frontends séparés
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
