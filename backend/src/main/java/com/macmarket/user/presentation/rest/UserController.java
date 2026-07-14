package com.macmarket.user.presentation.rest;

import java.util.List;
import java.util.Map;

import com.macmarket.UserId;
import com.macmarket.user.application.service.ShippingProfileApplicationService;
import com.macmarket.user.presentation.dto.ShippingProfileResponse;
import com.macmarket.user.presentation.dto.UserProfileResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Utilisateurs", description = "Profil de l'utilisateur connecté")
@SecurityRequirement(name = "bearerAuth")
class UserController {

    private final ShippingProfileApplicationService shippingProfileService;

    UserController(ShippingProfileApplicationService shippingProfileService) {
        this.shippingProfileService = shippingProfileService;
    }

    @Operation(summary = "Profil de l'utilisateur connecté")
    @ApiResponse(responseCode = "200", description = "Données du profil")
    @GetMapping("/api/v1/users/me")
    UserProfileResponse me(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        @SuppressWarnings("unchecked")
        var realmAccess = (Map<String, Object>) jwt.getClaims().getOrDefault("realm_access", Map.of());
        @SuppressWarnings("unchecked")
        var roles = (List<String>) realmAccess.getOrDefault("roles", List.of());

        return new UserProfileResponse(
            jwt.getSubject(),
            jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
            jwt.getClaimAsString("name") != null ? jwt.getClaimAsString("name") : "",
            jwt.getClaimAsString("preferred_username") != null ? jwt.getClaimAsString("preferred_username") : "",
            roles
        );
    }

    @Operation(summary = "Profil de livraison sauvegardé")
    @ApiResponse(responseCode = "200", description = "Profil de livraison trouvé")
    @ApiResponse(responseCode = "204", description = "Aucun profil de livraison enregistré", content = @Content)
    @GetMapping("/api/v1/users/me/shipping-profile")
    ResponseEntity<ShippingProfileResponse> myShippingProfile(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return shippingProfileService.findByUserId(UserId.of(jwt.getSubject()))
            .map(profile -> ResponseEntity.ok(new ShippingProfileResponse(profile.getName(), profile.getAddress(), profile.getEmail().value())))
            .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
