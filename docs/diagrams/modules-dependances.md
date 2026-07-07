# Modules et dépendances inter-modules

Dépendances directes (appels de services) et communication par événements entre les 8 modules Spring Modulith.

## Dépendances directes

```mermaid
graph LR
    cart["cart"] -->|"CatalogQueryService\nlecture catalogue"| catalog["catalog"]
    order["order"] -->|"CartApplicationService\nrécupération + vidage panier"| cart
    assistant["assistant"] -->|"CatalogQueryService\ncontexte pour le chat"| catalog
    admin["admin"] -->|"UpdateOrderStatusService\nchangement statut"| order

    style catalog fill:#fef3c7
    style cart fill:#dbeafe
    style order fill:#dcfce7
    style admin fill:#f3e8ff
    style assistant fill:#ffe4e6
```

## Communication par événements (Spring Modulith)

```mermaid
graph LR
    order(["📦 order"])
    payment(["💳 payment"])
    catalog(["📋 catalog"])
    cart(["🛒 cart"])
    notification(["📧 notification"])
    admin(["🔧 admin"])
    assistant(["🤖 assistant"])

    order -. "OrderPlacedEvent\n(montant, articles, livraison)" .-> payment
    order -. "OrderPlacedEvent\n(réservation stock)" .-> catalog
    order -. "OrderPlacedEvent\n(email confirmation)" .-> notification
    order -. "OrderPlacedEvent\n(stats dashboard)" .-> admin

    order -. "OrderStatusChangedEvent\n(déduction stock si PAID)" .-> catalog
    order -. "OrderStatusChangedEvent\n(email mise à jour)" .-> notification

    payment -. "PaymentCompletedEvent\n(markAsPaid)" .-> order
    payment -. "PaymentFailedEvent\n(cancel)" .-> order
    payment -. "PaymentCompletedEvent\n(email paiement ok)" .-> notification
    payment -. "PaymentFailedEvent\n(email paiement échoué)" .-> notification

    catalog -. "ProductUpdatedEvent\n(mise à jour snapshot)" .-> cart
    catalog -. "ProductCreatedEvent\nProductUpdatedEvent\n(rafraîchir contexte IA)" .-> assistant
```
