package com.macmarket.assistant.application.service;

import java.util.List;

import com.macmarket.assistant.domain.model.ChatMessage;
import com.macmarket.assistant.domain.model.ConversationId;

public interface ConversationMemoryPort {

    List<ChatMessage> getHistory(ConversationId id);

    void addExchange(ConversationId id, String userMessage, String assistantResponse);

    void clear(ConversationId id);
}
