package com.macmarket.catalog.domain.event;

import java.time.Instant;
import java.util.UUID;

import com.macmarket.catalog.domain.model.ProductId;

public record StockInsufficientEvent(
    ProductId productId,
    UUID orderId,
    int requestedQuantity,
    int availableQuantity,
    Instant occurredOn
) implements DomainEvent {
    public StockInsufficientEvent(ProductId productId, UUID orderId, int requestedQuantity, int availableQuantity) {
        this(productId, orderId, requestedQuantity, availableQuantity, Instant.now());
    }
}
