package com.macmarket.admin.application.service;

import java.util.List;
import java.util.UUID;

import com.macmarket.admin.infrastructure.persistence.entity.AdminOrderEntity;
import com.macmarket.admin.infrastructure.persistence.repository.AdminOrderReadRepository;
import com.macmarket.admin.presentation.dto.AdminOrderDetailResponse;
import com.macmarket.admin.presentation.dto.AdminOrderItemResponse;
import com.macmarket.admin.presentation.dto.AdminOrderResponse;
import com.macmarket.order.application.service.UpdateOrderStatusService;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderNotFoundException;
import com.macmarket.order.domain.model.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderService {

    private final AdminOrderReadRepository orderReadRepository;
    private final UpdateOrderStatusService updateOrderStatusService;

    public AdminOrderService(AdminOrderReadRepository orderReadRepository,
                             UpdateOrderStatusService updateOrderStatusService) {
        this.orderReadRepository = orderReadRepository;
        this.updateOrderStatusService = updateOrderStatusService;
    }

    @Transactional(readOnly = true)
    public Page<AdminOrderResponse> findOrders(String status, int page, int size, String sort) {
        PageRequest pageRequest = buildPageRequest(page, size, sort);

        Page<AdminOrderEntity> result;
        if (status != null && !status.isBlank()) {
            result = orderReadRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
        } else {
            result = orderReadRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        return result.map(this::toOrderResponse);
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse findOrderById(UUID id) {
        AdminOrderEntity entity = orderReadRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(OrderId.of(id)));

        var items = entity.getItems().stream()
            .map(item -> new AdminOrderItemResponse(
                item.getId(), item.getProductId(), item.getProductName(),
                item.getProductImage(), item.getUnitPrice(), item.getQuantity(),
                item.getSubtotal()))
            .toList();

        return new AdminOrderDetailResponse(
            entity.getId(), entity.getUserId(), entity.getStatus(), entity.getTotal(),
            entity.getShippingName(), entity.getShippingAddress(), entity.getShippingEmail(),
            items, entity.getCreatedAt(), entity.getUpdatedAt()
        );
    }

    @Transactional
    public void updateStatus(UUID orderId, String newStatus) {
        OrderStatus status = OrderStatus.valueOf(newStatus);
        updateOrderStatusService.updateStatus(OrderId.of(orderId), status);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> findOrdersByUserId(String userId) {
        return orderReadRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::toOrderResponse)
            .toList();
    }

    private AdminOrderResponse toOrderResponse(AdminOrderEntity entity) {
        return new AdminOrderResponse(
            entity.getId(), entity.getUserId(), entity.getStatus(), entity.getTotal(),
            entity.getItems().size(), entity.getShippingName(), entity.getShippingAddress(),
            entity.getShippingEmail(), entity.getCreatedAt(), entity.getUpdatedAt()
        );
    }

    private PageRequest buildPageRequest(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        String[] parts = sort.split(",");
        String property = parts[0];
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, property));
    }
}
