package com.macmarket.order.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderItem;
import com.macmarket.order.domain.model.ShippingInfo;

public record OrderPlacedEvent(
    OrderId orderId,
    String userId,
    BigDecimal total,
    List<OrderItem> items,
    ShippingInfo shippingInfo,
    Instant occurredOn
) implements OrderDomainEvent {
    public OrderPlacedEvent(OrderId orderId, String userId, BigDecimal total, List<OrderItem> items, ShippingInfo shippingInfo) {
        this(orderId, userId, total, items, shippingInfo, Instant.now());
    }
}
