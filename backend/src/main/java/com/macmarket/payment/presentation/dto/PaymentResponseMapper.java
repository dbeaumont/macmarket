package com.macmarket.payment.presentation.dto;

import com.macmarket.payment.domain.model.Payment;

import org.springframework.stereotype.Component;

@Component
public class PaymentResponseMapper {

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
            payment.getId().value(),
            payment.getOrderId().value(),
            payment.getAmount(),
            payment.getStatus().name(),
            payment.getTransactionRef() != null ? payment.getTransactionRef() : "",
            payment.getFailureReason() != null ? payment.getFailureReason() : "",
            payment.getCreatedAt().toString()
        );
    }
}
