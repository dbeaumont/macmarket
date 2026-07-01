package com.macmarket.order.domain.model;

import com.macmarket.DomainException;

public class OrderDomainException extends DomainException {
    public OrderDomainException(String message) { super(message); }
}
