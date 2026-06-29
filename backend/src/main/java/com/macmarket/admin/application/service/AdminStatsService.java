package com.macmarket.admin.application.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

import com.macmarket.admin.infrastructure.persistence.repository.AdminOrderReadRepository;
import com.macmarket.admin.infrastructure.persistence.repository.AdminProductReadRepository;
import com.macmarket.admin.presentation.dto.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminStatsService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final AdminOrderReadRepository orderReadRepository;
    private final AdminProductReadRepository productReadRepository;

    public AdminStatsService(AdminOrderReadRepository orderReadRepository,
                             AdminProductReadRepository productReadRepository) {
        this.orderReadRepository = orderReadRepository;
        this.productReadRepository = productReadRepository;
    }

    public RevenueStatsResponse getRevenueStats(String period) {
        Instant since = parsePeriod(period);
        BigDecimal totalRevenue = orderReadRepository.sumRevenueSince(since);
        long orderCount = orderReadRepository.countOrdersSince(since);
        BigDecimal averageOrderValue = orderCount > 0
            ? totalRevenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        var chart = orderReadRepository.revenueByDay(since).stream()
            .map(row -> new RevenueChartPoint(row[0].toString(), toBigDecimal(row[1])))
            .toList();

        return new RevenueStatsResponse(totalRevenue, averageOrderValue, orderCount, chart);
    }

    public ProductStatsResponse getProductStats(String period) {
        long totalProducts = productReadRepository.count();
        long activeProducts = productReadRepository.countByActiveTrue();
        long lowStockCount = productReadRepository.countLowStock(LOW_STOCK_THRESHOLD);

        var lowStockProducts = productReadRepository.findLowStockProducts(LOW_STOCK_THRESHOLD).stream()
            .map(p -> new LowStockProductDto(
                p.getId(), p.getName(), p.getCategory(), p.getPrice(),
                p.getStockQuantity(), p.getReservedQuantity(),
                p.getStockQuantity() - p.getReservedQuantity()))
            .toList();

        return new ProductStatsResponse(totalProducts, activeProducts, lowStockCount, lowStockProducts);
    }

    public CustomerStatsResponse getCustomerStats(String period) {
        Instant since = parsePeriod(period);
        long totalCustomers = orderReadRepository.countDistinctCustomers();
        long newCustomers = orderReadRepository.countNewCustomersSince(since);
        BigDecimal totalRevenue = orderReadRepository.sumRevenueSince(Instant.EPOCH);
        BigDecimal averageSpent = totalCustomers > 0
            ? totalRevenue.divide(BigDecimal.valueOf(totalCustomers), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        return new CustomerStatsResponse(totalCustomers, newCustomers, averageSpent, totalRevenue);
    }

    public OrderStatsResponse getOrderStats(String period) {
        Instant since = parsePeriod(period);
        long totalOrders = orderReadRepository.countOrdersSince(since);
        BigDecimal totalRevenue = orderReadRepository.sumRevenueSince(since);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] row : orderReadRepository.countByStatusSince(since)) {
            byStatus.put((String) row[0], (Long) row[1]);
        }

        var chart = orderReadRepository.ordersByDay(since).stream()
            .map(row -> new OrderChartPoint(row[0].toString(), ((Number) row[1]).longValue()))
            .toList();

        return new OrderStatsResponse(totalOrders, totalRevenue, byStatus, chart);
    }

    private Instant parsePeriod(String period) {
        if (period == null || period.isBlank()) {
            return Instant.now().minus(30, ChronoUnit.DAYS);
        }
        String value = period.trim().toLowerCase();
        if (value.endsWith("d")) {
            int days = Integer.parseInt(value.substring(0, value.length() - 1));
            return Instant.now().minus(days, ChronoUnit.DAYS);
        }
        if (value.endsWith("m")) {
            int months = Integer.parseInt(value.substring(0, value.length() - 1));
            return Instant.now().minus((long) months * 30, ChronoUnit.DAYS);
        }
        return Instant.now().minus(30, ChronoUnit.DAYS);
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
