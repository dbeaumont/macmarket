# Diagrammes de domaine MacMarket

Cette section regroupe les vues DDD par bounded context métier du backend.

## Domaines documentés

- [Catalog](./catalog-domain.md) ([diagramme de classes détaillé](./catalog-domain-classes.md))
- [Cart](./cart-domain.md)
- [Order](./order-domain.md)
- [Payment](./payment-domain.md)
- [Assistant](./assistant-domain.md)
- [Admin](./admin-domain.md)
- [Notification](./notification-domain.md)
- [User](./user-domain.md)
- [Vue inter-domaines](./interdomain-events.md)

## Organisation retenue

Chaque domaine suit la logique DDD suivante :

- Agrégat racine : classe centrale qui protège les invariants métier
- Value objects : identifiants et objets immuables de valeur
- Repository : port sortant du domaine
- Domain events : événements métier émis après changement d’état
- Application/infrastructure/presentation : couches externes autour du domaine
