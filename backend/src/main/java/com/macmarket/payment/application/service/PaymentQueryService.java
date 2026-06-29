package com.macmarket.payment.application.service;

import java.util.UUID;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PaymentQueryService {

    private final PaymentRepository paymentRepository;

    public PaymentQueryService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment findByOrderId(UUID orderId) {
        return paymentRepository.findByOrderId(OrderReference.of(orderId))
            .orElseThrow(() -> new RuntimeException("Paiement introuvable pour la commande : " + orderId));
    }
}
