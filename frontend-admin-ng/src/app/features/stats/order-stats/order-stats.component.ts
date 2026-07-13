import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type OrderStatsData, ORDER_STATUS_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-order-stats',
  standalone: true,
  imports: [RouterLink, FormsModule, KeyValuePipe, MatSelectModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './order-stats.component.html',
})
export class OrderStatsComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  readonly data = signal<OrderStatsData | null>(null);
  readonly loading = signal(true);
  period = '30d';
  readonly statusLabels = ORDER_STATUS_LABELS;

  readonly periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '12m', label: '12 mois' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminApi.getOrderStats(this.period).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  completedOrders(): number {
    return this.data()?.byStatus['DELIVERED'] ?? 0;
  }

  pendingOrders(): number {
    const d = this.data();
    if (!d) return 0;
    return (d.byStatus['PENDING_PAYMENT'] ?? 0) + (d.byStatus['CONFIRMED'] ?? 0);
  }

  cancelledOrders(): number {
    return this.data()?.byStatus['CANCELLED'] ?? 0;
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
