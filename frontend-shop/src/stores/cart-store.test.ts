import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Cart } from './cart-store';

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}));

import { apiFetch } from '@/lib/api';
import { useCartStore } from './cart-store';

const mockedApiFetch = vi.mocked(apiFetch);

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 'cart-1',
    userId: 'user-1',
    items: [
      { productId: 'p1', productName: 'Mac Mini', productImage: '', unitPrice: 100, quantity: 2, subtotal: 200 },
      { productId: 'p2', productName: 'MacBook Air', productImage: '', unitPrice: 300, quantity: 1, subtotal: 300 },
    ],
    total: 500,
    ...overrides,
  };
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, loading: false });
    mockedApiFetch.mockReset();
  });

  it('itemCount sums the quantity of every line, not the number of lines', () => {
    useCartStore.setState({ cart: buildCart() });

    expect(useCartStore.getState().itemCount()).toBe(3);
  });

  it('itemCount returns 0 when there is no cart yet', () => {
    expect(useCartStore.getState().itemCount()).toBe(0);
  });

  it('removeItem drops the matching line and recomputes the total immutably', async () => {
    const initialCart = buildCart();
    useCartStore.setState({ cart: initialCart });
    mockedApiFetch.mockResolvedValue(undefined);

    await useCartStore.getState().removeItem('p1');

    const updatedCart = useCartStore.getState().cart;
    expect(updatedCart?.items).toHaveLength(1);
    expect(updatedCart?.items[0].productId).toBe('p2');
    expect(updatedCart?.total).toBe(300);
    // the original cart object and its items array must not be mutated in place
    expect(initialCart.items).toHaveLength(2);
    expect(updatedCart).not.toBe(initialCart);
    expect(updatedCart?.items).not.toBe(initialCart.items);
  });

  it('clearCart resets the cart to an empty, zero-total state', async () => {
    useCartStore.setState({ cart: buildCart() });
    mockedApiFetch.mockResolvedValue(undefined);

    await useCartStore.getState().clearCart();

    const cart = useCartStore.getState().cart;
    expect(cart?.items).toEqual([]);
    expect(cart?.total).toBe(0);
  });

  it('addItem replaces the cart with the server response and does not mutate the previous one', async () => {
    const initialCart = buildCart();
    useCartStore.setState({ cart: initialCart });
    const serverCart = buildCart({ total: 999 });
    mockedApiFetch.mockResolvedValue(serverCart);

    await useCartStore.getState().addItem('p3', 1);

    expect(useCartStore.getState().cart).toBe(serverCart);
    expect(initialCart.total).toBe(500);
  });
});
