import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 sm:right-6"
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
