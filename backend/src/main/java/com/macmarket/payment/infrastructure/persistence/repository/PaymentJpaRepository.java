package com.macmarket.payment.infrastructure.persistence.repository;

import java.util.Optional;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.model.PaymentId;
import com.macmarket.payment.infrastructure.persistence.mapper.PaymentPersistenceMapper;

import org.springframework.stereotype.Component;

@Component
class PaymentJpaRepository implements com.macmarket.payment.domain.repository.PaymentRepository {

    private final PaymentSpringDataRepository springData;
    private final PaymentPersistenceMapper mapper;

    PaymentJpaRepository(PaymentSpringDataRepository springData, PaymentPersistenceMapper mapper) {
        this.springData = springData;
        this.mapper = mapper;
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
            var e = mapper.toJpa(p);
            e.markAsNew();
            springData.save(e);
        }
    }

    @Override
    public Optional<Payment> findById(PaymentId id) {
        return springData.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Payment> findByOrderId(OrderReference orderId) {
        return springData.findByOrderId(orderId.value()).map(mapper::toDomain);
    }
}
