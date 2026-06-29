package com.macmarket.catalog.domain.model;

import java.util.Objects;

public record ProductSpec(String key, String value, int sortOrder) {
    public ProductSpec {
        Objects.requireNonNull(key, "La cle de specification est obligatoire");
        Objects.requireNonNull(value, "La valeur de specification est obligatoire");
    }
}
