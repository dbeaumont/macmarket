package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.util.List;

public record RevenueStatsResponse(
    BigDecimal totalRevenue,
    BigDecimal averageOrderValue,
    long orderCount,
    List<RevenueChartPoint> chart
) {}
