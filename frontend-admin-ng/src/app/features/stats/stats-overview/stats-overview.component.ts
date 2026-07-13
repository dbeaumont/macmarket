import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Statistiques</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a routerLink="/stats/revenue"
           class="block rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow text-center">
          <mat-icon class="text-4xl text-green-500 block mb-2">euro</mat-icon>
          <p class="font-semibold text-gray-900">Revenus</p>
          <p class="text-sm text-gray-500">CA et panier moyen</p>
        </a>
        <a routerLink="/stats/orders"
           class="block rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow text-center">
          <mat-icon class="text-4xl text-blue-500 block mb-2">receipt_long</mat-icon>
          <p class="font-semibold text-gray-900">Commandes</p>
          <p class="text-sm text-gray-500">Volume et statuts</p>
        </a>
        <a routerLink="/stats/products"
           class="block rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow text-center">
          <mat-icon class="text-4xl text-orange-500 block mb-2">inventory_2</mat-icon>
          <p class="font-semibold text-gray-900">Produits</p>
          <p class="text-sm text-gray-500">Stock et catalogue</p>
        </a>
        <a routerLink="/stats/customers"
           class="block rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow text-center">
          <mat-icon class="text-4xl text-purple-500 block mb-2">people</mat-icon>
          <p class="font-semibold text-gray-900">Clients</p>
          <p class="text-sm text-gray-500">Acquisition et fidélité</p>
        </a>
      </div>
    </div>
  `,
})
export class StatsOverviewComponent {}
