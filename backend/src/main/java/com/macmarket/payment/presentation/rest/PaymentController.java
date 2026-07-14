package com.macmarket.payment.presentation.rest;

import java.util.UUID;

import com.macmarket.payment.application.service.PaymentQueryService;
import com.macmarket.payment.presentation.dto.PaymentResponse;
import com.macmarket.payment.presentation.dto.PaymentResponseMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Paiements", description = "Consultation de l'état d'un paiement")
@SecurityRequirement(name = "bearerAuth")
class PaymentController {

    private final PaymentQueryService queryService;
    private final PaymentResponseMapper responseMapper;

    PaymentController(PaymentQueryService queryService, PaymentResponseMapper responseMapper) {
        this.queryService = queryService;
        this.responseMapper = responseMapper;
    }

    @Operation(summary = "Statut d'un paiement par commande", description = "Recupere le statut et les details du paiement associe a une commande")
    @ApiResponse(responseCode = "200", description = "Paiement trouvé")
    @ApiResponse(responseCode = "404", description = "Aucun paiement trouvé pour cette commande")
    @GetMapping("/order/{orderId}")
    ResponseEntity<PaymentResponse> getByOrderId(
        @Parameter(description = "Identifiant de la commande dont on souhaite consulter le paiement", required = true)
        @PathVariable UUID orderId
    ) {
        var payment = queryService.findByOrderId(orderId);
        return ResponseEntity.ok(responseMapper.toResponse(payment));
    }
}
