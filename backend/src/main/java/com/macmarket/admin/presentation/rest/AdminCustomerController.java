package com.macmarket.admin.presentation.rest;

import java.util.List;
import java.util.Map;

import com.macmarket.admin.application.service.AdminCustomerService;
import com.macmarket.admin.application.service.AdminOrderService;
import com.macmarket.admin.presentation.dto.AdminOrderResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@Tag(name = "Admin — Clients", description = "Consultation des clients — back-office")
@SecurityRequirement(name = "bearerAuth")
class AdminCustomerController {

    private final AdminCustomerService customerService;
    private final AdminOrderService orderService;

    AdminCustomerController(AdminCustomerService customerService,
                            AdminOrderService orderService) {
        this.customerService = customerService;
        this.orderService = orderService;
    }

    @Operation(summary = "Lister les clients")
    @ApiResponse(responseCode = "200", description = "Liste paginée des clients")
    @GetMapping
    ResponseEntity<Map<String, Object>> listCustomers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(customerService.findCustomers(page, size));
    }

    @Operation(summary = "Commandes d'un client")
    @ApiResponse(responseCode = "200", description = "Liste des commandes du client")
    @GetMapping("/{userId}/orders")
    ResponseEntity<List<AdminOrderResponse>> getCustomerOrders(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.findOrdersByUserId(userId));
    }
}
