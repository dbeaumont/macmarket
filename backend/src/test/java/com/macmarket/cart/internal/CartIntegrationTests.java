package com.macmarket.cart.internal;

import java.math.BigDecimal;
import java.util.UUID;

import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.domain.model.Product;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
class CartIntegrationTests {

    @Autowired
    CartApplicationService cartService;

    @Autowired
    CatalogQueryService catalogService;

    private final String userId = "test-user-" + UUID.randomUUID();
    private Product testProduct;

    @BeforeEach
    void setup() {
        testProduct = catalogService.findBySlug("mac-mini-m4-16-256");
    }

    @Test
    void shouldReturnEmptyCartForNewUser() {
        var cart = cartService.getCart(userId);
        assertThat(cart.getItems()).isEmpty();
        assertThat(cart.total()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void shouldAddItemToCart() {
        var cart = cartService.addItem(userId, testProduct.getId().value(), 1);

        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().getFirst().getProductId()).isEqualTo(testProduct.getId().value());
        assertThat(cart.getItems().getFirst().getProductName()).isEqualTo(testProduct.getName());
        assertThat(cart.getItems().getFirst().getUnitPrice()).isEqualByComparingTo(testProduct.getPrice().amount());
        assertThat(cart.getItems().getFirst().getQuantity()).isEqualTo(1);
        assertThat(cart.total()).isEqualByComparingTo(testProduct.getPrice().amount());
    }

    @Test
    void shouldIncrementQuantityWhenAddingSameProduct() {
        cartService.addItem(userId, testProduct.getId().value(), 1);
        var cart = cartService.addItem(userId, testProduct.getId().value(), 2);

        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().getFirst().getQuantity()).isEqualTo(3);
        assertThat(cart.total()).isEqualByComparingTo(testProduct.getPrice().amount().multiply(BigDecimal.valueOf(3)));
    }

    @Test
    void shouldAddMultipleProducts() {
        var product2 = catalogService.findBySlug("macbook-air-13-m4-16-256-skyblue");

        cartService.addItem(userId, testProduct.getId().value(), 1);
        var cart = cartService.addItem(userId, product2.getId().value(), 2);

        assertThat(cart.getItems()).hasSize(2);
        var expected = testProduct.getPrice().amount().add(product2.getPrice().amount().multiply(BigDecimal.valueOf(2)));
        assertThat(cart.total()).isEqualByComparingTo(expected);
    }

    @Test
    void shouldUpdateItemQuantity() {
        cartService.addItem(userId, testProduct.getId().value(), 1);
        var cart = cartService.updateItemQuantity(userId, testProduct.getId().value(), 5);

        assertThat(cart.getItems().getFirst().getQuantity()).isEqualTo(5);
        assertThat(cart.total()).isEqualByComparingTo(testProduct.getPrice().amount().multiply(BigDecimal.valueOf(5)));
    }

    @Test
    void shouldRemoveItem() {
        cartService.addItem(userId, testProduct.getId().value(), 1);
        var cart = cartService.removeItem(userId, testProduct.getId().value());

        assertThat(cart.getItems()).isEmpty();
        assertThat(cart.total()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void shouldClearCart() {
        var product2 = catalogService.findBySlug("macbook-air-13-m4-16-256-skyblue");
        cartService.addItem(userId, testProduct.getId().value(), 1);
        cartService.addItem(userId, product2.getId().value(), 1);

        cartService.clearCart(userId);

        var cart = cartService.getCart(userId);
        assertThat(cart.getItems()).isEmpty();
    }

    @Test
    void shouldSnapshotProductData() {
        var cart = cartService.addItem(userId, testProduct.getId().value(), 1);
        var item = cart.getItems().getFirst();

        assertThat(item.getProductName()).isEqualTo("Mac Mini M4 16Go/256Go");
        assertThat(item.getProductImage()).isNotBlank();
        assertThat(item.getUnitPrice()).isEqualByComparingTo(new BigDecimal("699.00"));
    }
}
