const API_BASE = '/api/v1';

let _getToken: (() => Promise<string | undefined>) | null = null;

export function setTokenProvider(fn: () => Promise<string | undefined>): void {
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

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { readonly message: string }).message)
      : `API error ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export interface RevenueChartPoint {
  readonly date: string;
  readonly revenue: number;
}

export interface OrderChartPoint {
  readonly date: string;
  readonly count: number;
}

export interface RecentOrder {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly itemCount: number;
  readonly createdAt: string;
}

export interface LowStockProduct {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly stockQuantity: number;
  readonly reservedQuantity: number;
  readonly availableQuantity: number;
}

export interface DashboardData {
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly totalCustomers: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly ordersByStatus: Readonly<Record<string, number>>;
  readonly revenueChart: readonly RevenueChartPoint[];
  readonly recentOrders: readonly RecentOrder[];
  readonly lowStockProducts: readonly LowStockProduct[];
}

export interface PageResponse<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly size: number;
  readonly number: number;
}

export interface AdminOrder {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly itemCount: number;
  readonly shippingName: string;
  readonly shippingAddress: string;
  readonly shippingEmail: string;
  readonly createdAt: string;
}

export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

export interface AdminOrderDetail extends AdminOrder {
  readonly items: readonly OrderItem[];
}

export interface CustomerSummary {
  readonly userId: string;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly lastOrderDate: string;
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
  readonly createdAt: string;
}

export interface CreateProductRequest {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly shortDesc: string;
  readonly price: number;
  readonly category: string;
  readonly imageUrl: string;
  readonly stockQuantity: number;
  readonly specs: Readonly<Record<string, string>>;
}

export interface UpdateProductRequest {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly shortDesc: string;
  readonly price: number;
  readonly category: string;
  readonly imageUrl: string;
  readonly stockQuantity: number;
  readonly specs: Readonly<Record<string, string>>;
}

export interface RevenueStatsData {
  readonly totalRevenue: number;
  readonly averageOrderValue: number;
  readonly orderCount: number;
  readonly chart: readonly RevenueChartPoint[];
}

export interface ProductStatsData {
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly lowStockProducts: readonly LowStockProduct[];
}

export interface CustomerStatsData {
  readonly totalCustomers: number;
  readonly newCustomers: number;
  readonly averageSpentPerCustomer: number;
  readonly totalRevenue: number;
}

export interface OrderStatsData {
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly byStatus: Readonly<Record<string, number>>;
  readonly chart: readonly OrderChartPoint[];
}

export function fetchDashboard(): Promise<DashboardData> {
  return apiFetch('/admin/dashboard');
}

export function fetchAdminOrders(params: URLSearchParams): Promise<PageResponse<AdminOrder>> {
  return apiFetch(`/admin/orders?${params.toString()}`);
}

export function fetchAdminOrder(id: string): Promise<AdminOrderDetail> {
  return apiFetch(`/admin/orders/${id}`);
}

export function updateOrderStatus(id: string, status: string): Promise<void> {
  return apiFetch(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function fetchCustomers(params: URLSearchParams): Promise<PageResponse<CustomerSummary>> {
  return apiFetch(`/admin/customers?${params.toString()}`);
}

export function fetchCustomerOrders(userId: string): Promise<readonly AdminOrder[]> {
  return apiFetch(`/admin/customers/${userId}/orders`);
}

export function fetchProducts(params: URLSearchParams): Promise<PageResponse<Product>> {
  return apiFetch(`/products?${params.toString()}`);
}

export function createProduct(data: CreateProductRequest): Promise<Product> {
  return apiFetch('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
  return apiFetch(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

export function fetchRevenueStats(period: string): Promise<RevenueStatsData> {
  return apiFetch(`/admin/stats/revenue?period=${period}`);
}

export function fetchProductStats(period: string): Promise<ProductStatsData> {
  return apiFetch(`/admin/stats/products?period=${period}`);
}

export function fetchCustomerStats(period: string): Promise<CustomerStatsData> {
  return apiFetch(`/admin/stats/customers?period=${period}`);
}

export function fetchOrderStats(period: string): Promise<OrderStatsData> {
  return apiFetch(`/admin/stats/orders?period=${period}`);
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
