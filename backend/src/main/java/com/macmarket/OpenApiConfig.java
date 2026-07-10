package com.macmarket;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "MacMarket API",
        version = "0.0.1-SNAPSHOT",
        description = "API REST du backend MacMarket — marketplace de produits Apple/tech avec architecture DDD hexagonale (Spring Modulith). Authentification via Keycloak OAuth2/OIDC (JWT Bearer).",
        contact = @Contact(name = "Équipe MacMarket")
    ),
    servers = @Server(url = "http://localhost:8080", description = "Développement local")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class OpenApiConfig {
}
