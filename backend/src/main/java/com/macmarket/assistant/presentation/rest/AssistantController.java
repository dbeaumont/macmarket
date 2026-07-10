package com.macmarket.assistant.presentation.rest;

import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import com.macmarket.assistant.application.service.ChatService;
import com.macmarket.assistant.presentation.dto.ChatRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.validation.Valid;
import reactor.core.Disposable;

@RestController
@RequestMapping("/api/v1/assistant")
@Validated
@Tag(name = "Assistant IA", description = "Chatbot IA en streaming SSE")
@SecurityRequirement(name = "bearerAuth")
public class AssistantController {

    private static final Logger log = LoggerFactory.getLogger(AssistantController.class);
    private static final long SSE_TIMEOUT = 600_000L;

    private final ChatService chatService;

    public AssistantController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(summary = "Chat avec l'assistant IA — SSE streaming")
    @ApiResponse(responseCode = "200", description = "Flux d'événements SSE",
            content = @Content(mediaType = "text/event-stream", schema = @Schema(type = "string")))
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@Valid @RequestBody ChatRequest request,
                           @AuthenticationPrincipal Jwt jwt) {
        var emitter = new SseEmitter(SSE_TIMEOUT);
        var completed = new AtomicBoolean(false);

        var conversationId = request.conversationId();

        Disposable subscription = chatService.chat(conversationId, request.message())
            .subscribe(
                event -> {
                    if (completed.get()) return;
                    try {
                        emitter.send(chatService.toSseEvent(event));
                    } catch (Exception ex) {
                        completed.set(true);
                    }
                },
                error -> {
                    if (completed.get()) return;
                    try {
                        emitter.send(SseEmitter.event()
                            .name("error")
                            .data(Map.of("content", "L'assistant est temporairement indisponible")));
                        emitter.complete();
                    } catch (Exception ex) {
                        completed.set(true);
                    }
                },
                () -> {
                    if (!completed.get()) emitter.complete();
                }
            );

        emitter.onCompletion(() -> {
            completed.set(true);
            subscription.dispose();
        });
        emitter.onTimeout(() -> {
            completed.set(true);
            subscription.dispose();
            emitter.complete();
        });
        emitter.onError(ex -> {
            completed.set(true);
            subscription.dispose();
        });

        return emitter;
    }

    @Operation(summary = "Supprimer une conversation")
    @ApiResponse(responseCode = "204", description = "Conversation supprimée", content = @Content)
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String id) {
        chatService.clearConversation(id);
        return ResponseEntity.noContent().build();
    }
}
