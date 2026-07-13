import { Component, inject, OnInit, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { type Product, CATEGORY_LABELS } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly categoryLabels = CATEGORY_LABELS;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.productService.getProduct(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  get available(): number {
    const p = this.product();
    return p ? p.stockQuantity - p.reservedQuantity : 0;
  }

  get specEntries(): Array<{ key: string; value: string }> {
    const specs = this.product()?.specs ?? {};
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }

  decreaseQty(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  increaseQty(): void {
    if (this.quantity() < this.available) this.quantity.update((q) => q + 1);
  }

  async addToCart(): Promise<void> {
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    try {
      await this.cartService.addItem(p.id, this.quantity());
    } finally {
      this.addingToCart.set(false);
    }
  }
}
