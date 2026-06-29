package com.macmarket.cart.presentation.rest;

import java.util.UUID;

import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.cart.presentation.dto.*;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
class CartController {

    private final CartApplicationService cartService;
    private final CartResponseMapper responseMapper;

    CartController(CartApplicationService cartService, CartResponseMapper responseMapper) {
        this.cartService = cartService;
        this.responseMapper = responseMapper;
    }

    @GetMapping
    ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(responseMapper.toResponse(cartService.getCart(jwt.getSubject())));
    }

    @PostMapping("/items")
    ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddToCartRequest request) {
        var cart = cartService.addItem(jwt.getSubject(), request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(cart));
    }

    @PutMapping("/items/{productId}")
    ResponseEntity<CartResponse> updateQuantity(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID productId,
        @Valid @RequestBody UpdateQuantityRequest request
    ) {
        return ResponseEntity.ok(responseMapper.toResponse(
            cartService.updateItemQuantity(jwt.getSubject(), productId, request.quantity())
        ));
    }

    @DeleteMapping("/items/{productId}")
    ResponseEntity<Void> removeItem(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID productId) {
        cartService.removeItem(jwt.getSubject(), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getSubject());
        return ResponseEntity.noContent().build();
    }
}
