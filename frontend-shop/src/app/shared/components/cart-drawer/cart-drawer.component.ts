import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../../core/services/cart.service';
import { CartDrawerService } from './cart-drawer.service';
import { type CartItem } from '../../../core/models/cart.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, CurrencyPipe],
  templateUrl: './cart-drawer.component.html',
})
export class CartDrawerComponent {
  readonly cartService = inject(CartService);
  readonly drawerService = inject(CartDrawerService);

  close(): void {
    this.drawerService.close();
  }

  async updateQuantity(item: CartItem, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.cartService.removeItem(item.productId);
    } else {
      await this.cartService.updateQuantity(item.productId, quantity);
    }
  }

  async removeItem(productId: string): Promise<void> {
    await this.cartService.removeItem(productId);
  }

  async clearCart(): Promise<void> {
    await this.cartService.clearCart();
  }

  trackByProductId(_: number, item: CartItem): string {
    return item.productId;
  }
}
