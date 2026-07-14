package com.macmarket.order.presentation.rest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import com.macmarket.UserId;
import com.macmarket.order.application.command.PlaceOrderCommand;
import com.macmarket.order.application.service.InvoiceGenerator;
import com.macmarket.order.application.service.OrderQueryService;
import com.macmarket.order.application.service.PlaceOrderService;
import com.macmarket.order.presentation.dto.OrderResponse;
import com.macmarket.order.presentation.dto.OrderResponseMapper;
import com.macmarket.order.presentation.dto.PlaceOrderRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Commandes", description = "Passer et consulter ses commandes")
@SecurityRequirement(name = "bearerAuth")
class OrderController {

    private final PlaceOrderService placeOrderService;
    private final OrderQueryService queryService;
    private final OrderResponseMapper responseMapper;
    private final InvoiceGenerator invoiceGenerator;

    OrderController(PlaceOrderService placeOrderService, OrderQueryService queryService,
                     OrderResponseMapper responseMapper, InvoiceGenerator invoiceGenerator) {
        this.placeOrderService = placeOrderService;
        this.queryService = queryService;
        this.responseMapper = responseMapper;
        this.invoiceGenerator = invoiceGenerator;
    }

    @Operation(summary = "Passer une commande", description = "Cree une nouvelle commande a partir des informations de livraison fournies pour l'utilisateur authentifie")
    @ApiResponse(responseCode = "201", description = "Commande créée")
    @ApiResponse(responseCode = "400", description = "Requête invalide")
    @PostMapping
    ResponseEntity<OrderResponse> placeOrder(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Informations de livraison et contenu de la commande a passer", required = true)
        @Valid @RequestBody PlaceOrderRequest request
    ) {
        var command = new PlaceOrderCommand(
            UserId.of(jwt.getSubject()), request.shippingName(), request.shippingAddress(), request.shippingEmail()
        );
        var order = placeOrderService.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMapper.toResponse(order));
    }

    @Operation(summary = "Mes commandes", description = "Liste l'ensemble des commandes de l'utilisateur authentifie")
    @ApiResponse(responseCode = "200", description = "Liste des commandes")
    @GetMapping
    ResponseEntity<List<OrderResponse>> listOrders(@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        var orders = queryService.findByUserId(UserId.of(jwt.getSubject())).stream()
            .map(responseMapper::toResponse).toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Détail d'une commande", description = "Recupere le detail d'une commande appartenant a l'utilisateur authentifie")
    @ApiResponse(responseCode = "200", description = "Commande trouvée")
    @ApiResponse(responseCode = "404", description = "Commande introuvable ou n'appartenant pas a l'utilisateur authentifie")
    @GetMapping("/{id}")
    ResponseEntity<OrderResponse> getOrder(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Identifiant de la commande a consulter", required = true)
        @PathVariable UUID id
    ) {
        var order = queryService.findByIdForUser(id, UserId.of(jwt.getSubject()));
        return ResponseEntity.ok(responseMapper.toResponse(order));
    }

    @Operation(summary = "Télécharger la facture PDF", description = "Genere et telecharge la facture PDF d'une commande appartenant a l'utilisateur authentifie")
    @ApiResponse(responseCode = "200", description = "PDF de la facture",
            content = @Content(mediaType = "application/pdf"))
    @ApiResponse(responseCode = "404", description = "Commande introuvable ou n'appartenant pas a l'utilisateur authentifie")
    @GetMapping("/{id}/invoice")
    ResponseEntity<byte[]> downloadInvoice(
        @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
        @Parameter(description = "Identifiant de la commande dont la facture doit etre telechargee", required = true)
        @PathVariable UUID id
    ) throws IOException {
        var order = queryService.findByIdForUser(id, UserId.of(jwt.getSubject()));
        var pdf = invoiceGenerator.generate(order);
        return ResponseEntity.ok()
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition", "attachment; filename=facture-" + id.toString().substring(0, 8) + ".pdf")
            .body(pdf);
    }
}
