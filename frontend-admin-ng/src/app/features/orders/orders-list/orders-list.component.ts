import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../core/services/admin-api.service';
import { type AdminOrder, ORDER_STATUS_LABELS } from '../../core/models/admin.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly orders = signal<readonly AdminOrder[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly statusLabels = ORDER_STATUS_LABELS;

  statusFilter = '';
  page = 0;

  readonly statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const params: Record<string, string> = { page: String(this.page), size: '20' };
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.adminApi.getOrders(params).subscribe({
      next: (p) => {
        this.orders.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadOrders();
  }

  nextPage(): void {
    if (this.page < this.totalPages() - 1) { this.page++; this.loadOrders(); }
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.loadOrders(); }
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
