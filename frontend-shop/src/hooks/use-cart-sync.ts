import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { apiFetch } from '@/lib/api';
import { useCartStore } from '@/stores/cart-store';
import type { Cart } from '@/stores/cart-store';

export function useCartSync(): void {
  const auth = useAuth();
  const setCart = useCartStore((s) => s.setCart);

  const { data } = useQuery({
    queryKey: ['cart', auth.isAuthenticated],
    queryFn: () => apiFetch<Cart>('/cart'),
  });

  useEffect(() => {
    if (data) {
      setCart(data);
    }
  }, [data, setCart]);
}
