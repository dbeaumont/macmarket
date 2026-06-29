package com.macmarket.assistant.application.service;

import java.util.List;

import com.macmarket.assistant.domain.model.ChatMessage;

import reactor.core.publisher.Flux;

public interface LlmClient {

    Flux<String> stream(String systemPrompt, List<ChatMessage> history, String userMessage);
}
