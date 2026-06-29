package com.macmarket.order.infrastructure.persistence.repository;

import java.util.List;
import java.util.UUID;

import com.macmarket.order.infrastructure.persistence.entity.OrderJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

interface OrderSpringDataRepository extends JpaRepository<OrderJpaEntity, UUID> {
    List<OrderJpaEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
