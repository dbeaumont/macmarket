package com.macmarket.order.application.command;

import com.macmarket.UserId;

public record PlaceOrderCommand(
    UserId userId,
    String shippingName,
    String shippingAddress,
    String shippingEmail
) {}
