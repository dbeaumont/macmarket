import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../core/services/product.service';
import { type Product } from '../../core/models/product.model';
import { ProductGridComponent } from '../../shared/components/product-grid/product-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, ProductGridComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<readonly Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.productService
      .getProducts({ size: '4', sort: 'createdAt,desc' })
      .subscribe({
        next: (page) => {
          this.products.set(page.content);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
