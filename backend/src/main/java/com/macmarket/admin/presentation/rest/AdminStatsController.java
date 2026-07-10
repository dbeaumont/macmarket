package com.macmarket.admin.presentation.rest;

import com.macmarket.admin.application.service.AdminStatsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Statistiques", description = "Statistiques détaillées — ROLE_ADMIN requis")
@SecurityRequirement(name = "bearerAuth")
class AdminStatsController {

    private final AdminStatsService statsService;

    AdminStatsController(AdminStatsService statsService) {
        this.statsService = statsService;
    }

    @Operation(summary = "Statistiques par type")
    @ApiResponse(responseCode = "200", description = "Statistiques calculées")
    @ApiResponse(responseCode = "400", description = "Type de statistique inconnu")
    @GetMapping("/{type}")
    ResponseEntity<?> getStats(
            @Parameter(name = "type", description = "Type de statistique", in = ParameterIn.PATH,
                    schema = @Schema(type = "string", allowableValues = {"revenue", "products", "customers", "orders"}))
            @PathVariable String type,
            @RequestParam(defaultValue = "30d") String period) {
        return switch (type) {
            case "revenue" -> ResponseEntity.ok(statsService.getRevenueStats(period));
            case "products" -> ResponseEntity.ok(statsService.getProductStats(period));
            case "customers" -> ResponseEntity.ok(statsService.getCustomerStats(period));
            case "orders" -> ResponseEntity.ok(statsService.getOrderStats(period));
            default -> ResponseEntity.badRequest().body(
                java.util.Map.of("code", "BAD_REQUEST", "message", "Unknown stats type: " + type));
        };
    }
}
