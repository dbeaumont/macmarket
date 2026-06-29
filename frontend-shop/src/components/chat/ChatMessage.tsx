import { Bot, User } from 'lucide-react';
import type { ChatMessageData } from '@/hooks/use-chat';

interface Props {
  readonly message: ChatMessageData;
  readonly isLast: boolean;
  readonly isStreaming: boolean;
}

export function ChatMessage({ message, isLast, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const showCursor = !isUser && isLast && isStreaming;

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content || (showCursor ? '' : '...')}
          {showCursor && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}
