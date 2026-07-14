package com.macmarket.admin.application.service;

import java.util.Map;
import java.util.Optional;

import com.macmarket.UserId;
import com.macmarket.admin.domain.model.PageRequestSpec;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository;
import com.macmarket.admin.presentation.dto.CustomerProfileResponse;
import com.macmarket.admin.presentation.dto.CustomerSummaryResponse;
import com.macmarket.user.application.service.ShippingProfileApplicationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final AdminOrderReadRepository orderReadRepository;
    private final ShippingProfileApplicationService shippingProfileService;

    public AdminCustomerService(AdminOrderReadRepository orderReadRepository,
                                ShippingProfileApplicationService shippingProfileService) {
        this.orderReadRepository = orderReadRepository;
        this.shippingProfileService = shippingProfileService;
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

    public Optional<CustomerProfileResponse> findProfile(String userId) {
        return shippingProfileService.findByUserId(UserId.of(userId))
            .map(profile -> new CustomerProfileResponse(
                userId, profile.getName(), profile.getAddress(), profile.getEmail().value()));
    }
}
