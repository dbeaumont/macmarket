package com.macmarket.assistant.domain.model;

import java.util.List;

public sealed interface ChatStreamEvent {

    record TokenEvent(String content) implements ChatStreamEvent {}

    record DoneEvent(String conversationId) implements ChatStreamEvent {}

    record SuggestionsEvent(List<SuggestedProduct> products) implements ChatStreamEvent {}

    record ErrorEvent(String message) implements ChatStreamEvent {}
}
