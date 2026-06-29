package com.macmarket.order.application.service;

import java.util.List;

import com.macmarket.cart.application.service.CartApplicationService;
import com.macmarket.order.application.command.PlaceOrderCommand;
import com.macmarket.order.domain.model.*;
import com.macmarket.order.domain.repository.OrderRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PlaceOrderService {

    private final OrderRepository orderRepository;
    private final CartApplicationService cartService;
    private final ApplicationEventPublisher eventPublisher;

    public PlaceOrderService(OrderRepository orderRepository, CartApplicationService cartService,
                              ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.eventPublisher = eventPublisher;
    }

    public Order execute(PlaceOrderCommand command) {
        var cart = cartService.getCart(command.userId());
        if (cart.getItems().isEmpty()) {
            throw new OrderDomainException("Le panier est vide");
        }

        List<OrderItem> items = cart.getItems().stream()
            .map(i -> new OrderItem(ProductReference.of(i.getProductId()), i.getProductName(), i.getProductImage(),
                i.getUnitPrice(), i.getQuantity(), i.subtotal()))
            .toList();

        var shippingInfo = new ShippingInfo(command.shippingName(), command.shippingAddress(), command.shippingEmail());
        var order = Order.place(command.userId(), items, cart.total(), shippingInfo);
        orderRepository.save(order);

        order.pullDomainEvents().forEach(eventPublisher::publishEvent);

        cartService.clearCart(command.userId());

        return order;
    }
}
