package com.macmarket.cart.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.util.UUID;

import com.macmarket.cart.infrastructure.persistence.entity.CartItemJpaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRefresher extends JpaRepository<CartItemJpaEntity, UUID> {

    @Modifying
    @Query("""
        UPDATE CartItemJpaEntity i
        SET i.productName = :name, i.productImage = :image, i.unitPrice = :price
        WHERE i.productId = :productId
    """)
    int refreshProductSnapshot(UUID productId, String name, String image, BigDecimal price);
}
