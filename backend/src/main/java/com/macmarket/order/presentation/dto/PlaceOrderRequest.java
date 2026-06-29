package com.macmarket.order.presentation.dto;

import jakarta.validation.constraints.NotBlank;

public record PlaceOrderRequest(
    @NotBlank String shippingName,
    @NotBlank String shippingAddress,
    @NotBlank String shippingEmail
) {}
