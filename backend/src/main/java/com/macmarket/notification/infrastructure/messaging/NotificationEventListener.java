package com.macmarket.notification.infrastructure.messaging;

import java.util.Map;

import com.macmarket.notification.infrastructure.email.EmailService;
import com.macmarket.order.domain.event.OrderPlacedEvent;
import com.macmarket.order.domain.event.OrderStatusChangedEvent;
import com.macmarket.payment.domain.event.PaymentCompletedEvent;
import com.macmarket.payment.domain.event.PaymentFailedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private static final String DEFAULT_EMAIL = "client@macmarket.com";

    private final EmailService emailService;

    NotificationEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @ApplicationModuleListener
    void onOrderPlaced(OrderPlacedEvent event) {
        log.info("[NOTIFICATION] Sending order confirmation for {}", event.orderId());
        emailService.send(DEFAULT_EMAIL, "MacMarket - Confirmation de commande #" + event.orderId().value().toString().substring(0, 8),
            "order-confirmation", Map.of(
                "orderId", event.orderId().value().toString().substring(0, 8),
                "total", event.total().toString(),
                "itemCount", event.items().size()
            ));
    }

    @ApplicationModuleListener
    void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("[NOTIFICATION] Sending payment confirmation for order {}", event.orderId());
        emailService.send(DEFAULT_EMAIL, "MacMarket - Paiement confirme",
            "payment-result", Map.of(
                "orderId", event.orderId().toString().substring(0, 8),
                "amount", event.amount().toString(),
                "success", true,
                "reason", ""
            ));
    }

    @ApplicationModuleListener
    void onPaymentFailed(PaymentFailedEvent event) {
        log.info("[NOTIFICATION] Sending payment failure for order {}", event.orderId());
        emailService.send(DEFAULT_EMAIL, "MacMarket - Echec du paiement",
            "payment-result", Map.of(
                "orderId", event.orderId().toString().substring(0, 8),
                "amount", "",
                "success", false,
                "reason", event.reason()
            ));
    }

    @ApplicationModuleListener
    void onOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("[NOTIFICATION] Order {} status changed to {}", event.orderId(), event.newStatus());
        emailService.send(DEFAULT_EMAIL,
            "MacMarket - Commande #" + event.orderId().value().toString().substring(0, 8) + " — " + event.newStatus(),
            "order-confirmation", Map.of(
                "orderId", event.orderId().value().toString().substring(0, 8),
                "total", "",
                "itemCount", event.items().size()
            ));
    }
}
