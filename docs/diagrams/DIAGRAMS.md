# Index des diagrammes

| Fichier | Type | Audience | Description |
|---------|------|----------|-------------|
| [architecture-globale.md](architecture-globale.md) | `graph TB` | Tous | Vue d'ensemble des services et leurs connexions |
| [modules-dependances.md](modules-dependances.md) | `graph LR` | Architecte / Dev | Dépendances directes et événements inter-modules |
| [order-sequence-checkout.md](order-sequence-checkout.md) | `sequenceDiagram` | Dev / QA | Flux complet de passage de commande |
| [cart-sequence-guest.md](cart-sequence-guest.md) | `sequenceDiagram` | Dev / QA | Panier invité → fusion après login |
| [assistant-sequence.md](assistant-sequence.md) | `sequenceDiagram` | Dev | Flux chat IA avec SSE streaming |
| [auth-sequence.md](auth-sequence.md) | `sequenceDiagram` | Sécurité / Dev | Flux OIDC PKCE + validation JWT |
| [order-statemachine.md](order-statemachine.md) | `stateDiagram` | Tous | Cycle de vie d'une commande |
| [payment-statemachine.md](payment-statemachine.md) | `stateDiagram` | Tous | Cycle de vie d'un paiement |
| [domain-classes.md](domain-classes.md) | `classDiagram` | Architecte / Dev | Agrégats DDD principaux |
| [data-model.md](data-model.md) | `classDiagram` | Dev / DBA | Schéma de base de données |

---

## Conventions

- Les noms de classes/entités sont en `PascalCase` (identiques au code)
- Les labels de relations sont en français
- Les diagrammes de séquence utilisent `actor` pour les utilisateurs humains
- Chaque diagramme est autonome (lisible sans context)

## Fréquence de mise à jour suggérée

| Diagramme | Déclencheur de mise à jour |
|-----------|--------------------------|
| Architecture globale | Ajout/suppression d'un service |
| Modules et dépendances | Modification des dépendances inter-modules |
| Séquences | Modification d'un flux métier ou d'un endpoint |
| State machines | Modification des statuts d'une entité |
| Classes domaine | Modification d'un agrégat ou Value Object |
| Modèle de données | Nouvelle migration Flyway |
