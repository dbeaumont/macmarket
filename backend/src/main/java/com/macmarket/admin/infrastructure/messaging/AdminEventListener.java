package com.macmarket.admin.infrastructure.messaging;

import java.time.LocalDate;
import java.time.ZoneOffset;

import com.macmarket.admin.application.service.AdminStatsRecorder;
import com.macmarket.order.domain.event.OrderPlacedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
class AdminEventListener {

    private static final Logger log = LoggerFactory.getLogger(AdminEventListener.class);

    private final AdminStatsRecorder statsRecorder;

    AdminEventListener(AdminStatsRecorder statsRecorder) {
        this.statsRecorder = statsRecorder;
    }

    @EventListener
    void onOrderPlaced(OrderPlacedEvent event) {
        LocalDate today = event.occurredOn().atZone(ZoneOffset.UTC).toLocalDate();
        log.info("Admin stats: recording order {} for date {}", event.orderId().value(), today);
        statsRecorder.recordOrder(today, event.total());
    }
}
