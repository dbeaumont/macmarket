package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;

public record RevenueChartPoint(
    String date,
    BigDecimal revenue
) {}
