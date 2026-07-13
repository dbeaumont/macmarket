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

export const EMPTY_CART: Cart = {
  id: null,
  userId: '',
  items: [],
  total: 0,
};
