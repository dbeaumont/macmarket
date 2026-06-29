package com.macmarket.order.infrastructure.messaging;

import com.macmarket.order.application.service.UpdateOrderStatusService;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.payment.domain.event.PaymentCompletedEvent;
import com.macmarket.payment.domain.event.PaymentFailedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class PaymentEventListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventListener.class);

    private final UpdateOrderStatusService updateOrderStatusService;

    PaymentEventListener(UpdateOrderStatusService updateOrderStatusService) {
        this.updateOrderStatusService = updateOrderStatusService;
    }

    @ApplicationModuleListener
    void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("Payment completed for order {}, marking as PAID", event.orderId());
        updateOrderStatusService.markAsPaid(OrderId.of(event.orderId()));
    }

    @ApplicationModuleListener
    void onPaymentFailed(PaymentFailedEvent event) {
        log.info("Payment failed for order {}: {}", event.orderId(), event.reason());
        updateOrderStatusService.cancel(OrderId.of(event.orderId()));
    }
}
