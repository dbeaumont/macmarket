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
    ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken) {
        return ResponseEntity.ok(responseMapper.toResponse(cartService.getCart(resolveOwnerKey(jwt, guestToken))));
    }

    @PostMapping("/items")
    ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
                                          @Valid @RequestBody AddToCartRequest request) {
        var cart = cartService.addItem(resolveOwnerKey(jwt, guestToken), request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(cart));
    }

    @PutMapping("/items/{productId}")
    ResponseEntity<CartResponse> updateQuantity(
        @AuthenticationPrincipal Jwt jwt,
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
        @PathVariable UUID productId,
        @Valid @RequestBody UpdateQuantityRequest request
    ) {
        return ResponseEntity.ok(responseMapper.toResponse(
            cartService.updateItemQuantity(resolveOwnerKey(jwt, guestToken), productId, request.quantity())
        ));
    }

    @DeleteMapping("/items/{productId}")
    ResponseEntity<Void> removeItem(@AuthenticationPrincipal Jwt jwt,
                                     @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
                                     @PathVariable UUID productId) {
        cartService.removeItem(resolveOwnerKey(jwt, guestToken), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt,
                                    @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken) {
        cartService.clearCart(resolveOwnerKey(jwt, guestToken));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge")
    ResponseEntity<CartResponse> merge(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MergeGuestCartRequest request) {
        var cart = cartService.mergeGuestCartIntoUser(request.guestToken(), jwt.getSubject());
        return ResponseEntity.ok(responseMapper.toResponse(cart));
    }

    private String resolveOwnerKey(Jwt jwt, String guestToken) {
        return jwt != null ? jwt.getSubject() : CartApplicationService.guestOwnerKey(guestToken);
    }
}
