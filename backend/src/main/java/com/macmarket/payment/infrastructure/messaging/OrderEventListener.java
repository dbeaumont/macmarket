package com.macmarket.payment.infrastructure.messaging;

import com.macmarket.order.domain.event.OrderPlacedEvent;
import com.macmarket.payment.application.service.ProcessPaymentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    private final ProcessPaymentService processPaymentService;

    OrderEventListener(ProcessPaymentService processPaymentService) {
        this.processPaymentService = processPaymentService;
    }

    @ApplicationModuleListener
    void onOrderPlaced(OrderPlacedEvent event) {
        log.info("Processing payment for order {} (amount: {})", event.orderId(), event.total());
        processPaymentService.processForOrder(event.orderId().value(), event.total());
    }
}
