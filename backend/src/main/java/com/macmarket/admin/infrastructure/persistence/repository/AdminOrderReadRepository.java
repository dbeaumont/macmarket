package com.macmarket.admin.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.macmarket.admin.infrastructure.persistence.entity.AdminOrderEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminOrderReadRepository extends JpaRepository<AdminOrderEntity, UUID> {

    Page<AdminOrderEntity> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<AdminOrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AdminOrderEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT COUNT(o) FROM AdminOrderEntity o WHERE o.createdAt >= :since")
    long countOrdersSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM AdminOrderEntity o WHERE o.createdAt >= :since AND o.status <> 'CANCELLED'")
    BigDecimal sumRevenueSince(@Param("since") Instant since);

    @Query("SELECT o.status, COUNT(o) FROM AdminOrderEntity o GROUP BY o.status")
    List<Object[]> countByStatus();

    @Query(value = "SELECT DATE(created_at) as day, SUM(total) as total FROM order_orders WHERE created_at >= :since AND status <> 'CANCELLED' GROUP BY DATE(created_at) ORDER BY day", nativeQuery = true)
    List<Object[]> revenueByDay(@Param("since") Instant since);

    @Query("SELECT o FROM AdminOrderEntity o ORDER BY o.createdAt DESC")
    List<AdminOrderEntity> findRecentOrders(Pageable pageable);

    @Query("SELECT o.userId, COUNT(o), SUM(o.total), MAX(o.createdAt) FROM AdminOrderEntity o GROUP BY o.userId ORDER BY SUM(o.total) DESC")
    List<Object[]> customerAggregation(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT o.userId) FROM AdminOrderEntity o")
    long countDistinctCustomers();

    @Query("SELECT COUNT(DISTINCT o.userId) FROM AdminOrderEntity o WHERE o.createdAt >= :since")
    long countNewCustomersSince(@Param("since") Instant since);

    @Query("SELECT o.status, COUNT(o) FROM AdminOrderEntity o WHERE o.createdAt >= :since GROUP BY o.status")
    List<Object[]> countByStatusSince(@Param("since") Instant since);

    @Query(value = "SELECT DATE(created_at) as day, COUNT(*) as cnt FROM order_orders WHERE created_at >= :since GROUP BY DATE(created_at) ORDER BY day", nativeQuery = true)
    List<Object[]> ordersByDay(@Param("since") Instant since);
}
