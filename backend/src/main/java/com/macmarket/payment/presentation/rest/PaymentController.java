package com.macmarket.payment.presentation.rest;

import java.util.UUID;

import com.macmarket.payment.application.service.PaymentQueryService;
import com.macmarket.payment.presentation.dto.PaymentResponse;
import com.macmarket.payment.presentation.dto.PaymentResponseMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
class PaymentController {

    private final PaymentQueryService queryService;
    private final PaymentResponseMapper responseMapper;

    PaymentController(PaymentQueryService queryService, PaymentResponseMapper responseMapper) {
        this.queryService = queryService;
        this.responseMapper = responseMapper;
    }

    @GetMapping("/order/{orderId}")
    ResponseEntity<PaymentResponse> getByOrderId(@PathVariable UUID orderId) {
        var payment = queryService.findByOrderId(orderId);
        return ResponseEntity.ok(responseMapper.toResponse(payment));
    }
}
