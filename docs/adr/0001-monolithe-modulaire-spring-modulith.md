# ADR-0001 — Monolithe modulaire avec Spring Modulith

## Statut

Accepte

## Contexte

MacMarket est une marketplace e-commerce de taille moderee (7 bounded contexts, ~50 produits, ~4 roles utilisateur). L'equipe doit choisir entre une architecture microservices, un monolithe classique, ou un monolithe modulaire.

Les contraintes sont :
- Equipe reduite, besoin de simplicite operationnelle
- Pas de besoin de scalabilite independante par module a ce stade
- Besoin de separation claire des domaines metier pour maintenabilite
- Deploiement en Docker Compose sur un seul serveur

## Decision

Utiliser **Spring Modulith** pour construire un **monolithe modulaire** avec des bounded contexts DDD appliques au niveau des packages Java.

## Consequences

### Positives
- **Un seul deployable** : simplifie le CI/CD, le monitoring et le debugging
- **Communication synchrone** entre modules quand necessaire (appels de services directs)
- **Communication asynchrone** via `ApplicationEventPublisher` + `@ApplicationModuleListener` pour le decouplage
- **Tests de modularite** (`ApplicationModules.verify()`) qui garantissent le respect des frontieres
- **Table `event_publication`** geree par Spring Modulith pour la fiabilite des events asynchrones
- Migration vers des microservices facilitee si necessaire (les frontieres sont deja tracees)

### Negatives
- Tous les modules partagent le meme runtime JVM et la meme base de donnees
- Un bug dans un module peut affecter les autres (pas d'isolation de process)
- Scalabilite horizontale uniquement globale (pas par module)

## Alternatives considerees

| Alternative | Raison du rejet |
|-------------|----------------|
| Microservices | Complexite operationnelle disproportionnee pour la taille du projet |
| Monolithe classique (layered) | Pas de garantie de separation des domaines, couplage technique |
| Modules Maven separes | Overhead de build sans les benefices du runtime Spring Modulith |
