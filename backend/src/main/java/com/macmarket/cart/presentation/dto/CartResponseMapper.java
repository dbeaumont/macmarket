package com.macmarket.cart.presentation.dto;

import com.macmarket.cart.domain.model.Cart;

import org.springframework.stereotype.Component;

@Component
public class CartResponseMapper {

    public CartResponse toResponse(Cart cart) {
        var items = cart.getItems().stream()
            .map(i -> new CartItemResponse(
                i.getProductId(), i.getProductName(), i.getProductImage(),
                i.getUnitPrice(), i.getQuantity(), i.subtotal()
            ))
            .toList();
        return new CartResponse(
            cart.getId() != null ? cart.getId().value() : null,
            cart.getUserId(), items, cart.total()
        );
    }
}
