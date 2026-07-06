import { create } from 'zustand';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export interface CartItem {
  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface Cart {
  readonly id: string | null;
  readonly userId: string;
  readonly items: readonly CartItem[];
  readonly total: number;
}

interface CartState {
  readonly cart: Cart | null;
  readonly loading: boolean;
  readonly setCart: (cart: Cart) => void;
  readonly fetchCart: () => Promise<void>;
  readonly addItem: (productId: string, quantity: number) => Promise<void>;
  readonly updateQuantity: (productId: string, quantity: number) => Promise<void>;
  readonly removeItem: (productId: string) => Promise<void>;
  readonly clearCart: () => Promise<void>;
  readonly itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  setCart: (cart: Cart) => {
    set({ cart });
  },

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await apiFetch<Cart>('/cart');
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    const cart = await apiFetch<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    set({ cart });
    toast.success('Produit ajoute au panier');
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const cart = await apiFetch<Cart>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    set({ cart });
  },

  removeItem: async (productId: string) => {
    await apiFetch(`/cart/items/${productId}`, { method: 'DELETE' });
    const { cart } = get();
    if (cart) {
      const items = cart.items.filter(i => i.productId !== productId);
      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      set({ cart: { ...cart, items, total } });
    }
  },

  clearCart: async () => {
    await apiFetch('/cart', { method: 'DELETE' });
    set({ cart: { id: null, userId: '', items: [], total: 0 } });
  },

  itemCount: () => {
    return get().cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  },
}));
