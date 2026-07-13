import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../../core/services/order.service';
import { type OrderResponse, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, MatProgressSpinnerModule, MatIconModule, MatChipsModule],
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<readonly OrderResponse[]>([]);
  readonly loading = signal(true);
  readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }
}
