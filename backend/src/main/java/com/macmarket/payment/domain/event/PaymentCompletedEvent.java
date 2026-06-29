package com.macmarket.payment.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.macmarket.payment.domain.model.PaymentId;

public record PaymentCompletedEvent(PaymentId paymentId, UUID orderId, BigDecimal amount, Instant occurredOn) implements PaymentDomainEvent {
    public PaymentCompletedEvent(PaymentId paymentId, UUID orderId, BigDecimal amount) {
        this(paymentId, orderId, amount, Instant.now());
    }
}
