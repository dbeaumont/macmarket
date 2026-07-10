package com.macmarket;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/products/**", "/api/v1/categories/**").permitAll()
                .requestMatchers("/api/v1/admin/stats/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/cart/merge").authenticated()
                .requestMatchers("/api/v1/cart/**").permitAll()
                .requestMatchers("/api/v1/**").authenticated()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(this::resolveBearerToken)
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter()))
            )
            .build();
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/products") || path.startsWith("/api/v1/categories")) {
            return null; // Endpoints publics : pas de validation de token
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private JwtAuthenticationConverter keycloakJwtConverter() {
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            @SuppressWarnings("unchecked")
            var realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
            if (realmAccess == null) return List.of();
            @SuppressWarnings("unchecked")
            var roles = (List<String>) realmAccess.get("roles");
            if (roles == null) return List.of();
            return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        });
        return converter;
    }
}
