package com.macmarket.catalog.domain.event;

import java.time.Instant;

import com.macmarket.catalog.domain.model.Money;
import com.macmarket.catalog.domain.model.ProductId;

public record ProductCreatedEvent(
    ProductId productId,
    String name,
    Money price,
    Instant occurredOn
) implements DomainEvent {
    public ProductCreatedEvent(ProductId productId, String name, Money price) {
        this(productId, name, price, Instant.now());
    }
}
