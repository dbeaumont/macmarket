package com.macmarket.payment.internal;

import java.math.BigDecimal;
import java.util.UUID;

import com.macmarket.payment.application.service.PaymentQueryService;
import com.macmarket.payment.application.service.ProcessPaymentService;
import com.macmarket.payment.domain.model.PaymentNotFoundException;
import com.macmarket.payment.domain.model.PaymentStatus;
import com.macmarket.payment.domain.repository.PaymentRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("dev")
class PaymentIntegrationTests {

    @Autowired PaymentRepository paymentRepository;
    @Autowired ApplicationEventPublisher eventPublisher;
    @Autowired PaymentQueryService paymentQueryService;

    @Test
    void shouldCompletePaymentWhenGatewayApproves() {
        var orderId = UUID.randomUUID();
        var service = new ProcessPaymentService(paymentRepository, eventPublisher, () -> true);

        var payment = service.processForOrder(orderId, new BigDecimal("199.99"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getTransactionRef()).isNotNull();

        var found = paymentQueryService.findByOrderId(orderId);
        assertThat(found.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    void shouldFailPaymentWhenGatewayRejects() {
        var orderId = UUID.randomUUID();
        var service = new ProcessPaymentService(paymentRepository, eventPublisher, () -> false);

        var payment = service.processForOrder(orderId, new BigDecimal("49.90"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getFailureReason()).isNotNull();

        var found = paymentQueryService.findByOrderId(orderId);
        assertThat(found.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    void shouldThrowPaymentNotFoundExceptionWhenOrderHasNoPayment() {
        var unknownOrderId = UUID.randomUUID();

        assertThatThrownBy(() -> paymentQueryService.findByOrderId(unknownOrderId))
            .isInstanceOf(PaymentNotFoundException.class)
            .hasMessageContaining(unknownOrderId.toString());
    }
}
