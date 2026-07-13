import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type Product, CATEGORY_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly products = signal<readonly Product[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly categoryLabels = CATEGORY_LABELS;

  search = '';
  page = 0;
  readonly PAGE_SIZE = 20;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const params: Record<string, string> = {
      page: String(this.page),
      size: String(this.PAGE_SIZE),
    };
    if (this.search) params['search'] = this.search;

    this.adminApi.getProducts(params).subscribe({
      next: (p) => {
        this.products.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    this.page = 0;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.page < this.totalPages() - 1) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  updatePromo(product: Product, promotionPercentage: number): void {
    this.adminApi.updatePromotion(product.id, promotionPercentage).subscribe({
      next: () => {
        this.snackBar.open('Promotion mise à jour', 'OK', { duration: 2000 });
        this.loadProducts();
      },
      error: (err: Error) => this.snackBar.open(err.message, 'OK', { duration: 4000 }),
    });
  }

  deleteProduct(id: string, name: string): void {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    this.adminApi.deleteProduct(id).subscribe({
      next: () => {
        this.snackBar.open('Produit supprimé', 'OK', { duration: 2000 });
        this.loadProducts();
      },
      error: (err: Error) => this.snackBar.open(err.message, 'OK', { duration: 4000 }),
    });
  }

  stockClass(product: Product): string {
    const avail = product.stockQuantity - product.reservedQuantity;
    if (avail <= 0) return 'text-red-600';
    if (avail <= 5) return 'text-orange-500';
    return 'text-green-600';
  }
}
