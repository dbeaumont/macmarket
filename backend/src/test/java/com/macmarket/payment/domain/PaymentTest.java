package com.macmarket.payment.domain;

import java.math.BigDecimal;
import java.util.UUID;

import com.macmarket.payment.domain.event.PaymentCompletedEvent;
import com.macmarket.payment.domain.event.PaymentFailedEvent;
import com.macmarket.payment.domain.model.OrderReference;
import com.macmarket.payment.domain.model.Payment;
import com.macmarket.payment.domain.model.PaymentStatus;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentTest {

    private final OrderReference orderRef = OrderReference.of(UUID.randomUUID());
    private final BigDecimal amount = new BigDecimal("199.99");

    @Test
    void shouldInitiateInPendingStatus() {
        var payment = Payment.initiate(orderRef, amount);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getOrderId()).isEqualTo(orderRef);
        assertThat(payment.getAmount()).isEqualByComparingTo(amount);
        assertThat(payment.getTransactionRef()).isNull();
        assertThat(payment.pullDomainEvents()).isEmpty();
    }

    @Test
    void shouldCompleteAndPublishPaymentCompletedEvent() {
        var payment = Payment.initiate(orderRef, amount);

        payment.complete("TXN-ABCD1234");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getTransactionRef()).isEqualTo("TXN-ABCD1234");
        assertThat(payment.getCompletedAt()).isNotNull();

        var events = payment.pullDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.getFirst()).isInstanceOfSatisfying(PaymentCompletedEvent.class, event -> {
            assertThat(event.paymentId()).isEqualTo(payment.getId());
            assertThat(event.orderId()).isEqualTo(orderRef.value());
            assertThat(event.amount()).isEqualByComparingTo(amount);
        });
    }

    @Test
    void shouldFailAndPublishPaymentFailedEvent() {
        var payment = Payment.initiate(orderRef, amount);

        payment.fail("Paiement refuse par la banque (simulation)");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getFailureReason()).isEqualTo("Paiement refuse par la banque (simulation)");
        assertThat(payment.getCompletedAt()).isNotNull();

        var events = payment.pullDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.getFirst()).isInstanceOfSatisfying(PaymentFailedEvent.class, event -> {
            assertThat(event.paymentId()).isEqualTo(payment.getId());
            assertThat(event.orderId()).isEqualTo(orderRef.value());
            assertThat(event.reason()).isEqualTo("Paiement refuse par la banque (simulation)");
        });
    }

    @Test
    void pullDomainEventsShouldClearAfterRead() {
        var payment = Payment.initiate(orderRef, amount);
        payment.complete("TXN-ABCD1234");

        payment.pullDomainEvents();

        assertThat(payment.pullDomainEvents()).isEmpty();
    }
}
