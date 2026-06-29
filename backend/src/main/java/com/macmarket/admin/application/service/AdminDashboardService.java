package com.macmarket.admin.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

import com.macmarket.admin.infrastructure.persistence.repository.AdminOrderReadRepository;
import com.macmarket.admin.infrastructure.persistence.repository.AdminProductReadRepository;
import com.macmarket.admin.presentation.dto.*;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final int RECENT_ORDERS_LIMIT = 5;
    private static final int CHART_DAYS = 30;

    private final AdminOrderReadRepository orderReadRepository;
    private final AdminProductReadRepository productReadRepository;

    public AdminDashboardService(AdminOrderReadRepository orderReadRepository,
                                 AdminProductReadRepository productReadRepository) {
        this.orderReadRepository = orderReadRepository;
        this.productReadRepository = productReadRepository;
    }

    public DashboardResponse getDashboard() {
        Instant since30d = Instant.now().minus(CHART_DAYS, ChronoUnit.DAYS);

        long totalOrders = orderReadRepository.count();
        BigDecimal totalRevenue = orderReadRepository.sumRevenueSince(Instant.EPOCH);
        long totalCustomers = orderReadRepository.countDistinctCustomers();
        long activeProducts = productReadRepository.countByActiveTrue();
        long lowStockCount = productReadRepository.countLowStock(LOW_STOCK_THRESHOLD);

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (Object[] row : orderReadRepository.countByStatus()) {
            ordersByStatus.put((String) row[0], (Long) row[1]);
        }

        var revenueChart = orderReadRepository.revenueByDay(since30d).stream()
            .map(row -> new RevenueChartPoint(row[0].toString(), toBigDecimal(row[1])))
            .toList();

        var recentOrders = orderReadRepository.findRecentOrders(PageRequest.of(0, RECENT_ORDERS_LIMIT)).stream()
            .map(o -> new RecentOrderDto(
                o.getId(), o.getUserId(), o.getStatus(), o.getTotal(),
                o.getItems().size(), o.getCreatedAt()))
            .toList();

        var lowStockProducts = productReadRepository.findLowStockProducts(LOW_STOCK_THRESHOLD).stream()
            .map(p -> new LowStockProductDto(
                p.getId(), p.getName(), p.getCategory(), p.getPrice(),
                p.getStockQuantity(), p.getReservedQuantity(),
                p.getStockQuantity() - p.getReservedQuantity()))
            .toList();

        return new DashboardResponse(
            totalOrders, totalRevenue, totalCustomers, activeProducts, lowStockCount,
            ordersByStatus, revenueChart, recentOrders, lowStockProducts
        );
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }
}
