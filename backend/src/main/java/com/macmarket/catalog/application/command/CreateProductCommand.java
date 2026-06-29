package com.macmarket.catalog.application.command;

import java.math.BigDecimal;
import java.util.Map;

public record CreateProductCommand(
    String name,
    String slug,
    String description,
    String shortDesc,
    BigDecimal price,
    String category,
    String imageUrl,
    int stockQuantity,
    Map<String, String> specs
) {}
