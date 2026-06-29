package com.macmarket.user.presentation.rest;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class UserController {

    @GetMapping("/api/v1/users/me")
    Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        @SuppressWarnings("unchecked")
        var realmAccess = (Map<String, Object>) jwt.getClaims().getOrDefault("realm_access", Map.of());
        @SuppressWarnings("unchecked")
        var roles = (List<String>) realmAccess.getOrDefault("roles", List.of());

        return Map.of(
            "sub", jwt.getSubject(),
            "email", jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
            "name", jwt.getClaimAsString("name") != null ? jwt.getClaimAsString("name") : "",
            "preferredUsername", jwt.getClaimAsString("preferred_username") != null ? jwt.getClaimAsString("preferred_username") : "",
            "roles", roles
        );
    }
}
