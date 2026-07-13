import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
  type DashboardData,
  type PageResponse,
  type AdminOrder,
  type AdminOrderDetail,
  type CustomerSummary,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
  type RevenueStatsData,
  type ProductStatsData,
  type CustomerStatsData,
  type OrderStatsData,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiService);

  // Dashboard
  getDashboard(): Observable<DashboardData> {
    return this.api.get('/admin/dashboard');
  }

  // Orders
  getOrders(params: Record<string, string>): Observable<PageResponse<AdminOrder>> {
    return this.api.getWithParams('/admin/orders', new HttpParams({ fromObject: params }));
  }

  getOrder(id: string): Observable<AdminOrderDetail> {
    return this.api.get(`/admin/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<void> {
    return this.api.put(`/admin/orders/${id}/status`, { status });
  }

  // Customers
  getCustomers(params: Record<string, string>): Observable<PageResponse<CustomerSummary>> {
    return this.api.getWithParams('/admin/customers', new HttpParams({ fromObject: params }));
  }

  getCustomerOrders(userId: string): Observable<readonly AdminOrder[]> {
    return this.api.get(`/admin/customers/${userId}/orders`);
  }

  // Products
  getProducts(params: Record<string, string>): Observable<PageResponse<Product>> {
    return this.api.getWithParams('/products', new HttpParams({ fromObject: params }));
  }

  getProduct(id: string): Observable<Product> {
    return this.api.get(`/admin/products/${id}`);
  }

  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.api.post('/admin/products', data);
  }

  updateProduct(id: string, data: UpdateProductRequest): Observable<Product> {
    return this.api.put(`/admin/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete(`/admin/products/${id}`);
  }

  updatePromotion(id: string, promotionPercentage: number): Observable<void> {
    return this.api.put(`/admin/products/${id}/promotion`, { promotionPercentage });
  }

  // Stats
  getRevenueStats(period: string): Observable<RevenueStatsData> {
    return this.api.get(`/admin/stats/revenue?period=${period}`);
  }

  getProductStats(period: string): Observable<ProductStatsData> {
    return this.api.get(`/admin/stats/products?period=${period}`);
  }

  getCustomerStats(period: string): Observable<CustomerStatsData> {
    return this.api.get(`/admin/stats/customers?period=${period}`);
  }

  getOrderStats(period: string): Observable<OrderStatsData> {
    return this.api.get(`/admin/stats/orders?period=${period}`);
  }

  // Invoice
  downloadInvoice(orderId: string): Observable<Blob> {
    return this.api.getBlobWithAuth(`/orders/${orderId}/invoice`);
  }
}
