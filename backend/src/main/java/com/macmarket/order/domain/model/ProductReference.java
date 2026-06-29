package com.macmarket.order.domain.model;

import java.util.Objects;
import java.util.UUID;

public record ProductReference(UUID value) {
    public ProductReference {
        Objects.requireNonNull(value, "La reference produit est obligatoire");
    }
    public static ProductReference of(UUID value) { return new ProductReference(value); }
}
