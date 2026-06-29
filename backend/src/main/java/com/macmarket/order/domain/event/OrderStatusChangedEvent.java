package com.macmarket.order.domain.event;

import java.time.Instant;
import java.util.List;

import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderItem;
import com.macmarket.order.domain.model.OrderStatus;

public record OrderStatusChangedEvent(
    OrderId orderId,
    OrderStatus newStatus,
    List<OrderItem> items,
    Instant occurredOn
) implements OrderDomainEvent {
    public OrderStatusChangedEvent(OrderId orderId, OrderStatus newStatus, List<OrderItem> items) {
        this(orderId, newStatus, items, Instant.now());
    }
}
