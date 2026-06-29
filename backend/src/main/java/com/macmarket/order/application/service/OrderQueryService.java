package com.macmarket.order.application.service;

import java.util.List;
import java.util.UUID;

import com.macmarket.order.domain.model.Order;
import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderNotFoundException;
import com.macmarket.order.domain.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository orderRepository;

    public OrderQueryService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order findById(UUID id) {
        var orderId = OrderId.of(id);
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
    }

    public Order findById(OrderId id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));
    }

    public List<Order> findByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }
}
