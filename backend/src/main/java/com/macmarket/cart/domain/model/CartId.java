package com.macmarket.cart.domain.model;

import java.util.Objects;
import java.util.UUID;

public record CartId(UUID value) {
    public CartId {
        Objects.requireNonNull(value, "L'identifiant panier est obligatoire");
    }

    public static CartId generate() { return new CartId(UUID.randomUUID()); }
    public static CartId of(UUID value) { return new CartId(value); }
}
