import { Injectable } from '@angular/core';

const GUEST_CART_KEY = 'macmarket_guest_cart_token';

@Injectable({ providedIn: 'root' })
export class GuestCartService {
  getOrCreateToken(): string {
    const existing = localStorage.getItem(GUEST_CART_KEY);
    if (existing) return existing;
    const token = crypto.randomUUID();
    localStorage.setItem(GUEST_CART_KEY, token);
    return token;
  }

  peekToken(): string | null {
    return localStorage.getItem(GUEST_CART_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  }
}
