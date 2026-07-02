package com.macmarket.cart.application.service;

import java.util.UUID;

import com.macmarket.cart.domain.model.Cart;
import com.macmarket.cart.domain.repository.CartRepository;
import com.macmarket.catalog.application.service.CatalogQueryService;
import com.macmarket.catalog.domain.model.ProductId;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CartApplicationService {

    private static final String GUEST_PREFIX = "guest:";

    private final CartRepository cartRepository;
    private final CatalogQueryService catalogService;

    public CartApplicationService(CartRepository cartRepository, CatalogQueryService catalogService) {
        this.cartRepository = cartRepository;
        this.catalogService = catalogService;
    }

    public static String guestOwnerKey(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) {
            throw new IllegalArgumentException("Guest cart token is required");
        }
        return GUEST_PREFIX + guestToken;
    }

    @Transactional(readOnly = true)
    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
            .orElseGet(() -> Cart.create(userId));
    }

    public Cart addItem(String userId, UUID productId, int quantity) {
        var product = catalogService.findById(ProductId.of(productId));
        var cart = getOrCreate(userId);
        cart.addItem(productId, product.getName(), product.getImageUrl(), product.getPrice().amount(), quantity);
        cartRepository.save(cart);
        return cart;
    }

    public Cart updateItemQuantity(String userId, UUID productId, int quantity) {
        var cart = getOrCreate(userId);
        cart.updateItemQuantity(productId, quantity);
        cartRepository.save(cart);
        return cart;
    }

    public Cart removeItem(String userId, UUID productId) {
        var cart = getOrCreate(userId);
        cart.removeItem(productId);
        cartRepository.save(cart);
        return cart;
    }

    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.clear();
            cartRepository.save(cart);
        });
    }

    public int cleanupAbandonedCarts(java.time.Instant cutoff) {
        return cartRepository.deleteAbandonedCarts(cutoff);
    }

    public Cart mergeGuestCartIntoUser(String guestToken, String userId) {
        String guestKey = guestOwnerKey(guestToken);
        var userCart = getOrCreate(userId);
        cartRepository.findByUserId(guestKey).ifPresent(guestCart -> {
            for (var item : guestCart.getItems()) {
                userCart.addItem(item.getProductId(), item.getProductName(),
                    item.getProductImage(), item.getUnitPrice(), item.getQuantity());
            }
            cartRepository.save(userCart);
            cartRepository.deleteByUserId(guestKey);
        });
        return userCart;
    }

    private Cart getOrCreate(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            var cart = Cart.create(userId);
            cartRepository.save(cart);
            return cart;
        });
    }
}
