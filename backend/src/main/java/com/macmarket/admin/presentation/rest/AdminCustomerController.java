package com.macmarket.admin.presentation.rest;

import java.util.List;
import java.util.Map;

import com.macmarket.admin.application.service.AdminCustomerService;
import com.macmarket.admin.application.service.AdminOrderService;
import com.macmarket.admin.presentation.dto.AdminOrderResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
class AdminCustomerController {

    private final AdminCustomerService customerService;
    private final AdminOrderService orderService;

    AdminCustomerController(AdminCustomerService customerService,
                            AdminOrderService orderService) {
        this.customerService = customerService;
        this.orderService = orderService;
    }

    @GetMapping
    ResponseEntity<Map<String, Object>> listCustomers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(customerService.findCustomers(page, size));
    }

    @GetMapping("/{userId}/orders")
    ResponseEntity<List<AdminOrderResponse>> getCustomerOrders(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.findOrdersByUserId(userId));
    }
}
