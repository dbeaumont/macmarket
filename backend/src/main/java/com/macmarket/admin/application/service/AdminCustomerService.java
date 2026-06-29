package com.macmarket.admin.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.macmarket.admin.infrastructure.persistence.repository.AdminOrderReadRepository;
import com.macmarket.admin.presentation.dto.CustomerSummaryResponse;

import org.springframework.data.domain.PageRequest;
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
        List<Object[]> rows = orderReadRepository.customerAggregation(PageRequest.of(page, size));
        long totalCustomers = orderReadRepository.countDistinctCustomers();

        List<CustomerSummaryResponse> content = rows.stream()
            .map(row -> new CustomerSummaryResponse(
                (String) row[0],
                (Long) row[1],
                toBigDecimal(row[2]),
                (Instant) row[3]))
            .toList();

        int totalPages = size > 0 ? (int) Math.ceil((double) totalCustomers / size) : 1;

        return Map.of(
            "content", content,
            "totalElements", totalCustomers,
            "totalPages", totalPages,
            "size", size,
            "number", page
        );
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
