package com.macmarket.assistant.infrastructure.llm;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.macmarket.assistant.application.service.ConversationMemoryPort;
import com.macmarket.assistant.domain.model.ChatMessage;
import com.macmarket.assistant.domain.model.ConversationId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
class CaffeineConversationMemory implements ConversationMemoryPort {

    private final Cache<String, List<ChatMessage>> conversations;
    private final int maxHistory;

    CaffeineConversationMemory(@Value("${macmarket.assistant.max-history:20}") int maxHistory) {
        this.maxHistory = maxHistory;
        this.conversations = Caffeine.newBuilder()
            .expireAfterAccess(30, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();
    }

    @Override
    public List<ChatMessage> getHistory(ConversationId id) {
        var history = conversations.getIfPresent(id.value());
        return history != null ? List.copyOf(history) : List.of();
    }

    @Override
    public void addExchange(ConversationId id, String userMessage, String assistantResponse) {
        conversations.asMap().compute(id.value(), (key, existing) -> {
            var messages = existing != null ? new ArrayList<>(existing) : new ArrayList<ChatMessage>();
            messages.add(ChatMessage.user(userMessage));
            messages.add(ChatMessage.assistant(assistantResponse));
            while (messages.size() > maxHistory * 2) {
                messages.removeFirst();
            }
            return messages;
        });
    }

    @Override
    public void clear(ConversationId id) {
        conversations.invalidate(id.value());
    }
}
