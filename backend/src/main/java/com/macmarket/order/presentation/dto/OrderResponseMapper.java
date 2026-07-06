package com.macmarket.order.presentation.dto;

import com.macmarket.order.domain.model.Order;

import org.springframework.stereotype.Component;

@Component
public class OrderResponseMapper {

    public OrderResponse toResponse(Order order) {
        var items = order.getItems().stream()
            .map(i -> new OrderItemResponse(i.productId().value(), i.productName(), i.productImage(),
                i.unitPrice(), i.quantity(), i.subtotal()))
            .toList();
        var ship = order.getShippingInfo();
        return new OrderResponse(
            order.getId().value(), order.getUserId().value(), order.getStatus().name(),
            items, order.getTotal(),
            ship != null ? ship.name() : null,
            ship != null ? ship.address() : null,
            ship != null ? ship.email() : null,
            order.getCreatedAt()
        );
    }
}
