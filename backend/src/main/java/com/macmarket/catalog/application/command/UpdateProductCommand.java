package com.macmarket.catalog.application.command;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record UpdateProductCommand(
    UUID productId,
    String name,
    String description,
    String shortDesc,
    BigDecimal price,
    String category,
    String imageUrl,
    Integer stockQuantity,
    Map<String, String> specs
) {}
