package com.macmarket.cart.infrastructure.persistence.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.macmarket.cart.infrastructure.persistence.entity.CartJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface CartSpringDataRepository extends JpaRepository<CartJpaEntity, UUID> {
    Optional<CartJpaEntity> findByUserId(String userId);

    @Modifying
    @Query("DELETE FROM CartJpaEntity c WHERE c.updatedAt < :cutoff")
    int deleteByUpdatedAtBefore(Instant cutoff);
}
