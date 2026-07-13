import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type RevenueStatsData } from '../../../core/models/admin.model';

@Component({
  selector: 'app-revenue-stats',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './revenue-stats.component.html',
})
export class RevenueStatsComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly data = signal<RevenueStatsData | null>(null);
  readonly loading = signal(true);
  period = '30d';

  readonly periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '12m', label: '12 mois' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminApi.getRevenueStats(this.period).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
