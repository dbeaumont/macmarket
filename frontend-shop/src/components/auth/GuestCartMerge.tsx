import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeGuestCart } from '@/lib/api';
import { peekGuestToken, clearGuestToken } from '@/lib/guest-cart';

export function GuestCartMerge() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const mergingRef = useRef(false);

  const mergeMutation = useMutation({
    mutationFn: (token: string) => mergeGuestCart(token),
    onSuccess: () => {
      clearGuestToken();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onSettled: () => {
      mergingRef.current = false;
    },
  });

  useEffect(() => {
    const token = peekGuestToken();
    if (!auth.isAuthenticated || !token || mergingRef.current) return;

    mergingRef.current = true;
    mergeMutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated]);

  return null;
}
