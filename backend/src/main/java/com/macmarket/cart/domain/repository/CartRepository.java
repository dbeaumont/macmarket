package com.macmarket.cart.domain.repository;

import java.util.Optional;

import com.macmarket.cart.domain.model.Cart;

public interface CartRepository {
    Optional<Cart> findByUserId(String userId);
    void save(Cart cart);
    void deleteByUserId(String userId);
    int deleteAbandonedCarts(java.time.Instant cutoff);
}
