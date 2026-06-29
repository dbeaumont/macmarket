package com.macmarket.payment.domain.event;

import java.time.Instant;
import java.util.UUID;

import com.macmarket.payment.domain.model.PaymentId;

public record PaymentFailedEvent(PaymentId paymentId, UUID orderId, String reason, Instant occurredOn) implements PaymentDomainEvent {
    public PaymentFailedEvent(PaymentId paymentId, UUID orderId, String reason) {
        this(paymentId, orderId, reason, Instant.now());
    }
}
