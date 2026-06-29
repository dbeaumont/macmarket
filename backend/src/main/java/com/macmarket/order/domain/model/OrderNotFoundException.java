package com.macmarket.order.domain.model;

public class OrderNotFoundException extends OrderDomainException {
    public OrderNotFoundException(OrderId id) {
        super("Commande introuvable : " + id.value());
    }
}
