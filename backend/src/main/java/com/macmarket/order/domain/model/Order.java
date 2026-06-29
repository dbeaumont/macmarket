package com.macmarket.order.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.macmarket.order.domain.event.*;

public class Order {

    private final OrderId id;
    private final String userId;
    private OrderStatus status;
    private final List<OrderItem> items;
    private final BigDecimal total;
    private final ShippingInfo shippingInfo;
    private final Instant createdAt;
    private final List<OrderDomainEvent> domainEvents = new ArrayList<>();

    private Order(OrderId id, String userId, List<OrderItem> items, BigDecimal total,
                  ShippingInfo shippingInfo, OrderStatus status, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.items = new ArrayList<>(items);
        this.total = total;
        this.shippingInfo = shippingInfo;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Order place(String userId, List<OrderItem> items, BigDecimal total, ShippingInfo shippingInfo) {
        if (items == null || items.isEmpty()) {
            throw new OrderDomainException("Une commande doit contenir au moins un article");
        }
        var order = new Order(OrderId.generate(), userId, items, total, shippingInfo,
            OrderStatus.PENDING_PAYMENT, Instant.now());
        order.domainEvents.add(new OrderPlacedEvent(order.id, order.userId, order.total, order.items));
        return order;
    }

    public static Order reconstitute(OrderId id, String userId, List<OrderItem> items,
                                      BigDecimal total, ShippingInfo shippingInfo,
                                      OrderStatus status, Instant createdAt) {
        return new Order(id, userId, items, total, shippingInfo, status, createdAt);
    }

    public void markAsPaid() {
        if (this.status != OrderStatus.PENDING_PAYMENT) {
            throw new OrderDomainException("Seule une commande en attente de paiement peut etre marquee comme payee");
        }
        this.status = OrderStatus.PAID;
        this.domainEvents.add(new OrderStatusChangedEvent(this.id, OrderStatus.PAID, this.items));
    }

    public void cancel() {
        if (this.status == OrderStatus.DELIVERED) {
            throw new OrderDomainException("Une commande livree ne peut pas etre annulee");
        }
        this.status = OrderStatus.CANCELLED;
        this.domainEvents.add(new OrderStatusChangedEvent(this.id, OrderStatus.CANCELLED, this.items));
    }

    public void updateStatus(OrderStatus newStatus) {
        validateTransition(newStatus);
        this.status = newStatus;
        this.domainEvents.add(new OrderStatusChangedEvent(this.id, newStatus, this.items));
    }

    private void validateTransition(OrderStatus target) {
        boolean valid = switch (this.status) {
            case PENDING_PAYMENT -> target == OrderStatus.PAID || target == OrderStatus.CANCELLED;
            case PAID -> target == OrderStatus.PROCESSING || target == OrderStatus.CANCELLED;
            case PROCESSING -> target == OrderStatus.SHIPPED || target == OrderStatus.CANCELLED;
            case SHIPPED -> target == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
        if (!valid) {
            throw new OrderDomainException(
                "Transition invalide : " + this.status + " vers " + target);
        }
    }

    public OrderId getId() { return id; }
    public String getUserId() { return userId; }
    public OrderStatus getStatus() { return status; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public BigDecimal getTotal() { return total; }
    public ShippingInfo getShippingInfo() { return shippingInfo; }
    public Instant getCreatedAt() { return createdAt; }

    public List<OrderDomainEvent> pullDomainEvents() {
        var events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}
