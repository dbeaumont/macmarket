package com.macmarket.user.infrastructure.persistence.repository;

import java.util.Optional;
import java.util.UUID;

import com.macmarket.user.infrastructure.persistence.entity.ShippingProfileJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

interface ShippingProfileSpringDataRepository extends JpaRepository<ShippingProfileJpaEntity, UUID> {
    Optional<ShippingProfileJpaEntity> findByUserId(String userId);
}
