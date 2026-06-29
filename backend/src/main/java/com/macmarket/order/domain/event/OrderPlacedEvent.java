package com.macmarket.order.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderItem;

public record OrderPlacedEvent(
    OrderId orderId,
    String userId,
    BigDecimal total,
    List<OrderItem> items,
    Instant occurredOn
) implements OrderDomainEvent {
    public OrderPlacedEvent(OrderId orderId, String userId, BigDecimal total, List<OrderItem> items) {
        this(orderId, userId, total, items, Instant.now());
    }
}
