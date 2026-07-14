package com.macmarket.admin.application.service;

import java.util.Map;

import com.macmarket.admin.domain.model.PageRequestSpec;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository;
import com.macmarket.admin.presentation.dto.CustomerSummaryResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final AdminOrderReadRepository orderReadRepository;

    public AdminCustomerService(AdminOrderReadRepository orderReadRepository) {
        this.orderReadRepository = orderReadRepository;
    }

    public Map<String, Object> findCustomers(int page, int size) {
        var result = orderReadRepository.customerAggregation(PageRequestSpec.of(page, size))
            .map(summary -> new CustomerSummaryResponse(
                summary.userId(), summary.orderCount(), summary.totalSpent(), summary.lastOrderDate()));

        return Map.of(
            "content", result.content(),
            "totalElements", result.totalElements(),
            "totalPages", result.totalPages(),
            "size", result.size(),
            "number", result.number()
        );
    }
}
