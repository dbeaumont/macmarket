package com.macmarket.cart.presentation.dto;

import jakarta.validation.constraints.Positive;

public record UpdateQuantityRequest(@Positive int quantity) {}
