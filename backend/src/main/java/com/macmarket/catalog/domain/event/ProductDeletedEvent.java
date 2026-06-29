package com.macmarket.catalog.domain.event;

import java.time.Instant;

import com.macmarket.catalog.domain.model.ProductId;

public record ProductDeletedEvent(
    ProductId productId,
    Instant occurredOn
) implements DomainEvent {
    public ProductDeletedEvent(ProductId productId) {
        this(productId, Instant.now());
    }
}
