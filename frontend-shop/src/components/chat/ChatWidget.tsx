import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useChat, setChatTokenProvider } from '@/hooks/use-chat';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const auth = useAuth();
  const userId = auth.user?.profile.sub as string | undefined;
  const chatState = useChat(userId);

  useEffect(() => {
    setChatTokenProvider(async () => {
      if (auth.user?.expired) {
        try {
          await auth.signinSilent();
        } catch {
          /* ignore */
        }
      }
      return auth.user?.access_token;
    });
  }, [auth]);

  return (
    <>
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} {...chatState} />}
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
