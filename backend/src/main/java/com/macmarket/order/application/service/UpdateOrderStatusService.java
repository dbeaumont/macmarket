package com.macmarket.order.application.service;

import com.macmarket.order.domain.model.OrderId;
import com.macmarket.order.domain.model.OrderNotFoundException;
import com.macmarket.order.domain.model.OrderStatus;
import com.macmarket.order.domain.repository.OrderRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UpdateOrderStatusService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    public UpdateOrderStatusService(OrderRepository orderRepository, ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
    }

    public void markAsPaid(OrderId orderId) {
        var order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.markAsPaid();
        orderRepository.save(order);
        order.pullDomainEvents().forEach(eventPublisher::publishEvent);
    }

    public void cancel(OrderId orderId) {
        var order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.cancel();
        orderRepository.save(order);
        order.pullDomainEvents().forEach(eventPublisher::publishEvent);
    }

    public void updateStatus(OrderId orderId, OrderStatus newStatus) {
        var order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.updateStatus(newStatus);
        orderRepository.save(order);
        order.pullDomainEvents().forEach(eventPublisher::publishEvent);
    }
}
