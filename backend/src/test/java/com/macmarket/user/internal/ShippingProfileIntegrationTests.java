package com.macmarket.user.internal;

import java.util.UUID;

import com.macmarket.UserId;
import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.order.application.command.PlaceOrderCommand;
import com.macmarket.order.application.service.PlaceOrderService;
import com.macmarket.user.application.service.ShippingProfileApplicationService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
class ShippingProfileIntegrationTests {

    @Autowired PlaceOrderService placeOrderService;
    @Autowired CartApplicationService cartService;
    @Autowired CatalogQueryService catalogService;
    @Autowired ShippingProfileApplicationService shippingProfileService;

    @Test
    void shouldHaveNoProfileForNewUser() {
        var userId = UserId.of("shipping-test-" + UUID.randomUUID());

        assertThat(shippingProfileService.findByUserId(userId)).isEmpty();
    }

    @Test
    void shouldSaveShippingProfileWhenOrderIsPlaced() throws InterruptedException {
        var userId = UserId.of("shipping-test-" + UUID.randomUUID());
        var product = catalogService.findBySlug("mac-mini-m4-16-256");
        cartService.addItem(userId.value(), product.getId().value(), 1);

        placeOrderService.execute(new PlaceOrderCommand(userId, "Jean Dupont", "1 rue de Paris", "jean@test.com"));

        Thread.sleep(500);

        var profile = shippingProfileService.findByUserId(userId).orElseThrow();
        assertThat(profile.getName()).isEqualTo("Jean Dupont");
        assertThat(profile.getAddress()).isEqualTo("1 rue de Paris");
        assertThat(profile.getEmail().value()).isEqualTo("jean@test.com");
    }

    @Test
    void shouldUpdateShippingProfileOnSubsequentOrder() throws InterruptedException {
        var userId = UserId.of("shipping-test-" + UUID.randomUUID());
        var product = catalogService.findBySlug("mac-mini-m4-16-512");

        cartService.addItem(userId.value(), product.getId().value(), 1);
        placeOrderService.execute(new PlaceOrderCommand(userId, "Jean Dupont", "1 rue de Paris", "jean@test.com"));
        Thread.sleep(500);

        cartService.addItem(userId.value(), product.getId().value(), 1);
        placeOrderService.execute(new PlaceOrderCommand(userId, "Jean D.", "2 avenue de Lyon", "jean.d@test.com"));
        Thread.sleep(500);

        var profile = shippingProfileService.findByUserId(userId).orElseThrow();
        assertThat(profile.getName()).isEqualTo("Jean D.");
        assertThat(profile.getAddress()).isEqualTo("2 avenue de Lyon");
        assertThat(profile.getEmail().value()).isEqualTo("jean.d@test.com");
    }
}
