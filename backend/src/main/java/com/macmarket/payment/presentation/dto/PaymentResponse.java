package com.macmarket.payment.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    UUID orderId,
    BigDecimal amount,
    String status,
    String transactionRef,
    String failureReason,
    String createdAt
) {}
