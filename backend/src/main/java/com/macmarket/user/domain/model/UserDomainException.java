package com.macmarket.user.domain.model;

import com.macmarket.DomainException;

public class UserDomainException extends DomainException {
    public UserDomainException(String message) {
        super(message);
    }
}
