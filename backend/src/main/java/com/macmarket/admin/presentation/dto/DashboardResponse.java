package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
    long totalOrders,
    BigDecimal totalRevenue,
    long totalCustomers,
    long activeProducts,
    long lowStockCount,
    Map<String, Long> ordersByStatus,
    List<RevenueChartPoint> revenueChart,
    List<RecentOrderDto> recentOrders,
    List<LowStockProductDto> lowStockProducts
) {}
