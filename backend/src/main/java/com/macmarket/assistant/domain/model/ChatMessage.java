package com.macmarket.assistant.domain.model;

import java.util.Objects;

public record ChatMessage(Role role, String content) {

    public enum Role { USER, ASSISTANT }

    public ChatMessage {
        Objects.requireNonNull(role, "Le rôle est obligatoire");
        Objects.requireNonNull(content, "Le contenu est obligatoire");
    }

    public static ChatMessage user(String content) {
        return new ChatMessage(Role.USER, content);
    }

    public static ChatMessage assistant(String content) {
        return new ChatMessage(Role.ASSISTANT, content);
    }
}
