import type { Cart } from '@/stores/cart-store';
import { getOrCreateGuestToken } from '@/lib/guest-cart';

const API_BASE = '/api/v1';

let _getToken: (() => Promise<string | undefined>) | null = null;

export function setTokenProvider(fn: () => Promise<string | undefined>) {
  _getToken = fn;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (!headers['Authorization'] && path.startsWith('/cart')) {
    headers['X-Guest-Cart-Token'] = getOrCreateGuestToken();
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json();
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly shortDesc: string;
  readonly price: number;
  readonly category: string;
  readonly imageUrl: string;
  readonly stockQuantity: number;
  readonly reservedQuantity: number;
  readonly active: boolean;
  readonly specs: Readonly<Record<string, string>>;
  readonly promotionPercentage: number;
  readonly discountedPrice: number;
  readonly createdAt: string;
}

export interface PageResponse<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly size: number;
  readonly number: number;
}

export interface CategoryCount {
  readonly category: string;
  readonly count: number;
}

export interface UserInfo {
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly preferredUsername: string;
  readonly roles: readonly string[];
}

export function fetchProducts(params: URLSearchParams): Promise<PageResponse<Product>> {
  return apiFetch(`/products?${params.toString()}`);
}

export function fetchProduct(slug: string): Promise<Product> {
  return apiFetch(`/products/${slug}`);
}

export function fetchCategories(): Promise<CategoryCount[]> {
  return apiFetch('/categories');
}

export function fetchMe(): Promise<UserInfo> {
  return apiFetch('/users/me');
}

export interface ShippingProfile {
  readonly name: string;
  readonly address: string;
  readonly email: string;
}

export async function fetchShippingProfile(): Promise<ShippingProfile | null> {
  const profile = await apiFetch<ShippingProfile | undefined>('/users/me/shipping-profile');
  return profile ?? null;
}

export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface OrderResponse {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
  readonly createdAt: string;
}

export interface PaymentResponse {
  readonly id: string;
  readonly orderId: string;
  readonly amount: number;
  readonly status: string;
  readonly transactionRef: string;
  readonly failureReason: string;
  readonly createdAt: string;
}

export function placeOrder(data: { readonly shippingName: string; readonly shippingAddress: string; readonly shippingEmail: string }): Promise<OrderResponse> {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchOrders(): Promise<readonly OrderResponse[]> {
  return apiFetch('/orders');
}

export function fetchOrder(id: string): Promise<OrderResponse> {
  return apiFetch(`/orders/${id}`);
}

export function fetchPaymentStatus(orderId: string): Promise<PaymentResponse> {
  return apiFetch(`/payments/order/${orderId}`);
}

export function mergeGuestCart(guestToken: string): Promise<Cart> {
  return apiFetch('/cart/merge', { method: 'POST', body: JSON.stringify({ guestToken }) });
}

export async function fetchInvoiceBlob(orderId: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/orders/${orderId}/invoice`, { headers });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { readonly message: string }).message)
        : `API error ${res.status}`;
    throw new Error(message);
  }
  return res.blob();
}
