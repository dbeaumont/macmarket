import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type ProductStatsData, CATEGORY_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-product-stats',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-2">
        <a routerLink="/stats" class="text-gray-500 hover:text-gray-900"><mat-icon>chevron_left</mat-icon></a>
        <h1 class="text-2xl font-bold text-gray-900">Produits</h1>
      </div>
      @if (loading()) {
        <div class="flex justify-center py-16"><mat-spinner [diameter]="48" /></div>
      } @else if (data()) {
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-gray-900">{{ data()!.totalProducts }}</p>
            <p class="text-sm text-gray-500">Total</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-green-600">{{ data()!.activeProducts }}</p>
            <p class="text-sm text-gray-500">Actifs</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-3xl font-bold text-orange-500">{{ data()!.lowStockCount }}</p>
            <p class="text-sm text-gray-500">Stock faible</p>
          </div>
        </div>
        @if (data()!.lowStockProducts.length > 0) {
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 font-semibold text-gray-800">Produits à réapprovisionner</div>
            @for (p of data()!.lowStockProducts; track p.id) {
              <div class="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ p.name }}</p>
                  <p class="text-xs text-gray-500">{{ categoryLabels[p.category] ?? p.category }}</p>
                </div>
                <span class="text-sm font-bold" [class.text-red-600]="p.availableQuantity <= 0"
                      [class.text-orange-500]="p.availableQuantity > 0">
                  {{ p.availableQuantity }} dispo
                </span>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ProductStatsComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  readonly data = signal<ProductStatsData | null>(null);
  readonly loading = signal(true);
  readonly categoryLabels = CATEGORY_LABELS;

  ngOnInit(): void {
    this.adminApi.getProductStats('30d').subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
