package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminOrderResponse(
    UUID id,
    String userId,
    String status,
    BigDecimal total,
    int itemCount,
    String shippingName,
    String shippingAddress,
    String shippingEmail,
    Instant createdAt,
    Instant updatedAt
) {}
