import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { type Product, type PageResponse, type CategoryCount } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(params: Record<string, string>): Observable<PageResponse<Product>> {
    return this.api.getWithParams<PageResponse<Product>>('/products', new HttpParams({ fromObject: params }));
  }

  getProduct(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/${slug}`);
  }

  getCategories(): Observable<readonly CategoryCount[]> {
    return this.api.get<readonly CategoryCount[]>('/categories');
  }
}
