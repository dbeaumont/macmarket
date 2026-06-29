package com.macmarket.admin.presentation.rest;

import java.util.Map;
import java.util.UUID;

import com.macmarket.admin.application.service.AdminOrderService;
import com.macmarket.admin.presentation.dto.AdminOrderDetailResponse;
import com.macmarket.admin.presentation.dto.AdminOrderResponse;
import com.macmarket.admin.presentation.dto.UpdateStatusRequest;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
class AdminOrderController {

    private final AdminOrderService orderService;

    AdminOrderController(AdminOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    ResponseEntity<Map<String, Object>> listOrders(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Page<AdminOrderResponse> result = orderService.findOrders(status, page, size, sort);
        return ResponseEntity.ok(Map.of(
            "content", result.getContent(),
            "totalElements", result.getTotalElements(),
            "totalPages", result.getTotalPages(),
            "size", result.getSize(),
            "number", result.getNumber()
        ));
    }

    @GetMapping("/{id}")
    ResponseEntity<AdminOrderDetailResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.findOrderById(id));
    }

    @PutMapping("/{id}/status")
    ResponseEntity<Void> updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest request) {
        orderService.updateStatus(id, request.status());
        return ResponseEntity.noContent().build();
    }
}
