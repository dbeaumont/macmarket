package com.macmarket.assistant.domain.model;

import java.util.Objects;
import java.util.UUID;

public record ConversationId(String value) {

    public ConversationId {
        Objects.requireNonNull(value, "L'identifiant de conversation est obligatoire");
    }

    public static ConversationId generate() {
        return new ConversationId(UUID.randomUUID().toString());
    }

    public static ConversationId of(String value) {
        return new ConversationId(value);
    }
}
