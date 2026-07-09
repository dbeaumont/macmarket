import { useState, useRef, useCallback, useEffect } from 'react';

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

const STORAGE_PREFIX = 'macmarket:chat';

function getStorageKeys(userId: string): { readonly messagesKey: string; readonly convIdKey: string } {
  return {
    messagesKey: `${STORAGE_PREFIX}:messages:${userId}`,
    convIdKey: `${STORAGE_PREFIX}:conversationId:${userId}`,
  };
}

function loadFromStorage(userId: string): { readonly messages: readonly ChatMessageData[]; readonly conversationId: string | null } {
  try {
    const { messagesKey, convIdKey } = getStorageKeys(userId);
    const rawMessages = localStorage.getItem(messagesKey);
    const conversationId = localStorage.getItem(convIdKey);
    const messages: readonly ChatMessageData[] = rawMessages
      ? (JSON.parse(rawMessages) as readonly ChatMessageData[])
      : [];
    return { messages, conversationId };
  } catch {
    return { messages: [], conversationId: null };
  }
}

function saveConversationId(userId: string, conversationId: string | null): void {
  try {
    const { convIdKey } = getStorageKeys(userId);
    if (conversationId) {
      localStorage.setItem(convIdKey, conversationId);
    } else {
      localStorage.removeItem(convIdKey);
    }
  } catch {
    // Ignore storage errors
  }
}

function clearStorage(userId: string): void {
  try {
    const { messagesKey, convIdKey } = getStorageKeys(userId);
    localStorage.removeItem(messagesKey);
    localStorage.removeItem(convIdKey);
  } catch {
    // Ignore storage errors
  }
}

export function useChat(userId: string | undefined) {
  const initialData = useRef(
    userId ? loadFromStorage(userId) : { messages: [] as readonly ChatMessageData[], conversationId: null }
  );

  const [messages, setMessages] = useState<readonly ChatMessageData[]>(initialData.current.messages);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<readonly SuggestedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(initialData.current.conversationId);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userId) return;
    try {
      const { messagesKey } = getStorageKeys(userId);
      const toSave = messages.filter(m => !(m.role === 'assistant' && m.content === ''));
      if (toSave.length > 0) {
        localStorage.setItem(messagesKey, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(messagesKey);
      }
    } catch {
      // Ignore storage errors
    }
  }, [userId, messages]);

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
                if (userId) saveConversationId(userId, doneData.conversationId);
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
  }, [isStreaming, userId]);

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
    if (userId) clearStorage(userId);
  }, [userId]);

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
