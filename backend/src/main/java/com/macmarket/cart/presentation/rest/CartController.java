package com.macmarket.cart.presentation.rest;

import java.util.UUID;

import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.cart.presentation.dto.*;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@Tag(name = "Panier", description = "Gestion du panier — visiteur ou utilisateur connecté")
class CartController {

    private final CartApplicationService cartService;
    private final CartResponseMapper responseMapper;

    CartController(CartApplicationService cartService, CartResponseMapper responseMapper) {
        this.cartService = cartService;
        this.responseMapper = responseMapper;
    }

    @Operation(summary = "Récupérer le panier courant")
    @ApiResponse(responseCode = "200", description = "Panier courant")
    @GetMapping
    ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken) {
        return ResponseEntity.ok(responseMapper.toResponse(cartService.getCart(resolveOwnerKey(jwt, guestToken))));
    }

    @Operation(summary = "Ajouter un article au panier")
    @ApiResponse(responseCode = "201", description = "Article ajouté")
    @PostMapping("/items")
    ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal Jwt jwt,
                                          @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
                                          @Valid @RequestBody AddToCartRequest request) {
        var cart = cartService.addItem(resolveOwnerKey(jwt, guestToken), request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(cart));
    }

    @Operation(summary = "Modifier la quantité d'un article")
    @ApiResponse(responseCode = "200", description = "Quantité mise à jour")
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

    @Operation(summary = "Supprimer un article du panier")
    @ApiResponse(responseCode = "204", description = "Article supprimé")
    @DeleteMapping("/items/{productId}")
    ResponseEntity<Void> removeItem(@AuthenticationPrincipal Jwt jwt,
                                     @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
                                     @PathVariable UUID productId) {
        cartService.removeItem(resolveOwnerKey(jwt, guestToken), productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Vider le panier")
    @ApiResponse(responseCode = "204", description = "Panier vidé")
    @DeleteMapping
    ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt,
                                    @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken) {
        cartService.clearCart(resolveOwnerKey(jwt, guestToken));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Fusionner le panier visiteur avec le panier authentifié", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Panier fusionné")
    @PostMapping("/merge")
    ResponseEntity<CartResponse> merge(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MergeGuestCartRequest request) {
        var cart = cartService.mergeGuestCartIntoUser(request.guestToken(), jwt.getSubject());
        return ResponseEntity.ok(responseMapper.toResponse(cart));
    }

    private String resolveOwnerKey(Jwt jwt, String guestToken) {
        return jwt != null ? jwt.getSubject() : CartApplicationService.guestOwnerKey(guestToken);
    }
}
