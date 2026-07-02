package com.macmarket.cart.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MergeGuestCartRequest(@NotBlank @Size(min = 8, max = 64) String guestToken) {}
