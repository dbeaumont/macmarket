package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CustomerSummaryResponse(
    String userId,
    long orderCount,
    BigDecimal totalSpent,
    Instant lastOrderDate
) {}
