package com.macmarket.admin.application.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.macmarket.admin.infrastructure.persistence.entity.AdminDailyStatsEntity;
import com.macmarket.admin.infrastructure.persistence.repository.AdminDailyStatsJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminStatsRecorder {

    private final AdminDailyStatsJpaRepository statsRepository;

    public AdminStatsRecorder(AdminDailyStatsJpaRepository statsRepository) {
        this.statsRepository = statsRepository;
    }

    public void recordOrder(LocalDate date, BigDecimal orderTotal) {
        AdminDailyStatsEntity stats = statsRepository.findByStatDate(date)
            .orElseGet(() -> {
                AdminDailyStatsEntity newStats = new AdminDailyStatsEntity();
                newStats.setStatDate(date);
                newStats.setOrdersCount(0);
                newStats.setRevenue(BigDecimal.ZERO);
                newStats.setNewUsersCount(0);
                return newStats;
            });

        stats.setOrdersCount(stats.getOrdersCount() + 1);
        stats.setRevenue(stats.getRevenue().add(orderTotal));
        statsRepository.save(stats);
    }
}
