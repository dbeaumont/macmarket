import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { mergeGuestCart } from '@/lib/api';
import { peekGuestToken, clearGuestToken } from '@/lib/guest-cart';
import { useCartStore } from '@/stores/cart-store';

export function GuestCartMerge() {
  const auth = useAuth();
  const fetchCart = useCartStore(s => s.fetchCart);
  const mergingRef = useRef(false);

  useEffect(() => {
    const token = peekGuestToken();
    if (!auth.isAuthenticated || !token || mergingRef.current) return;

    mergingRef.current = true;
    mergeGuestCart(token)
      .then(() => {
        clearGuestToken();
        return fetchCart();
      })
      .catch(() => {
        mergingRef.current = false;
      });
  }, [auth.isAuthenticated, fetchCart]);

  return null;
}
