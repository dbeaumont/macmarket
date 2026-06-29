package com.macmarket.catalog.infrastructure.messaging;

import com.macmarket.catalog.domain.model.ProductId;
import com.macmarket.catalog.domain.repository.ProductRepository;
import com.macmarket.order.domain.event.OrderPlacedEvent;
import com.macmarket.order.domain.event.OrderStatusChangedEvent;
import com.macmarket.order.domain.model.OrderStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Component
class OrderStockEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderStockEventListener.class);

    private final ProductRepository productRepository;

    OrderStockEventListener(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @ApplicationModuleListener
    void onOrderPlaced(OrderPlacedEvent event) {
        for (var item : event.items()) {
            productRepository.findById(ProductId.of(item.productId().value())).ifPresent(product -> {
                try {
                    product.reserveStock(item.quantity());
                    productRepository.save(product);
                    log.info("Reserved {} units of {} for order {}", item.quantity(), product.getName(), event.orderId());
                } catch (Exception e) {
                    log.warn("Stock reservation failed for {}: {}", product.getName(), e.getMessage());
                }
            });
        }
    }

    @ApplicationModuleListener
    void onOrderStatusChanged(OrderStatusChangedEvent event) {
        if (event.newStatus() == OrderStatus.PAID) {
            for (var item : event.items()) {
                productRepository.findById(ProductId.of(item.productId().value())).ifPresent(product -> {
                    product.confirmStockReservation(item.quantity());
                    productRepository.save(product);
                    log.info("Confirmed stock deduction for {} ({} units)", product.getName(), item.quantity());
                });
            }
        } else if (event.newStatus() == OrderStatus.CANCELLED) {
            for (var item : event.items()) {
                productRepository.findById(ProductId.of(item.productId().value())).ifPresent(product -> {
                    product.releaseStock(item.quantity());
                    productRepository.save(product);
                    log.info("Released stock for {} ({} units)", product.getName(), item.quantity());
                });
            }
        }
    }
}
