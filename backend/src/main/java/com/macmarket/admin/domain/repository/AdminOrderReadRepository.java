package com.macmarket.admin.domain.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.macmarket.admin.domain.model.PageRequestSpec;
import com.macmarket.admin.domain.model.PageResult;

/**
 * Port de lecture (query) pour les commandes, côté back-office.
 *
 * Le module admin est un consommateur en lecture seule des données d'autres bounded
 * contexts (order, catalog) à des fins de reporting — il n'expose pas d'agrégat
 * métier propre. Ce port parle donc un langage de "read model" plutôt que celui
 * d'un agrégat avec invariants, mais reste un port du domaine : aucune dépendance
 * Spring Data / JPA n'apparaît dans cette interface.
 */
public interface AdminOrderReadRepository {

    PageResult<AdminOrderSummary> findOrders(OrderFilter filter, PageRequestSpec pageRequest);

    Optional<AdminOrderDetail> findOrderById(UUID id);

    List<AdminOrderSummary> findOrdersByUserId(String userId);

    List<AdminOrderSummary> findRecentOrders(int limit);

    long count();

    long countOrdersSince(Instant since);

    BigDecimal sumRevenueSince(Instant since);

    List<StatusCount> countByStatus();

    List<StatusCount> countByStatusSince(Instant since);

    List<DailyRevenue> revenueByDay(Instant since);

    List<DailyOrderCount> ordersByDay(Instant since);

    long countDistinctCustomers();

    long countNewCustomersSince(Instant since);

    PageResult<CustomerSummary> customerAggregation(PageRequestSpec pageRequest);

    record OrderFilter(String status) {

        public static OrderFilter none() {
            return new OrderFilter(null);
        }

        public boolean hasStatus() {
            return status != null && !status.isBlank();
        }
    }

    record AdminOrderSummary(
        UUID id,
        String userId,
        String status,
        BigDecimal total,
        int itemCount,
        String shippingName,
        String shippingAddress,
        String shippingEmail,
        Instant createdAt,
        Instant updatedAt
    ) {}

    record AdminOrderItem(
        UUID id,
        UUID productId,
        String productName,
        String productImage,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal
    ) {}

    record AdminOrderDetail(
        UUID id,
        String userId,
        String status,
        BigDecimal total,
        String shippingName,
        String shippingAddress,
        String shippingEmail,
        List<AdminOrderItem> items,
        Instant createdAt,
        Instant updatedAt
    ) {
        public AdminOrderDetail {
            items = List.copyOf(items);
        }
    }

    record StatusCount(String status, long count) {}

    record DailyRevenue(String day, BigDecimal revenue) {}

    record DailyOrderCount(String day, long count) {}

    record CustomerSummary(String userId, long orderCount, BigDecimal totalSpent, Instant lastOrderDate) {}
}
