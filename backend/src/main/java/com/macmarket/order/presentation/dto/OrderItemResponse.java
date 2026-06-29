package com.macmarket.order.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
    UUID productId,
    String productName,
    String productImage,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal
) {}
