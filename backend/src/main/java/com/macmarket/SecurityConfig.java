package com.macmarket;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

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
                .requestMatchers("/api/v1/products/**", "/api/v1/categories/**").permitAll()
                .requestMatchers("/api/v1/admin/stats/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers("/api/v1/**").authenticated()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter()))
            )
            .build();
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
