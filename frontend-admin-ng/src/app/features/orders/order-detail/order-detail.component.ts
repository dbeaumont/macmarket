import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { type AdminOrderDetail, ORDER_STATUS_LABELS } from '../../../core/models/admin.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CurrencyPipe, MatButtonModule, MatIconModule,
            MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly order = signal<AdminOrderDetail | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly downloading = signal(false);
  readonly statusLabels = ORDER_STATUS_LABELS;

  selectedStatus = '';

  readonly statusOptions = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.adminApi.getOrder(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.selectedStatus = o.status;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveStatus(): void {
    const o = this.order();
    if (!o || this.saving()) return;
    this.saving.set(true);
    this.adminApi.updateOrderStatus(o.id, this.selectedStatus).subscribe({
      next: () => {
        this.snackBar.open('Statut mis à jour', 'OK', { duration: 2000 });
        this.order.update((prev) => prev ? { ...prev, status: this.selectedStatus } : prev);
        this.saving.set(false);
      },
      error: (err: Error) => {
        this.snackBar.open(err.message, 'OK', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  downloadInvoice(): void {
    const o = this.order();
    if (!o) return;
    this.downloading.set(true);
    this.adminApi.downloadInvoice(o.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${o.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: (err: Error) => {
        this.snackBar.open(err.message, 'OK', { duration: 4000 });
        this.downloading.set(false);
      },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }
}
