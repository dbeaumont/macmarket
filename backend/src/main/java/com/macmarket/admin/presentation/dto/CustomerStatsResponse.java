package com.macmarket.admin.presentation.dto;

import java.math.BigDecimal;

public record CustomerStatsResponse(
    long totalCustomers,
    long newCustomers,
    BigDecimal averageSpentPerCustomer,
    BigDecimal totalRevenue
) {}
