package com.macmarket.payment.application.service;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.repository.PaymentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProcessPaymentService {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentService.class);

    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProcessPaymentService(PaymentRepository paymentRepository, ApplicationEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.eventPublisher = eventPublisher;
    }

    public Payment processForOrder(UUID orderId, java.math.BigDecimal amount) {
        var orderRef = OrderReference.of(orderId);
        var payment = Payment.initiate(orderRef, amount);
        paymentRepository.save(payment);

        boolean success = ThreadLocalRandom.current().nextInt(100) < 90;

        if (success) {
            var ref = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            payment.complete(ref);
            log.info("Payment {} completed for order {} (ref: {})", payment.getId(), orderId, ref);
        } else {
            payment.fail("Paiement refuse par la banque (simulation)");
            log.warn("Payment {} failed for order {}", payment.getId(), orderId);
        }

        paymentRepository.save(payment);
        payment.pullDomainEvents().forEach(eventPublisher::publishEvent);
        return payment;
    }
}
