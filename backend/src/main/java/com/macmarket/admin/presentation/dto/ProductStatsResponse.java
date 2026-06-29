package com.macmarket.admin.presentation.dto;

import java.util.List;

public record ProductStatsResponse(
    long totalProducts,
    long activeProducts,
    long lowStockCount,
    List<LowStockProductDto> lowStockProducts
) {}
