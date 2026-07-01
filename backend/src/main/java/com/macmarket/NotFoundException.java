package com.macmarket;

public class NotFoundException extends DomainException {
    public NotFoundException(String message) {
        super(message);
    }
}
