package com.macmarket.order.domain.repository;

import java.util.List;
import java.util.Optional;

import com.macmarket.order.domain.model.Order;
import com.macmarket.order.domain.model.OrderId;

public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
    List<Order> findByUserId(String userId);
}
