package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record OrderStatsResponse(
    long totalOrders,
    BigDecimal totalRevenue,
    Map<String, Long> byStatus,
    List<OrderChartPoint> chart
) {}
