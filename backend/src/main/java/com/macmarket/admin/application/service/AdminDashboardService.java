package com.macmarket.admin.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

import com.macmarket.admin.domain.repository.AdminOrderReadRepository;
import com.macmarket.admin.domain.repository.AdminProductReadRepository;
import com.macmarket.admin.presentation.dto.*;

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
        for (var statusCount : orderReadRepository.countByStatus()) {
            ordersByStatus.put(statusCount.status(), statusCount.count());
        }

        var revenueChart = orderReadRepository.revenueByDay(since30d).stream()
            .map(daily -> new RevenueChartPoint(daily.day(), daily.revenue()))
            .toList();

        var recentOrders = orderReadRepository.findRecentOrders(RECENT_ORDERS_LIMIT).stream()
            .map(o -> new RecentOrderDto(
                o.id(), o.userId(), o.status(), o.total(), o.itemCount(), o.createdAt()))
            .toList();

        var lowStockProducts = productReadRepository.findLowStockProducts(LOW_STOCK_THRESHOLD).stream()
            .map(p -> new LowStockProductDto(
                p.id(), p.name(), p.category(), p.price(),
                p.stockQuantity(), p.reservedQuantity(), p.availableQuantity()))
            .toList();

        return new DashboardResponse(
            totalOrders, totalRevenue, totalCustomers, activeProducts, lowStockCount,
            ordersByStatus, revenueChart, recentOrders, lowStockProducts
        );
    }
}
