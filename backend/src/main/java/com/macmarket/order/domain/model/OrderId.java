package com.macmarket.order.domain.model;

import java.util.Objects;
import java.util.UUID;

public record OrderId(UUID value) {
    public OrderId {
        Objects.requireNonNull(value, "L'identifiant commande est obligatoire");
    }
    public static OrderId generate() { return new OrderId(UUID.randomUUID()); }
    public static OrderId of(UUID value) { return new OrderId(value); }
}
