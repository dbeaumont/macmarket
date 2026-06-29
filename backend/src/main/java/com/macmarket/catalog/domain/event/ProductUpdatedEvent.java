package com.macmarket.catalog.domain.event;

import java.time.Instant;

import com.macmarket.catalog.domain.model.ProductId;

public record ProductUpdatedEvent(
    ProductId productId,
    Instant occurredOn
) implements DomainEvent {
    public ProductUpdatedEvent(ProductId productId) {
        this(productId, Instant.now());
    }
}
