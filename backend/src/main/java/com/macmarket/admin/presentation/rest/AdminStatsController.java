package com.macmarket.admin.presentation.rest;

import com.macmarket.admin.application.service.AdminStatsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
class AdminStatsController {

    private final AdminStatsService statsService;

    AdminStatsController(AdminStatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/{type}")
    ResponseEntity<?> getStats(@PathVariable String type, @RequestParam(defaultValue = "30d") String period) {
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
