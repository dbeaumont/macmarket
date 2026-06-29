package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LowStockProductDto(
    UUID id,
    String name,
    String category,
    BigDecimal price,
    int stockQuantity,
    int reservedQuantity,
    int availableStock
) {}
