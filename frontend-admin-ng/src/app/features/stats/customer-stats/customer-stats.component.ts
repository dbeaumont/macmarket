import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type CustomerStatsData } from '../../../core/models/admin.model';

@Component({
  selector: 'app-customer-stats',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-2">
        <a routerLink="/stats" class="text-gray-500 hover:text-gray-900"><mat-icon>chevron_left</mat-icon></a>
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
      </div>
      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner [diameter]="48" /></div>
      } @else if (data()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-gray-900">{{ data()!.totalCustomers }}</p>
            <p class="text-sm text-gray-500">Clients total</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-green-600">{{ data()!.newCustomers }}</p>
            <p class="text-sm text-gray-500">Nouveaux</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-gray-900">{{ data()!.averageSpentPerCustomer | currency:'EUR':'symbol':'1.0-0':'fr' }}</p>
            <p class="text-sm text-gray-500">Panier moyen/client</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-gray-900">{{ data()!.totalRevenue | currency:'EUR':'symbol':'1.0-0':'fr' }}</p>
            <p class="text-sm text-gray-500">CA généré</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class CustomerStatsComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  readonly data = signal<CustomerStatsData | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.adminApi.getCustomerStats('30d').subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
