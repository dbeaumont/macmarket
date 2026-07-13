import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../core/services/admin-api.service';
import { type DashboardData, ORDER_STATUS_LABELS } from '../../core/models/admin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    this.adminApi.getDashboard().subscribe({
      next: (d) => {
        this.data.set(d);
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

  orderStatusEntries(): Array<{ status: string; count: number }> {
    const d = this.data();
    if (!d) return [];
    return Object.entries(d.ordersByStatus).map(([status, count]) => ({ status, count }));
  }
}
