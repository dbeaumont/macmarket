package com.macmarket.catalog.domain.model;

import java.math.BigDecimal;

public record Money(BigDecimal amount) {
    public static final Money ZERO = new Money(BigDecimal.ZERO);

    public Money {
        if (amount == null) {
            throw new DomainException("Le montant est obligatoire");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("Le montant ne peut pas etre negatif : " + amount);
        }
    }

    public static Money of(BigDecimal amount) {
        return new Money(amount);
    }

    public Money multiply(int quantity) {
        return new Money(amount.multiply(BigDecimal.valueOf(quantity)));
    }

    public Money add(Money other) {
        return new Money(amount.add(other.amount));
    }
}
