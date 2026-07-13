import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe } from '@angular/common';
import { type Product, CATEGORY_LABELS } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule, CurrencyPipe],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  private readonly cartService = inject(CartService);
  readonly categoryLabels = CATEGORY_LABELS;

  get available(): number {
    const p = this.product();
    return p.stockQuantity - p.reservedQuantity;
  }

  get categoryLabel(): string {
    return CATEGORY_LABELS[this.product().category] ?? this.product().category;
  }

  async addToCart(): Promise<void> {
    await this.cartService.addItem(this.product().id, 1);
  }
}
