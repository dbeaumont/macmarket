package com.macmarket.admin.application.service;

import java.util.List;
import java.util.UUID;

import com.macmarket.admin.domain.model.PageRequestSpec;
import com.macmarket.admin.domain.model.PageResult;
import com.macmarket.admin.domain.model.SortDirection;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.AdminOrderDetail;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.AdminOrderSummary;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.OrderFilter;
import com.macmarket.admin.presentation.dto.AdminOrderDetailResponse;
import com.macmarket.admin.presentation.dto.AdminOrderItemResponse;
import com.macmarket.admin.presentation.dto.AdminOrderResponse;
import com.macmarket.order.application.service.UpdateOrderStatusService;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderNotFoundException;
import com.macmarket.order.domain.model.OrderStatus;

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
    public PageResult<AdminOrderResponse> findOrders(String status, int page, int size, String sort) {
        OrderFilter filter = status != null && !status.isBlank() ? new OrderFilter(status) : OrderFilter.none();
        PageRequestSpec pageRequest = buildPageRequest(page, size, sort);
        return orderReadRepository.findOrders(filter, pageRequest).map(this::toOrderResponse);
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse findOrderById(UUID id) {
        AdminOrderDetail detail = orderReadRepository.findOrderById(id)
            .orElseThrow(() -> new OrderNotFoundException(OrderId.of(id)));

        var items = detail.items().stream()
            .map(item -> new AdminOrderItemResponse(
                item.id(), item.productId(), item.productName(),
                item.productImage(), item.unitPrice(), item.quantity(),
                item.subtotal()))
            .toList();

        return new AdminOrderDetailResponse(
            detail.id(), detail.userId(), detail.status(), detail.total(),
            detail.shippingName(), detail.shippingAddress(), detail.shippingEmail(),
            items, detail.createdAt(), detail.updatedAt()
        );
    }

    @Transactional
    public void updateStatus(UUID orderId, String newStatus) {
        OrderStatus status = OrderStatus.valueOf(newStatus);
        updateOrderStatusService.updateStatus(OrderId.of(orderId), status);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> findOrdersByUserId(String userId) {
        return orderReadRepository.findOrdersByUserId(userId).stream()
            .map(this::toOrderResponse)
            .toList();
    }

    private AdminOrderResponse toOrderResponse(AdminOrderSummary summary) {
        return new AdminOrderResponse(
            summary.id(), summary.userId(), summary.status(), summary.total(),
            summary.itemCount(), summary.shippingName(), summary.shippingAddress(),
            summary.shippingEmail(), summary.createdAt(), summary.updatedAt()
        );
    }

    private PageRequestSpec buildPageRequest(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequestSpec.of(page, size, "createdAt", SortDirection.DESC);
        }
        String[] parts = sort.split(",");
        String property = parts[0];
        SortDirection direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
            ? SortDirection.ASC : SortDirection.DESC;
        return PageRequestSpec.of(page, size, property, direction);
    }
}
