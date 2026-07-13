import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';
import { type Product, type CategoryCount } from '../../../core/models/product.model';
import { ProductGridComponent } from '../../../shared/components/product-grid/product-grid.component';
import { ProductFiltersComponent, type ProductFilters } from '../../../shared/components/product-filters/product-filters.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule, ProductGridComponent, ProductFiltersComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<readonly Product[]>([]);
  readonly categories = signal<readonly CategoryCount[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  private currentPage = 0;
  private currentFilters: ProductFilters = { search: '', category: '', sort: 'name,asc' };

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const params: Record<string, string> = {
      page: String(this.currentPage),
      size: '12',
    };
    if (this.currentFilters.search) params['search'] = this.currentFilters.search;
    if (this.currentFilters.category) params['category'] = this.currentFilters.category;
    if (this.currentFilters.sort) {
      const [prop, dir] = this.currentFilters.sort.split(',');
      params['sort'] = `${prop},${dir}`;
    }

    this.productService.getProducts(params).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFiltersChange(filters: ProductFilters): void {
    this.currentFilters = filters;
    this.currentPage = 0;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages() - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  get page(): number { return this.currentPage; }
}
