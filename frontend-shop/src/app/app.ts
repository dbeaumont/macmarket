import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { CartService } from './core/services/cart.service';
import { ShopHeaderComponent } from './shared/components/header/shop-header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { ChatWidgetComponent } from './features/chat/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShopHeaderComponent, FooterComponent, CartDrawerComponent, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly cartService = inject(CartService);

  readonly cartOpen = false;

  ngOnInit(): void {
    this.oidc.checkAuth().subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        void this.cartService.mergeGuestCart();
      }
      void this.cartService.fetchCart();
    });
  }
}

