package com.macmarket.user.infrastructure.messaging;

import com.macmarket.order.domain.event.OrderPlacedEvent;
import com.macmarket.user.application.service.ShippingProfileApplicationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class UserOrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(UserOrderEventListener.class);

    private final ShippingProfileApplicationService shippingProfileService;

    UserOrderEventListener(ShippingProfileApplicationService shippingProfileService) {
        this.shippingProfileService = shippingProfileService;
    }

    @ApplicationModuleListener
    void onOrderPlaced(OrderPlacedEvent event) {
        var shippingInfo = event.shippingInfo();
        log.info("Saving shipping profile for user {} from order {}", event.userId(), event.orderId());
        shippingProfileService.saveOrUpdate(
            event.userId(), shippingInfo.name(), shippingInfo.address(), shippingInfo.email()
        );
    }
}
