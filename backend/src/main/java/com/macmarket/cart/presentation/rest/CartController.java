package com.macmarket.cart.presentation.rest;

import java.util.UUID;

import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.cart.presentation.dto.*;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

    @Operation(summary = "Récupérer le panier courant", description = "Retourne le panier de l'utilisateur authentifié, ou du visiteur identifié par le jeton de panier invité")
    @ApiResponse(responseCode = "200", description = "Panier courant")
    @GetMapping
    ResponseEntity<CartResponse> getCart(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton de panier invité, requis si l'appelant n'est pas authentifié", required = false)
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken
    ) {
        return ResponseEntity.ok(responseMapper.toResponse(cartService.getCart(resolveOwnerKey(jwt, guestToken))));
    }

    @Operation(summary = "Ajouter un article au panier", description = "Ajoute un produit au panier de l'utilisateur authentifié ou du visiteur, ou augmente sa quantité s'il est déjà présent")
    @ApiResponse(responseCode = "201", description = "Article ajouté")
    @ApiResponse(responseCode = "400", description = "Requête invalide (produit ou quantité manquants/invalides)")
    @ApiResponse(responseCode = "404", description = "Produit introuvable")
    @PostMapping("/items")
    ResponseEntity<CartResponse> addItem(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton de panier invité, requis si l'appelant n'est pas authentifié", required = false)
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
        @Parameter(description = "Produit à ajouter et quantité souhaitée", required = true)
        @Valid @RequestBody AddToCartRequest request
    ) {
        var cart = cartService.addItem(resolveOwnerKey(jwt, guestToken), request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(cart));
    }

    @Operation(summary = "Modifier la quantité d'un article", description = "Met à jour la quantité d'un article déjà présent dans le panier")
    @ApiResponse(responseCode = "200", description = "Quantité mise à jour")
    @ApiResponse(responseCode = "400", description = "Quantité invalide")
    @PutMapping("/items/{productId}")
    ResponseEntity<CartResponse> updateQuantity(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton de panier invité, requis si l'appelant n'est pas authentifié", required = false)
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
        @Parameter(description = "Identifiant du produit dont la quantité doit être modifiée", required = true)
        @PathVariable UUID productId,
        @Parameter(description = "Nouvelle quantité souhaitée", required = true)
        @Valid @RequestBody UpdateQuantityRequest request
    ) {
        return ResponseEntity.ok(responseMapper.toResponse(
            cartService.updateItemQuantity(resolveOwnerKey(jwt, guestToken), productId, request.quantity())
        ));
    }

    @Operation(summary = "Supprimer un article du panier", description = "Retire un produit du panier de l'utilisateur authentifié ou du visiteur")
    @ApiResponse(responseCode = "204", description = "Article supprimé")
    @DeleteMapping("/items/{productId}")
    ResponseEntity<Void> removeItem(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton de panier invité, requis si l'appelant n'est pas authentifié", required = false)
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken,
        @Parameter(description = "Identifiant du produit à retirer du panier", required = true)
        @PathVariable UUID productId
    ) {
        cartService.removeItem(resolveOwnerKey(jwt, guestToken), productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Vider le panier", description = "Supprime tous les articles du panier de l'utilisateur authentifié ou du visiteur")
    @ApiResponse(responseCode = "204", description = "Panier vidé")
    @DeleteMapping
    ResponseEntity<Void> clearCart(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton de panier invité, requis si l'appelant n'est pas authentifié", required = false)
        @RequestHeader(value = "X-Guest-Cart-Token", required = false) String guestToken
    ) {
        cartService.clearCart(resolveOwnerKey(jwt, guestToken));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Fusionner le panier visiteur avec le panier authentifié",
        description = "Transfère les articles du panier invité identifié par son jeton vers le panier de l'utilisateur authentifié, puis supprime le panier invité",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Panier fusionné")
    @ApiResponse(responseCode = "400", description = "Jeton de panier invité manquant ou invalide")
    @PostMapping("/merge")
    ResponseEntity<CartResponse> merge(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Jeton du panier invité à fusionner dans le panier authentifié", required = true)
        @Valid @RequestBody MergeGuestCartRequest request
    ) {
        var cart = cartService.mergeGuestCartIntoUser(request.guestToken(), jwt.getSubject());
        return ResponseEntity.ok(responseMapper.toResponse(cart));
    }

    private String resolveOwnerKey(Jwt jwt, String guestToken) {
        return jwt != null ? jwt.getSubject() : CartApplicationService.guestOwnerKey(guestToken);
    }
}
