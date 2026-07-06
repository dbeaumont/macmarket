package com.macmarket.order.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;

import com.macmarket.UserId;
import com.macmarket.order.domain.model.Order;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.repository.OrderRepository;
import com.macmarket.order.infrastructure.persistence.mapper.OrderPersistenceMapper;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;

@Component
class OrderJpaRepository implements OrderRepository {

    private final OrderSpringDataRepository springData;
    private final OrderPersistenceMapper mapper;
    private final EntityManager entityManager;

    OrderJpaRepository(OrderSpringDataRepository springData, OrderPersistenceMapper mapper, EntityManager entityManager) {
        this.springData = springData;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    @Override
    public void save(Order order) {
        var existing = springData.findById(order.getId().value());
        if (existing.isPresent()) {
            var entity = existing.get();
            entity.setStatus(order.getStatus().name());
            entity.setTotal(order.getTotal());
            springData.save(entity);
        } else {
            var entity = mapper.toJpa(order);
            entity.markAsNew();
            springData.save(entity);
        }
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return springData.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<Order> findByUserId(UserId userId) {
        return springData.findByUserIdOrderByCreatedAtDesc(userId.value()).stream()
            .map(mapper::toDomain).toList();
    }
}
