import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { type OrderResponse, type PaymentResponse, type PlaceOrderRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  placeOrder(data: PlaceOrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/orders', data);
  }

  getOrders(): Observable<readonly OrderResponse[]> {
    return this.api.get<readonly OrderResponse[]>('/orders');
  }

  getOrder(id: string): Observable<OrderResponse> {
    return this.api.get<OrderResponse>(`/orders/${id}`);
  }

  getPaymentStatus(orderId: string): Observable<PaymentResponse> {
    return this.api.get<PaymentResponse>(`/payments/order/${orderId}`);
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.api.getBlobWithAuth(`/orders/${orderId}/invoice`);
  }
}
