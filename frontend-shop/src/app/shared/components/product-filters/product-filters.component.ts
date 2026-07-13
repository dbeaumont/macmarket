import { Component, output, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { type CategoryCount, CATEGORY_LABELS } from '../../../core/models/product.model';

export interface ProductFilters {
  readonly search: string;
  readonly category: string;
  readonly sort: string;
}

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule],
  templateUrl: './product-filters.component.html',
})
export class ProductFiltersComponent {
  readonly categories = input<readonly CategoryCount[]>([]);
  readonly filtersChange = output<ProductFilters>();

  search = '';
  category = '';
  sort = 'name,asc';
  readonly categoryLabels = CATEGORY_LABELS;

  readonly sortOptions = [
    { value: 'name,asc', label: 'Nom A–Z' },
    { value: 'name,desc', label: 'Nom Z–A' },
    { value: 'price,asc', label: 'Prix croissant' },
    { value: 'price,desc', label: 'Prix décroissant' },
    { value: 'createdAt,desc', label: 'Nouveautés' },
  ];

  emit(): void {
    this.filtersChange.emit({ search: this.search, category: this.category, sort: this.sort });
  }

  reset(): void {
    this.search = '';
    this.category = '';
    this.sort = 'name,asc';
    this.emit();
  }
}
