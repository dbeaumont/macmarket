import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { type Cart, type CartItem, EMPTY_CART } from '../models/cart.model';
import { GuestCartService } from './guest-cart.service';

const API_BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly oidc = inject(OidcSecurityService);
  private readonly guestCart = inject(GuestCartService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly _cart = signal<Cart | null>(null);
  private readonly _loading = signal(false);

  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly itemCount = computed(() =>
    this._cart()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  );
  readonly total = computed(() => this._cart()?.total ?? 0);

  private async getHeaders(path: string): Promise<HttpHeaders> {
    const token = await firstValueFrom(this.oidc.getAccessToken());
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else if (path.startsWith('/cart')) {
      headers = headers.set('X-Guest-Cart-Token', this.guestCart.getOrCreateToken());
    }
    return headers;
  }

  private async apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = await this.getHeaders(path);
    const fetchHeaders: Record<string, string> = {};
    headers.keys().forEach((key) => {
      fetchHeaders[key] = headers.get(key)!;
    });

    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: fetchHeaders,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body['message'] === 'string' ? body['message'] : `API error ${res.status}`);
    }
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  }

  setCart(cart: Cart): void {
    this._cart.set(cart);
  }

  async fetchCart(): Promise<void> {
    this._loading.set(true);
    try {
      const cart = await this.apiFetch<Cart>('/cart');
      this._cart.set(cart);
    } catch {
      // Ignore cart fetch errors silently
    } finally {
      this._loading.set(false);
    }
  }

  async addItem(productId: string, quantity: number): Promise<void> {
    const cart = await this.apiFetch<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    this._cart.set(cart);
    this.snackBar.open('Produit ajouté au panier', 'OK', { duration: 2000 });
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const cart = await this.apiFetch<Cart>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    this._cart.set(cart);
  }

  async removeItem(productId: string): Promise<void> {
    await this.apiFetch(`/cart/items/${productId}`, { method: 'DELETE' });
    const current = this._cart();
    if (current) {
      const items = current.items.filter((i) => i.productId !== productId);
      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      this._cart.set({ ...current, items, total });
    }
  }

  async clearCart(): Promise<void> {
    await this.apiFetch('/cart', { method: 'DELETE' });
    this._cart.set(EMPTY_CART);
  }

  async mergeGuestCart(): Promise<void> {
    const guestToken = this.guestCart.peekToken();
    if (!guestToken) return;
    try {
      await this.apiFetch('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ guestCartToken: guestToken }),
      });
      this.guestCart.clearToken();
      await this.fetchCart();
    } catch {
      // Ignore merge errors
    }
  }
}
