package com.macmarket.assistant.application.service;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import com.macmarket.assistant.domain.model.ChatStreamEvent;
import com.macmarket.assistant.domain.model.ConversationId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import reactor.core.publisher.Flux;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final LlmClient llmClient;
    private final ConversationMemoryPort memory;
    private final CatalogContextProvider catalogContext;
    private final PromptBuilder promptBuilder;
    private final ProductSuggestionExtractor extractor;

    public ChatService(LlmClient llmClient, ConversationMemoryPort memory,
                       CatalogContextProvider catalogContext, PromptBuilder promptBuilder,
                       ProductSuggestionExtractor extractor) {
        this.llmClient = llmClient;
        this.memory = memory;
        this.catalogContext = catalogContext;
        this.promptBuilder = promptBuilder;
        this.extractor = extractor;
    }

    public Flux<ChatStreamEvent> chat(String conversationIdStr, String userMessage) {
        var conversationId = conversationIdStr != null
            ? ConversationId.of(conversationIdStr)
            : ConversationId.generate();

        var systemPrompt = promptBuilder.build(catalogContext.getCatalogContext());
        var history = memory.getHistory(conversationId);

        var buffer = new AtomicReference<>(new StringBuilder());

        return llmClient.stream(systemPrompt, history, userMessage)
            .doOnNext(token -> buffer.get().append(token))
            .map(token -> (ChatStreamEvent) new ChatStreamEvent.TokenEvent(token))
            .concatWith(Flux.defer(() -> {
                var fullText = buffer.get().toString();
                var cleanText = extractor.cleanText(fullText);
                var suggestions = extractor.extract(fullText);
                memory.addExchange(conversationId, userMessage, cleanText);

                var events = new ArrayList<ChatStreamEvent>();
                if (!suggestions.isEmpty()) {
                    events.add(new ChatStreamEvent.SuggestionsEvent(suggestions));
                }
                events.add(new ChatStreamEvent.DoneEvent(conversationId.value()));
                return Flux.fromIterable(events);
            }))
            .onErrorResume(ex -> {
                log.error("Erreur lors de la communication avec le LLM", ex);
                return Flux.just(new ChatStreamEvent.ErrorEvent("L'assistant est temporairement indisponible"));
            });
    }

    public SseEmitter.SseEventBuilder toSseEvent(ChatStreamEvent event) {
        return switch (event) {
            case ChatStreamEvent.TokenEvent e ->
                SseEmitter.event().name("token").data(Map.of("content", e.content()));
            case ChatStreamEvent.DoneEvent e ->
                SseEmitter.event().name("done").data(Map.of("conversationId", e.conversationId()));
            case ChatStreamEvent.SuggestionsEvent e ->
                SseEmitter.event().name("suggestions").data(Map.of("products", e.products()));
            case ChatStreamEvent.ErrorEvent e ->
                SseEmitter.event().name("error").data(Map.of("content", e.message()));
        };
    }

    public void clearConversation(String conversationId) {
        memory.clear(ConversationId.of(conversationId));
    }
}
