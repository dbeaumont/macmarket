package com.macmarket.payment.domain.model;

import java.util.Objects;
import java.util.UUID;

public record OrderReference(UUID value) {
    public OrderReference {
        Objects.requireNonNull(value, "La reference commande est obligatoire");
    }
    public static OrderReference of(UUID value) { return new OrderReference(value); }
}
