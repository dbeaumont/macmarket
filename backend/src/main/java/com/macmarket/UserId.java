package com.macmarket;

import java.util.Objects;

public record UserId(String value) {

    public UserId {
        Objects.requireNonNull(value, "L'identifiant utilisateur est obligatoire");
    }

    public static UserId of(String value) {
        return new UserId(value);
    }
}
