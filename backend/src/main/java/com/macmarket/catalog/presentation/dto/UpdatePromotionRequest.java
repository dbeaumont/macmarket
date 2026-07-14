package com.macmarket.catalog.presentation.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePromotionRequest(
    @NotNull Integer promotionPercentage
) {}
