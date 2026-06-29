package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminOrderItemResponse(
    UUID id,
    UUID productId,
    String productName,
    String productImage,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal
) {}
