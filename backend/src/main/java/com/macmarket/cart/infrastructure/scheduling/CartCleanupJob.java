package com.macmarket.cart.infrastructure.scheduling;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.macmarket.cart.application.service.CartApplicationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
class CartCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(CartCleanupJob.class);

    private final CartApplicationService cartService;

    CartCleanupJob(CartApplicationService cartService) {
        this.cartService = cartService;
    }

    @Scheduled(fixedRate = 3600000)
    void cleanupAbandonedCarts() {
        var cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        int deleted = cartService.cleanupAbandonedCarts(cutoff);
        if (deleted > 0) {
            log.info("Cleaned up {} abandoned cart(s) older than 24h", deleted);
        }
    }
}
