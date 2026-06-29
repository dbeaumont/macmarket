package com.macmarket.payment.domain.repository;

import java.util.Optional;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.model.PaymentId;

public interface PaymentRepository {
    void save(Payment payment);
    Optional<Payment> findById(PaymentId id);
    Optional<Payment> findByOrderId(OrderReference orderId);
}
