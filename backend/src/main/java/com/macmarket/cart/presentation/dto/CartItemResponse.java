package com.macmarket.cart.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
    UUID productId,
    String productName,
    String productImage,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal
) {}
