# Vue d’ensemble inter-domaines

## Flux principaux d’événements

```mermaid
flowchart LR
    A[Catalog] -->|ProductCreated / ProductUpdated / StockInsufficient| B[Cart]
    A -->|StockInsufficient| C[Order]
    B -->|OrderPlacement intent| C[Order]
    C -->|OrderPlacedEvent| D[Notification]
    C -->|OrderStatusChangedEvent| D[Notification]
    E[Payment] -->|PaymentCompletedEvent| D[Notification]
    E -->|PaymentFailedEvent| D[Notification]
    C -->|OrderPlacedEvent| E[Payment]
    E -->|PaymentCompletedEvent| C
    E -->|PaymentFailedEvent| C
    A -->|Product events| F[Assistant]
    C -->|Order context| F[Assistant]
    C -->|Order updates| G[Admin]
    A -->|Low stock / product stats| G[Admin]
```

## Description

- Le catalogue publie des événements produits qui peuvent influencer le panier et l’assistant.
- Le panier prépare la commande, qui est ensuite traitée par le domaine order.
- Le domaine order déclenche des notifications et initie le paiement.
- Le paiement notifie ensuite l’order et les notifications de son succès ou de son échec.
- L’admin consomme les données de commande et de stock pour proposer une supervision métier.
