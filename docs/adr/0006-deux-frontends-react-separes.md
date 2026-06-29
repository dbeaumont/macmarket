# ADR-0006 — Deux applications React separees (boutique + backoffice)

## Statut

Accepte

## Contexte

L'application a deux audiences distinctes :
- Les **clients** qui parcourent le catalogue, ajoutent au panier, commandent et utilisent l'assistant IA
- Les **administrateurs/managers** qui gerent les commandes, le stock, les produits et consultent les statistiques

## Decision

Creer **deux applications React independantes** :
- `frontend-shop` : boutique client (port 3000/5173)
- `frontend-admin` : backoffice administration (port 3001/5174)

### Stack commune
- **React** avec TypeScript strict (`strict: true`)
- **Vite** comme bundler
- **Tailwind CSS v4** + **shadcn/ui** pour les composants
- **react-oidc-context** pour l'integration Keycloak
- **TanStack Query** (React Query) pour le data fetching (boutique)
- **Zustand** pour le state management du panier (boutique)

### Regles TypeScript appliquees
- Aucun `any` — `unknown` + type guards si necessaire
- Toutes les proprietes d'interface sont `readonly`
- Immutabilite : spread `{...obj}`, `[...arr]`, `map`, `filter`, `reduce` — pas de `push`/`splice`
- Typage explicite de tous les parametres et retours

## Consequences

### Positives
- **Bundles independants** : le backoffice n'alourdit pas la boutique client
- **Securite** : le code admin n'est jamais servi aux clients
- **Deploiement independant** : possibilite de deployer la boutique sans toucher au backoffice
- **Separation des preoccupations** : chaque app a ses propres routes, composants et hooks

### Negatives
- Duplication de certains utilitaires (`lib/api.ts`, `lib/auth.ts`, composants `ui/`)
- Deux `package.json` a maintenir
- Pas de partage de types TypeScript entre les deux apps
