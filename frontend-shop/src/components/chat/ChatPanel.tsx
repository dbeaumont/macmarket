import { useEffect, useRef } from 'react';
import { X, Trash2, Bot } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import type { ChatMessageData, SuggestedProduct } from '@/hooks/use-chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ProductSuggestion } from './ProductSuggestion';

interface Props {
  readonly onClose: () => void;
  readonly messages: readonly ChatMessageData[];
  readonly isStreaming: boolean;
  readonly suggestions: readonly SuggestedProduct[];
  readonly error: string | null;
  readonly sendMessage: (message: string) => Promise<void>;
  readonly clearConversation: () => void;
  readonly stopStreaming: () => void;
}

export function ChatPanel({ onClose, messages, isStreaming, suggestions, error, sendMessage, clearConversation, stopStreaming }: Props) {
  const auth = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, suggestions]);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-[380px] max-h-[600px] flex-col rounded-xl border bg-background shadow-2xl sm:right-6">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">MacBot</h2>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Nouvelle conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[440px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
            <Bot className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Bonjour ! Je suis MacBot</p>
            <p className="text-xs mt-1">
              Posez-moi vos questions sur les produits Mac
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isLast={i === messages.length - 1}
                isStreaming={isStreaming}
              />
            ))}
            {suggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Produits suggérés :
                </p>
                {suggestions.map(product => (
                  <ProductSuggestion key={product.slug} product={product} />
                ))}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {auth.isAuthenticated ? (
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          disabled={isStreaming}
          isStreaming={isStreaming}
        />
      ) : (
        <div className="border-t p-3">
          <button
            onClick={() => auth.signinRedirect()}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Se connecter pour discuter
          </button>
        </div>
      )}
    </div>
  );
}
