package com.macmarket.order.internal;

import java.util.UUID;

import com.macmarket.UserId;
import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.order.application.command.PlaceOrderCommand;
import com.macmarket.order.application.service.OrderQueryService;
import com.macmarket.order.application.service.PlaceOrderService;
import com.macmarket.order.domain.model.OrderStatus;
import com.macmarket.payment.application.service.PaymentQueryService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("dev")
class OrderIntegrationTests {

    @Autowired PlaceOrderService placeOrderService;
    @Autowired OrderQueryService orderQueryService;
    @Autowired CartApplicationService cartService;
    @Autowired CatalogQueryService catalogService;
    @Autowired PaymentQueryService paymentQueryService;

    private final String userId = "order-test-" + UUID.randomUUID();

    @Test
    void shouldPlaceOrderFromCart() {
        var product = catalogService.findBySlug("mac-mini-m4-16-256");
        cartService.addItem(userId, product.getId().value(), 2);

        var order = placeOrderService.execute(
            new PlaceOrderCommand(UserId.of(userId), "Test User", "42 rue de Paris", "test@test.com"));

        assertThat(order.getId()).isNotNull();
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getItems().getFirst().quantity()).isEqualTo(2);
        assertThat(order.getTotal()).isPositive();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);

        var cart = cartService.getCart(userId);
        assertThat(cart.getItems()).isEmpty();
    }

    @Test
    void shouldRejectOrderWithEmptyCart() {
        var emptyUser = "empty-" + UUID.randomUUID();
        assertThatThrownBy(() ->
            placeOrderService.execute(new PlaceOrderCommand(UserId.of(emptyUser), "Test", "Addr", "e@e.com"))
        ).hasMessageContaining("panier est vide");
    }

    @Test
    void shouldListOrdersByUser() {
        var product = catalogService.findBySlug("mac-mini-m4-16-512");
        cartService.addItem(userId, product.getId().value(), 1);
        placeOrderService.execute(new PlaceOrderCommand(UserId.of(userId), "Test", "Addr", "e@e.com"));

        var orders = orderQueryService.findByUserId(UserId.of(userId));
        assertThat(orders).isNotEmpty();
    }

    @Test
    void shouldProcessPaymentAutomatically() throws InterruptedException {
        var user = "pay-test-" + UUID.randomUUID();
        var product = catalogService.findBySlug("macbook-air-13-m4-16-256-skyblue");
        cartService.addItem(user, product.getId().value(), 1);

        var order = placeOrderService.execute(
            new PlaceOrderCommand(UserId.of(user), "Pay Test", "123 Ave", "pay@test.com"));

        Thread.sleep(500);

        var payment = paymentQueryService.findByOrderId(order.getId().value());
        assertThat(payment.getStatus()).isIn(
            com.macmarket.payment.domain.model.PaymentStatus.COMPLETED,
            com.macmarket.payment.domain.model.PaymentStatus.FAILED
        );

        var updatedOrder = orderQueryService.findById(order.getId());
        assertThat(updatedOrder.getStatus()).isIn(OrderStatus.PAID, OrderStatus.CANCELLED);
    }
}
