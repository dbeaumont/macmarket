package com.macmarket.catalog.domain.model;

import java.util.Objects;
import java.util.UUID;

public record ProductId(UUID value) {
    public ProductId {
        Objects.requireNonNull(value, "L'identifiant produit est obligatoire");
    }

    public static ProductId generate() {
        return new ProductId(UUID.randomUUID());
    }

    public static ProductId of(UUID value) {
        return new ProductId(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
