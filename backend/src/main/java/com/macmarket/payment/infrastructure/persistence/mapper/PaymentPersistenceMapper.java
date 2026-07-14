package com.macmarket.payment.infrastructure.persistence.mapper;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.model.PaymentId;
import com.macmarket.payment.domain.model.PaymentStatus;
import com.macmarket.payment.infrastructure.persistence.entity.PaymentJpaEntity;

import org.springframework.stereotype.Component;

@Component
public class PaymentPersistenceMapper {

    public Payment toDomain(PaymentJpaEntity e) {
        return Payment.reconstitute(PaymentId.of(e.getId()), OrderReference.of(e.getOrderId()), e.getAmount(),
            PaymentStatus.valueOf(e.getStatus()), e.getTransactionRef(), e.getFailureReason(),
            e.getCreatedAt(), e.getCompletedAt());
    }

    public PaymentJpaEntity toJpa(Payment payment) {
        var e = new PaymentJpaEntity();
        e.setId(payment.getId().value());
        e.setOrderId(payment.getOrderId().value());
        e.setAmount(payment.getAmount());
        e.setStatus(payment.getStatus().name());
        e.setTransactionRef(payment.getTransactionRef());
        e.setFailureReason(payment.getFailureReason());
        e.setCompletedAt(payment.getCompletedAt());
        return e;
    }
}
