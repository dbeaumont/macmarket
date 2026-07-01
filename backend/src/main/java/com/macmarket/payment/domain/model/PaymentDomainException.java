package com.macmarket.payment.domain.model;

import com.macmarket.DomainException;

public class PaymentDomainException extends DomainException {
    public PaymentDomainException(String message) {
        super(message);
    }
}
