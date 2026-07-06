package com.macmarket.admin.infrastructure.persistence.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_daily_stats")
public class AdminDailyStatsJpaEntity {

    @Id
    @Column(name = "stat_date")
    private LocalDate statDate;

    @Column(name = "orders_count", nullable = false)
    private int ordersCount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal revenue;

    @Column(name = "new_users_count", nullable = false)
    private int newUsersCount;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() { updatedAt = Instant.now(); }

    @PreUpdate
    void preUpdate() { updatedAt = Instant.now(); }

    public LocalDate getStatDate() { return statDate; }
    public void setStatDate(LocalDate statDate) { this.statDate = statDate; }
    public int getOrdersCount() { return ordersCount; }
    public void setOrdersCount(int ordersCount) { this.ordersCount = ordersCount; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public int getNewUsersCount() { return newUsersCount; }
    public void setNewUsersCount(int newUsersCount) { this.newUsersCount = newUsersCount; }
    public Instant getUpdatedAt() { return updatedAt; }
}
