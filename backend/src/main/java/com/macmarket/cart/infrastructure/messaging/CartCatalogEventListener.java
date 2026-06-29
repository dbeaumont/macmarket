package com.macmarket.cart.infrastructure.messaging;

import com.macmarket.cart.infrastructure.persistence.repository.CartItemRefresher;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.domain.event.ProductUpdatedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class CartCatalogEventListener {

    private static final Logger log = LoggerFactory.getLogger(CartCatalogEventListener.class);

    private final CartItemRefresher cartItemRefresher;
    private final CatalogQueryService catalogService;

    CartCatalogEventListener(CartItemRefresher cartItemRefresher, CatalogQueryService catalogService) {
        this.cartItemRefresher = cartItemRefresher;
        this.catalogService = catalogService;
    }

    @ApplicationModuleListener
    void onProductUpdated(ProductUpdatedEvent event) {
        var product = catalogService.findById(event.productId());
        int updated = cartItemRefresher.refreshProductSnapshot(
            event.productId().value(),
            product.getName(),
            product.getImageUrl(),
            product.getPrice().amount()
        );
        if (updated > 0) {
            log.info("Refreshed {} cart item(s) for product {}", updated, event.productId());
        }
    }
}
