package com.macmarket.order.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    String userId,
    String status,
    List<OrderItemResponse> items,
    BigDecimal total,
    String shippingName,
    String shippingAddress,
    String shippingEmail,
    Instant createdAt
) {}

