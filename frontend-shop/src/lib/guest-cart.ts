const GUEST_CART_STORAGE_KEY = 'macmarket_guest_cart_token';

export function getOrCreateGuestToken(): string {
  const existing = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const token = crypto.randomUUID();
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, token);
  return token;
}

export function peekGuestToken(): string | null {
  return window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
}

export function clearGuestToken(): void {
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}
