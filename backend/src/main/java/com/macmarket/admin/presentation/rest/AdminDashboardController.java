package com.macmarket.admin.presentation.rest;

import com.macmarket.admin.application.service.AdminDashboardService;
import com.macmarket.admin.presentation.dto.DashboardResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "Admin — Tableau de bord", description = "KPIs et métriques — back-office")
@SecurityRequirement(name = "bearerAuth")
class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "KPIs et métriques du back-office")
    @ApiResponse(responseCode = "200", description = "Tableau de bord")
    @GetMapping
    ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}
