package com.macmarket.user.domain.model;

import java.util.Objects;
import java.util.UUID;

public record ShippingProfileId(UUID value) {
    public ShippingProfileId {
        Objects.requireNonNull(value, "L'identifiant du profil de livraison est obligatoire");
    }

    public static ShippingProfileId generate() {
        return new ShippingProfileId(UUID.randomUUID());
    }

    public static ShippingProfileId of(UUID value) {
        return new ShippingProfileId(value);
    }
}
