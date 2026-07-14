package com.macmarket.admin.presentation.rest;

import java.util.Map;
import java.util.UUID;

import com.macmarket.admin.application.service.AdminOrderService;
import com.macmarket.admin.presentation.dto.AdminOrderDetailResponse;
import com.macmarket.admin.presentation.dto.UpdateStatusRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@Tag(name = "Admin — Commandes", description = "Gestion des commandes — back-office")
@SecurityRequirement(name = "bearerAuth")
class AdminOrderController {

    private final AdminOrderService orderService;

    AdminOrderController(AdminOrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Lister les commandes (back-office)")
    @ApiResponse(responseCode = "200", description = "Liste paginée des commandes")
    @GetMapping
    ResponseEntity<Map<String, Object>> listOrders(
        @Parameter(description = "Filtre par statut de commande", required = false) @RequestParam(required = false) String status,
        @Parameter(description = "Numéro de page (0-indexé)") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
        @Parameter(description = "Tri au format champ,direction") @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        var result = orderService.findOrders(status, page, size, sort);
        return ResponseEntity.ok(Map.of(
            "content", result.content(),
            "totalElements", result.totalElements(),
            "totalPages", result.totalPages(),
            "size", result.size(),
            "number", result.number()
        ));
    }

    @Operation(summary = "Détail d'une commande (back-office)")
    @ApiResponse(responseCode = "200", description = "Commande trouvée")
    @ApiResponse(responseCode = "404", description = "Commande introuvable")
    @GetMapping("/{id}")
    ResponseEntity<AdminOrderDetailResponse> getOrder(
        @Parameter(description = "Identifiant de la commande", required = true) @PathVariable UUID id
    ) {
        return ResponseEntity.ok(orderService.findOrderById(id));
    }

    @Operation(summary = "Modifier le statut d'une commande")
    @ApiResponse(responseCode = "204", description = "Statut mis à jour", content = @Content)
    @ApiResponse(responseCode = "400", description = "Statut invalide")
    @PutMapping("/{id}/status")
    ResponseEntity<Void> updateStatus(
        @Parameter(description = "Identifiant de la commande", required = true) @PathVariable UUID id,
        @Parameter(description = "Nouveau statut de la commande", required = true) @Valid @RequestBody UpdateStatusRequest request
    ) {
        orderService.updateStatus(id, request.status());
        return ResponseEntity.noContent().build();
    }
}
