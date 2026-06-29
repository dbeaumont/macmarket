import { useState, useRef, useCallback } from 'react';

export interface ChatMessageData {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface SuggestedProduct {
  readonly slug: string;
  readonly name: string;
  readonly price: string;
  readonly imageUrl: string;
  readonly category: string;
}

interface TokenPayload {
  readonly content: string;
}

interface DonePayload {
  readonly conversationId: string;
}

interface SuggestionsPayload {
  readonly products: readonly SuggestedProduct[];
}

interface ErrorPayload {
  readonly content: string;
}

type SsePayload = TokenPayload | DonePayload | SuggestionsPayload | ErrorPayload;

let _getToken: (() => Promise<string | undefined>) | null = null;

export function setChatTokenProvider(fn: () => Promise<string | undefined>): void {
  _getToken = fn;
}

export function useChat() {
  const [messages, setMessages] = useState<readonly ChatMessageData[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<readonly SuggestedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (isStreaming || !message.trim()) return;

    setIsStreaming(true);
    setError(null);
    setSuggestions([]);

    const userMsg: ChatMessageData = { role: 'user', content: message };
    const assistantMsg: ChatMessageData = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = _getToken ? await _getToken() : undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          conversationId: conversationIdRef.current,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Pas de flux de réponse');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let eventEnd = buffer.indexOf('\n\n');
        while (eventEnd !== -1) {
          const eventText = buffer.substring(0, eventEnd);
          buffer = buffer.substring(eventEnd + 2);

          let eventType = '';
          let dataStr = '';
          for (const line of eventText.split('\n')) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5);
            }
          }

          if (eventType && dataStr) {
            const parsed = JSON.parse(dataStr) as SsePayload;

            switch (eventType) {
              case 'token': {
                const tokenData = parsed as TokenPayload;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (!last) return prev;
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + tokenData.content },
                  ];
                });
                break;
              }
              case 'suggestions': {
                const sugData = parsed as SuggestionsPayload;
                setSuggestions(sugData.products);
                break;
              }
              case 'done': {
                const doneData = parsed as DonePayload;
                conversationIdRef.current = doneData.conversationId;
                break;
              }
              case 'error': {
                const errData = parsed as ErrorPayload;
                setError(errData.content);
                break;
              }
            }
          }

          eventEnd = buffer.indexOf('\n\n');
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : "Impossible de contacter l'assistant";
      setError(errorMessage);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const clearConversation = useCallback((): void => {
    if (conversationIdRef.current) {
      const convId = conversationIdRef.current;
      if (_getToken) {
        _getToken().then(token => {
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          fetch(`/api/v1/assistant/conversations/${convId}`, {
            method: 'DELETE',
            headers,
          });
        });
      }
    }
    setMessages([]);
    setSuggestions([]);
    setError(null);
    conversationIdRef.current = null;
  }, []);

  const stopStreaming = useCallback((): void => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isStreaming,
    suggestions,
    error,
    sendMessage,
    clearConversation,
    stopStreaming,
  } as const;
}
