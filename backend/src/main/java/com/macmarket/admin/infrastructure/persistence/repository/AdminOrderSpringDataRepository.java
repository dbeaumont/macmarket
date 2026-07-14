package com.macmarket.admin.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.macmarket.admin.infrastructure.persistence.entity.AdminOrderJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface AdminOrderSpringDataRepository extends JpaRepository<AdminOrderJpaEntity, UUID> {

    Page<AdminOrderJpaEntity> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<AdminOrderJpaEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AdminOrderJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT COUNT(o) FROM AdminOrderJpaEntity o WHERE o.createdAt >= :since")
    long countOrdersSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM AdminOrderJpaEntity o WHERE o.createdAt >= :since AND o.status <> 'CANCELLED'")
    BigDecimal sumRevenueSince(@Param("since") Instant since);

    @Query("SELECT o.status, COUNT(o) FROM AdminOrderJpaEntity o GROUP BY o.status")
    List<Object[]> countByStatus();

    @Query(value = "SELECT DATE(created_at) as day, SUM(total) as total FROM order_orders WHERE created_at >= :since AND status <> 'CANCELLED' GROUP BY DATE(created_at) ORDER BY day", nativeQuery = true)
    List<Object[]> revenueByDay(@Param("since") Instant since);

    @Query("SELECT o FROM AdminOrderJpaEntity o ORDER BY o.createdAt DESC")
    List<AdminOrderJpaEntity> findRecentOrders(Pageable pageable);

    @Query("SELECT o.userId, COUNT(o), SUM(o.total), MAX(o.createdAt) FROM AdminOrderJpaEntity o GROUP BY o.userId ORDER BY SUM(o.total) DESC")
    List<Object[]> customerAggregation(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT o.userId) FROM AdminOrderJpaEntity o")
    long countDistinctCustomers();

    @Query("SELECT COUNT(DISTINCT o.userId) FROM AdminOrderJpaEntity o WHERE o.createdAt >= :since")
    long countNewCustomersSince(@Param("since") Instant since);

    @Query("SELECT o.status, COUNT(o) FROM AdminOrderJpaEntity o WHERE o.createdAt >= :since GROUP BY o.status")
    List<Object[]> countByStatusSince(@Param("since") Instant since);

    @Query(value = "SELECT DATE(created_at) as day, COUNT(*) as cnt FROM order_orders WHERE created_at >= :since GROUP BY DATE(created_at) ORDER BY day", nativeQuery = true)
    List<Object[]> ordersByDay(@Param("since") Instant since);
}
