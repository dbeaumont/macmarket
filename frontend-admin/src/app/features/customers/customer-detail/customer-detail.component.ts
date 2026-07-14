import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type AdminOrder, type CustomerProfile, ORDER_STATUS_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<readonly AdminOrder[]>([]);
  readonly profile = signal<CustomerProfile | null>(null);
  readonly loading = signal(true);
  readonly userId = signal('');
  readonly statusLabels = ORDER_STATUS_LABELS;

  get totalSpent(): number {
    return this.orders().reduce((sum, o) => sum + o.total, 0);
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId') ?? '';
    this.userId.set(userId);
    this.adminApi.getCustomerOrders(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.adminApi.getCustomerProfile(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (p) => this.profile.set(p),
      error: () => this.profile.set(null),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }
}
