package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminOrderDetailResponse(
    UUID id,
    String userId,
    String status,
    BigDecimal total,
    String shippingName,
    String shippingAddress,
    String shippingEmail,
    List<AdminOrderItemResponse> items,
    Instant createdAt,
    Instant updatedAt
) {}
