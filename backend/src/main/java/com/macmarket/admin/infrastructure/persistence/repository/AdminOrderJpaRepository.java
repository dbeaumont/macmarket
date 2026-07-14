package com.macmarket.admin.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.macmarket.admin.domain.model.PageRequestSpec;
import com.macmarket.admin.domain.model.PageResult;
import com.macmarket.admin.domain.model.SortDirection;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.AdminOrderDetail;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.AdminOrderItem;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.AdminOrderSummary;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.CustomerSummary;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.DailyOrderCount;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.DailyRevenue;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.OrderFilter;
import com.macmarket.admin.domain.repository.AdminOrderReadRepository.StatusCount;
import com.macmarket.admin.infrastructure.persistence.entity.AdminOrderItemJpaEntity;
import com.macmarket.admin.infrastructure.persistence.entity.AdminOrderJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Adaptateur JPA du port {@link AdminOrderReadRepository}. Seule cette classe (et
 * {@link AdminOrderSpringDataRepository} qu'elle enveloppe) connaît Spring Data —
 * la couche application ne manipule que des types du domaine.
 */
@Component
class AdminOrderJpaRepository implements AdminOrderReadRepository {

    private final AdminOrderSpringDataRepository springData;

    AdminOrderJpaRepository(AdminOrderSpringDataRepository springData) {
        this.springData = springData;
    }

    @Override
    public PageResult<AdminOrderSummary> findOrders(OrderFilter filter, PageRequestSpec pageRequest) {
        Pageable pageable = toPageable(pageRequest, "createdAt");
        Page<AdminOrderJpaEntity> result = filter.hasStatus()
            ? springData.findByStatusOrderByCreatedAtDesc(filter.status(), pageable)
            : springData.findAllByOrderByCreatedAtDesc(pageable);
        return PageResult.of(
            result.getContent().stream().map(this::toSummary).toList(),
            result.getTotalElements(), result.getSize(), result.getNumber());
    }

    @Override
    public Optional<AdminOrderDetail> findOrderById(UUID id) {
        return springData.findById(id).map(this::toDetail);
    }

    @Override
    public List<AdminOrderSummary> findOrdersByUserId(String userId) {
        return springData.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::toSummary)
            .toList();
    }

    @Override
    public List<AdminOrderSummary> findRecentOrders(int limit) {
        return springData.findRecentOrders(PageRequest.of(0, limit)).stream()
            .map(this::toSummary)
            .toList();
    }

    @Override
    public long count() {
        return springData.count();
    }

    @Override
    public long countOrdersSince(Instant since) {
        return springData.countOrdersSince(since);
    }

    @Override
    public BigDecimal sumRevenueSince(Instant since) {
        return springData.sumRevenueSince(since);
    }

    @Override
    public List<StatusCount> countByStatus() {
        return springData.countByStatus().stream()
            .map(row -> new StatusCount((String) row[0], (Long) row[1]))
            .toList();
    }

    @Override
    public List<StatusCount> countByStatusSince(Instant since) {
        return springData.countByStatusSince(since).stream()
            .map(row -> new StatusCount((String) row[0], (Long) row[1]))
            .toList();
    }

    @Override
    public List<DailyRevenue> revenueByDay(Instant since) {
        return springData.revenueByDay(since).stream()
            .map(row -> new DailyRevenue(row[0].toString(), toBigDecimal(row[1])))
            .toList();
    }

    @Override
    public List<DailyOrderCount> ordersByDay(Instant since) {
        return springData.ordersByDay(since).stream()
            .map(row -> new DailyOrderCount(row[0].toString(), ((Number) row[1]).longValue()))
            .toList();
    }

    @Override
    public long countDistinctCustomers() {
        return springData.countDistinctCustomers();
    }

    @Override
    public long countNewCustomersSince(Instant since) {
        return springData.countNewCustomersSince(since);
    }

    @Override
    public PageResult<CustomerSummary> customerAggregation(PageRequestSpec pageRequest) {
        Pageable pageable = toPageable(pageRequest, null);
        List<CustomerSummary> content = springData.customerAggregation(pageable).stream()
            .map(row -> new CustomerSummary((String) row[0], (Long) row[1], toBigDecimal(row[2]), (Instant) row[3]))
            .toList();
        long total = springData.countDistinctCustomers();
        return PageResult.of(content, total, pageRequest.pageSize(), pageRequest.pageNumber());
    }

    private Pageable toPageable(PageRequestSpec spec, String defaultSortField) {
        if (spec.hasSort()) {
            Sort.Direction direction = spec.sortDirection() == SortDirection.ASC ? Sort.Direction.ASC : Sort.Direction.DESC;
            return PageRequest.of(spec.pageNumber(), spec.pageSize(), Sort.by(direction, spec.sortField()));
        }
        if (defaultSortField != null) {
            return PageRequest.of(spec.pageNumber(), spec.pageSize(), Sort.by(Sort.Direction.DESC, defaultSortField));
        }
        return PageRequest.of(spec.pageNumber(), spec.pageSize());
    }

    private AdminOrderSummary toSummary(AdminOrderJpaEntity entity) {
        return new AdminOrderSummary(
            entity.getId(), entity.getUserId(), entity.getStatus(), entity.getTotal(),
            entity.getItems().size(), entity.getShippingName(), entity.getShippingAddress(),
            entity.getShippingEmail(), entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private AdminOrderDetail toDetail(AdminOrderJpaEntity entity) {
        List<AdminOrderItem> items = entity.getItems().stream()
            .map(this::toItem)
            .toList();
        return new AdminOrderDetail(
            entity.getId(), entity.getUserId(), entity.getStatus(), entity.getTotal(),
            entity.getShippingName(), entity.getShippingAddress(), entity.getShippingEmail(),
            items, entity.getCreatedAt(), entity.getUpdatedAt());
    }

    private AdminOrderItem toItem(AdminOrderItemJpaEntity item) {
        return new AdminOrderItem(
            item.getId(), item.getProductId(), item.getProductName(), item.getProductImage(),
            item.getUnitPrice(), item.getQuantity(), item.getSubtotal());
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
