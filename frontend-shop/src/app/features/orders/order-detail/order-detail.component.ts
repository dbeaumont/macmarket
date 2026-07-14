import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { type OrderResponse, type PaymentResponse, ORDER_STATUS_LABELS } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<OrderResponse | null>(null);
  readonly payment = signal<PaymentResponse | null>(null);
  readonly loading = signal(true);
  readonly downloading = signal(false);
  readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.orderService
      .getOrder(id)
      .pipe(
        switchMap((order) => {
          this.order.set(order);
          this.loading.set(false);
          return this.orderService.getPaymentStatus(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (payment) => this.payment.set(payment),
        error: () => this.loading.set(false),
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

  downloadInvoice(): void {
    const orderId = this.order()?.id;
    if (!orderId) return;
    this.downloading.set(true);
    this.orderService.downloadInvoice(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${orderId}.pdf`;
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
}
