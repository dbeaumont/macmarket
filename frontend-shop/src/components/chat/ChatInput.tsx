import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface Props {
  readonly onSend: (message: string) => void;
  readonly onStop: () => void;
  readonly disabled: boolean;
  readonly isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, disabled, isStreaming }: Props) {
  const [input, setInput] = useState<string>('');

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2 items-end">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Posez votre question..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="shrink-0 rounded-lg bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          <Square className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="shrink-0 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
