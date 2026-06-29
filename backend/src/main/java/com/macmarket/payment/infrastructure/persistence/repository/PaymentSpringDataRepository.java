package com.macmarket.payment.infrastructure.persistence.repository;

import java.util.Optional;
import java.util.UUID;

import com.macmarket.payment.infrastructure.persistence.entity.PaymentJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

interface PaymentSpringDataRepository extends JpaRepository<PaymentJpaEntity, UUID> {
    Optional<PaymentJpaEntity> findByOrderId(UUID orderId);
}
