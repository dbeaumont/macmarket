package com.macmarket.order.application.command;

public record PlaceOrderCommand(
    String userId,
    String shippingName,
    String shippingAddress,
    String shippingEmail
) {}
