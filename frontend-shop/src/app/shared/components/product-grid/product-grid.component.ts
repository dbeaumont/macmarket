import { Component, input } from '@angular/core';
import { type Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      @for (product of products(); track product.id) {
        <app-product-card [product]="product" />
      }
    </div>
  `,
})
export class ProductGridComponent {
  readonly products = input.required<readonly Product[]>();
}
