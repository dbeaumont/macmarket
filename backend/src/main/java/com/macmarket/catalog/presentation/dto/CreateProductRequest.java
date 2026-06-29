package com.macmarket.catalog.presentation.dto;

import java.math.BigDecimal;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
    @NotBlank @Size(max = 200) String name,
    @NotBlank @Size(max = 200) String slug,
    String description,
    @Size(max = 500) String shortDesc,
    @Positive BigDecimal price,
    @NotBlank String category,
    @Size(max = 500) String imageUrl,
    @PositiveOrZero int stockQuantity,
    Map<String, String> specs
) {}
