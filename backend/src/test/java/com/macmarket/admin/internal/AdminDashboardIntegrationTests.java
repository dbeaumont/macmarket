package com.macmarket.admin.internal;

import com.macmarket.admin.application.service.AdminDashboardService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
class AdminDashboardIntegrationTests {

    @Autowired AdminDashboardService adminDashboardService;

    @Test
    void shouldAggregateDashboardFromSeededCatalogAndOrders() {
        var dashboard = adminDashboardService.getDashboard();

        assertThat(dashboard.totalOrders()).isGreaterThanOrEqualTo(0);
        assertThat(dashboard.totalRevenue()).isNotNull();
        assertThat(dashboard.activeProducts()).isGreaterThan(0);
        assertThat(dashboard.lowStockCount()).isGreaterThanOrEqualTo(0);
        assertThat(dashboard.ordersByStatus()).isNotNull();
        assertThat(dashboard.revenueChart()).isNotNull();
        assertThat(dashboard.recentOrders()).hasSizeLessThanOrEqualTo(5);
        assertThat(dashboard.lowStockProducts())
            .allSatisfy(product -> assertThat(product.availableQuantity()).isLessThan(5));
    }
}
