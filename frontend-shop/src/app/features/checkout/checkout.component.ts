import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { type ShippingProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly cart = this.cartService.cart;
  readonly submitting = signal(false);

  readonly shippingForm = this.fb.nonNullable.group({
    shippingName: ['', [Validators.required, Validators.minLength(2)]],
    shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
    shippingEmail: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.userService.getShippingProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.shippingForm.patchValue({
            shippingName: profile.name,
            shippingAddress: profile.address,
            shippingEmail: profile.email,
          });
        }
      },
    });
  }

  async submit(): Promise<void> {
    if (this.shippingForm.invalid || this.submitting()) return;
    this.submitting.set(true);
    try {
      const order = await this.orderService.placeOrder(this.shippingForm.getRawValue()).toPromise();
      if (order) {
        await this.cartService.fetchCart();
        void this.router.navigate(['/orders', order.id]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la commande';
      this.snackBar.open(message, 'OK', { duration: 4000 });
    } finally {
      this.submitting.set(false);
    }
  }
}
