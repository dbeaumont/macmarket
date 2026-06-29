package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecentOrderDto(
    UUID id,
    String userId,
    String status,
    BigDecimal total,
    int itemCount,
    Instant createdAt
) {}
