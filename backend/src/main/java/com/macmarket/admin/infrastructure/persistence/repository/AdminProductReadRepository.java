package com.macmarket.admin.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;

import com.macmarket.admin.infrastructure.persistence.entity.AdminProductEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminProductReadRepository extends JpaRepository<AdminProductEntity, UUID> {

    @Query("SELECT p FROM AdminProductEntity p WHERE p.active = true AND (p.stockQuantity - p.reservedQuantity) < :threshold ORDER BY (p.stockQuantity - p.reservedQuantity) ASC")
    List<AdminProductEntity> findLowStockProducts(@Param("threshold") int threshold);

    @Query("SELECT COUNT(p) FROM AdminProductEntity p WHERE p.active = true AND (p.stockQuantity - p.reservedQuantity) < :threshold")
    long countLowStock(@Param("threshold") int threshold);

    long countByActiveTrue();
}
