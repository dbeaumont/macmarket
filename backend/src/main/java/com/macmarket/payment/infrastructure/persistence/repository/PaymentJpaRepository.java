package com.macmarket.payment.infrastructure.persistence.repository;

import java.util.Optional;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.model.PaymentId;
import com.macmarket.payment.domain.model.PaymentStatus;
import com.macmarket.payment.infrastructure.persistence.entity.PaymentJpaEntity;

import org.springframework.stereotype.Component;

@Component
class PaymentJpaRepository implements com.macmarket.payment.domain.repository.PaymentRepository {

    private final PaymentSpringDataRepository springData;

    PaymentJpaRepository(PaymentSpringDataRepository springData) {
        this.springData = springData;
    }

    @Override
    public void save(Payment p) {
        var existing = springData.findById(p.getId().value());
        if (existing.isPresent()) {
            var e = existing.get();
            e.setStatus(p.getStatus().name());
            e.setTransactionRef(p.getTransactionRef());
            e.setFailureReason(p.getFailureReason());
            e.setCompletedAt(p.getCompletedAt());
            springData.save(e);
        } else {
            var e = new PaymentJpaEntity();
            e.setId(p.getId().value());
            e.setOrderId(p.getOrderId().value());
            e.setAmount(p.getAmount());
            e.setStatus(p.getStatus().name());
            e.markAsNew();
            springData.save(e);
        }
    }

    @Override
    public Optional<Payment> findById(PaymentId id) {
        return springData.findById(id.value()).map(this::toDomain);
    }

    @Override
    public Optional<Payment> findByOrderId(OrderReference orderId) {
        return springData.findByOrderId(orderId.value()).map(this::toDomain);
    }

    private Payment toDomain(PaymentJpaEntity e) {
        return Payment.reconstitute(PaymentId.of(e.getId()), OrderReference.of(e.getOrderId()), e.getAmount(),
            PaymentStatus.valueOf(e.getStatus()), e.getTransactionRef(), e.getFailureReason(),
            e.getCreatedAt(), e.getCompletedAt());
    }
}
