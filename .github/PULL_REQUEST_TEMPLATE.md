## Description

<!-- Décris le changement en une ou deux phrases. Pourquoi ce changement, pas ce qu'il fait. -->

## Type de changement

- [ ] `feat:` nouvelle fonctionnalité
- [ ] `fix:` correction de bug
- [ ] `refactor:` refactoring sans changement de comportement
- [ ] `test:` ajout ou correction de tests
- [ ] `chore:` outillage, configuration, dépendances
- [ ] `docs:` documentation uniquement

## Checklist qualité

- [ ] Les tests couvrent le comportement ajouté ou modifié
- [ ] Pas de `any` TypeScript ni d'import Spring/JPA dans `domain/`
- [ ] Pas de `TODO` anonyme (un ticket de suivi référencé si TODO laissé)
- [ ] Pas de code commenté laissé dans le dépôt
- [ ] Pas de secret commité (clé API, mot de passe, token)
- [ ] Les propriétés d'interface TypeScript sont `readonly`

## Checklist REST (si endpoint ajouté ou modifié)

- [ ] `@Tag` présent sur le controller
- [ ] `@Operation(summary, description)` sur chaque endpoint
- [ ] `@ApiResponse` pour tous les codes HTTP possibles
- [ ] `@SecurityRequirement(name = "bearerAuth")` si endpoint protégé
- [ ] `@Parameter(description, required)` sur chaque paramètre path/query
- [ ] `@Parameter(hidden = true)` sur `@AuthenticationPrincipal`

## Tests effectués

<!-- Décris comment tu as testé ce changement manuellement ou via les tests automatisés. -->
