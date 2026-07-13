import { inject, Injectable, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { type ChatMessage, type SuggestedProduct } from '../models/chat.model';

const STORAGE_PREFIX = 'macmarket:chat';

interface StoredData {
  readonly messages: readonly ChatMessage[];
  readonly conversationId: string | null;
}

function getStorageKeys(userId: string): { messagesKey: string; convIdKey: string } {
  return {
    messagesKey: `${STORAGE_PREFIX}:messages:${userId}`,
    convIdKey: `${STORAGE_PREFIX}:conversationId:${userId}`,
  };
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly oidc = inject(OidcSecurityService);

  private conversationId: string | null = null;
  private abortController: AbortController | null = null;

  readonly messages = signal<readonly ChatMessage[]>([]);
  readonly isStreaming = signal(false);
  readonly suggestions = signal<readonly SuggestedProduct[]>([]);
  readonly error = signal<string | null>(null);

  loadHistory(userId: string): void {
    try {
      const { messagesKey, convIdKey } = getStorageKeys(userId);
      const raw = localStorage.getItem(messagesKey);
      const stored: readonly ChatMessage[] = raw ? JSON.parse(raw) as readonly ChatMessage[] : [];
      this.messages.set(stored);
      this.conversationId = localStorage.getItem(convIdKey);
    } catch {
      this.messages.set([]);
      this.conversationId = null;
    }
  }

  saveMessages(userId: string): void {
    try {
      const { messagesKey } = getStorageKeys(userId);
      const toSave = this.messages().filter((m) => !(m.role === 'assistant' && m.content === ''));
      if (toSave.length > 0) {
        localStorage.setItem(messagesKey, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(messagesKey);
      }
    } catch {
      // Ignore storage errors
    }
  }

  clearHistory(userId: string): void {
    try {
      const { messagesKey, convIdKey } = getStorageKeys(userId);
      localStorage.removeItem(messagesKey);
      localStorage.removeItem(convIdKey);
    } catch {
      // Ignore storage errors
    }
    this.messages.set([]);
    this.conversationId = null;
  }

  stopStreaming(): void {
    this.abortController?.abort();
    this.isStreaming.set(false);
  }

  async sendMessage(message: string, userId: string | undefined): Promise<void> {
    if (this.isStreaming() || !message.trim()) return;

    this.isStreaming.set(true);
    this.error.set(null);
    this.suggestions.set([]);

    this.messages.update((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const controller = new AbortController();
    this.abortController = controller;

    try {
      const token = await firstValueFrom(this.oidc.getAccessToken());
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, conversationId: this.conversationId }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);

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
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5);
          }

          if (eventType && dataStr) {
            const parsed = JSON.parse(dataStr) as Record<string, unknown>;
            switch (eventType) {
              case 'token':
                this.messages.update((prev) => {
                  const last = prev[prev.length - 1];
                  if (!last) return prev;
                  return [...prev.slice(0, -1), { ...last, content: last.content + (parsed['content'] as string) }];
                });
                break;
              case 'suggestions':
                this.suggestions.set((parsed['products'] as SuggestedProduct[]) ?? []);
                break;
              case 'done':
                this.conversationId = parsed['conversationId'] as string;
                if (userId) {
                  try {
                    const { convIdKey } = getStorageKeys(userId);
                    localStorage.setItem(convIdKey, this.conversationId);
                  } catch { /* ignore */ }
                }
                break;
              case 'error':
                this.error.set(parsed['content'] as string ?? 'Erreur inconnue');
                break;
            }
          }
          eventEnd = buffer.indexOf('\n\n');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        this.error.set(err.message);
      }
    } finally {
      this.isStreaming.set(false);
      if (userId) this.saveMessages(userId);
    }
  }
}
