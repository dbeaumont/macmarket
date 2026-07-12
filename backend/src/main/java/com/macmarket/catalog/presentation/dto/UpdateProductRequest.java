package com.macmarket.catalog.presentation.dto;

import java.math.BigDecimal;
import java.util.Map;

import jakarta.validation.constraints.Size;

public record UpdateProductRequest(
    @Size(max = 200) String name,
    String description,
    @Size(max = 500) String shortDesc,
    BigDecimal price,
    String category,
    @Size(max = 500) String imageUrl,
    Integer stockQuantity,
    Boolean active,
    Map<String, String> specs,
    Integer promotionPercentage
) {}
