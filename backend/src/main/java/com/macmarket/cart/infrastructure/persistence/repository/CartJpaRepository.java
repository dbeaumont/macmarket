package com.macmarket.cart.infrastructure.persistence.repository;

import java.time.Instant;
import java.util.Optional;

import com.macmarket.cart.domain.model.Cart;
import com.macmarket.cart.domain.repository.CartRepository;
import com.macmarket.cart.infrastructure.persistence.entity.CartItemJpaEntity;
import com.macmarket.cart.infrastructure.persistence.entity.CartJpaEntity;
import com.macmarket.cart.infrastructure.persistence.mapper.CartPersistenceMapper;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;

@Component
class CartJpaRepository implements CartRepository {

    private final CartSpringDataRepository springData;
    private final CartPersistenceMapper mapper;
    private final EntityManager entityManager;

    CartJpaRepository(CartSpringDataRepository springData, CartPersistenceMapper mapper, EntityManager entityManager) {
        this.springData = springData;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    @Override
    public Optional<Cart> findByUserId(String userId) {
        return springData.findByUserId(userId).map(mapper::toDomain);
    }

    @Override
    public void save(Cart cart) {
        var existing = springData.findById(cart.getId().value());
        if (existing.isPresent()) {
            var entity = existing.get();
            entity.getItems().clear();
            entityManager.flush();
            for (var domainItem : cart.getItems()) {
                var itemEntity = new CartItemJpaEntity();
                itemEntity.setCart(entity);
                itemEntity.setProductId(domainItem.getProductId());
                itemEntity.setProductName(domainItem.getProductName());
                itemEntity.setProductImage(domainItem.getProductImage());
                itemEntity.setUnitPrice(domainItem.getUnitPrice());
                itemEntity.setQuantity(domainItem.getQuantity());
                entity.getItems().add(itemEntity);
            }
            springData.save(entity);
        } else {
            var entity = mapper.toJpa(cart);
            entity.markAsNew();
            springData.save(entity);
        }
    }

    @Override
    public int deleteAbandonedCarts(Instant cutoff) {
        return springData.deleteByUpdatedAtBefore(cutoff);
    }
}
