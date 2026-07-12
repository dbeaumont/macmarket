package com.macmarket.catalog.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String name,
    String slug,
    String description,
    String shortDesc,
    BigDecimal price,
    String category,
    String imageUrl,
    int stockQuantity,
    int reservedQuantity,
    boolean active,
    Map<String, String> specs,
    int promotionPercentage,
    BigDecimal discountedPrice,
    Instant createdAt
) {}
