import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../core/services/admin-api.service';
import { type CustomerSummary } from '../../core/models/admin.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe, MatButtonModule, MatIconModule,
            MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './customers-list.component.html',
})
export class CustomersListComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly customers = signal<readonly CustomerSummary[]>([]);
  readonly loading = signal(true);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  page = 0;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.adminApi.getCustomers({ page: String(this.page), size: '20' }).subscribe({
      next: (p) => {
        this.customers.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages() - 1) { this.page++; this.loadCustomers(); }
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.loadCustomers(); }
  }
}
