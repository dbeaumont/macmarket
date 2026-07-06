package com.macmarket.order.infrastructure.persistence.mapper;

import java.util.stream.Collectors;

import com.macmarket.UserId;
import com.macmarket.order.domain.model.*;
import com.macmarket.order.infrastructure.persistence.entity.OrderItemJpaEntity;
import com.macmarket.order.infrastructure.persistence.entity.OrderJpaEntity;

import org.springframework.stereotype.Component;

@Component
public class OrderPersistenceMapper {

    public Order toDomain(OrderJpaEntity e) {
        var items = e.getItems().stream()
            .map(i -> new OrderItem(ProductReference.of(i.getProductId()), i.getProductName(), i.getProductImage(),
                i.getUnitPrice(), i.getQuantity(), i.getSubtotal()))
            .toList();
        var shipping = new ShippingInfo(e.getShippingName(), e.getShippingAddress(), e.getShippingEmail());
        return Order.reconstitute(OrderId.of(e.getId()), UserId.of(e.getUserId()), items, e.getTotal(),
            shipping, OrderStatus.valueOf(e.getStatus()), e.getCreatedAt());
    }

    public OrderJpaEntity toJpa(Order order) {
        var e = new OrderJpaEntity();
        e.setId(order.getId().value());
        e.setUserId(order.getUserId().value());
        e.setStatus(order.getStatus().name());
        e.setTotal(order.getTotal());
        if (order.getShippingInfo() != null) {
            e.setShippingName(order.getShippingInfo().name());
            e.setShippingAddress(order.getShippingInfo().address());
            e.setShippingEmail(order.getShippingInfo().email());
        }
        var items = order.getItems().stream().map(item -> {
            var ie = new OrderItemJpaEntity();
            ie.setOrder(e);
            ie.setProductId(item.productId().value());
            ie.setProductName(item.productName());
            ie.setProductImage(item.productImage());
            ie.setUnitPrice(item.unitPrice());
            ie.setQuantity(item.quantity());
            ie.setSubtotal(item.subtotal());
            return ie;
        }).collect(Collectors.toList());
        e.setItems(items);
        return e;
    }
}
