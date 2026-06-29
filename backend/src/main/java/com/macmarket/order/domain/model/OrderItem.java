package com.macmarket.order.domain.model;

import java.math.BigDecimal;

public record OrderItem(
    ProductReference productId,
    String productName,
    String productImage,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal
) {
    public OrderItem {
        if (quantity <= 0) throw new OrderDomainException("La quantite doit etre positive");
    }
}
