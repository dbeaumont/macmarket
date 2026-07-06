package com.macmarket.admin.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;

import com.macmarket.admin.infrastructure.persistence.entity.AdminProductJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminProductReadRepository extends JpaRepository<AdminProductJpaEntity, UUID> {

    @Query("SELECT p FROM AdminProductJpaEntity p WHERE p.active = true AND (p.stockQuantity - p.reservedQuantity) < :threshold ORDER BY (p.stockQuantity - p.reservedQuantity) ASC")
    List<AdminProductJpaEntity> findLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT COUNT(p) FROM AdminProductJpaEntity p WHERE p.active = true AND (p.stockQuantity - p.reservedQuantity) < :threshold")
    long countLowStock(@Param("threshold") int threshold);

    long countByActiveTrue();
}
