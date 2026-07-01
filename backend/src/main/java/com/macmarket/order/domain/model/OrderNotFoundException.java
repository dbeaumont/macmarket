package com.macmarket.order.domain.model;

import com.macmarket.NotFoundException;

public class OrderNotFoundException extends NotFoundException {
    public OrderNotFoundException(OrderId id) {
        super("Commande introuvable : " + id.value());
    }
}
