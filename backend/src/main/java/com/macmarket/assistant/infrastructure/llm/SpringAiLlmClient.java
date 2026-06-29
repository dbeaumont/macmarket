package com.macmarket.assistant.infrastructure.llm;

import java.util.ArrayList;
import java.util.List;

import com.macmarket.assistant.application.service.LlmClient;
import com.macmarket.assistant.domain.model.ChatMessage;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Flux;

@Component
class SpringAiLlmClient implements LlmClient {

    private final ChatModel chatModel;

    SpringAiLlmClient(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public Flux<String> stream(String systemPrompt, List<ChatMessage> history, String userMessage) {
        var messages = new ArrayList<Message>();
        messages.add(new SystemMessage(systemPrompt));
        for (var msg : history) {
            switch (msg.role()) {
                case USER -> messages.add(new UserMessage(msg.content()));
                case ASSISTANT -> messages.add(new AssistantMessage(msg.content()));
            }
        }
        messages.add(new UserMessage(userMessage));

        return chatModel.stream(new Prompt(messages))
            .mapNotNull(response -> {
                var result = response.getResult();
                if (result == null || result.getOutput() == null) return null;
                return result.getOutput().getText();
            });
    }
}
