import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { CartDrawerService } from '../cart-drawer/cart-drawer.service';

@Component({
  selector: 'app-shop-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './shop-header.component.html',
})
export class ShopHeaderComponent implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly cartService = inject(CartService);
  private readonly cartDrawerService = inject(CartDrawerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAuthenticated = signal(false);
  readonly userName = signal<string>('');
  readonly mobileMenuOpen = signal(false);
  readonly itemCount = this.cartService.itemCount;

  ngOnInit(): void {
    this.oidc.isAuthenticated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isAuthenticated }) => {
      this.isAuthenticated.set(isAuthenticated);
    });
    this.oidc.userData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ userData }) => {
      if (userData) {
        this.userName.set((userData['name'] as string) || (userData['preferred_username'] as string) || '');
      }
    });
  }

  openCart(): void {
    this.cartDrawerService.open();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    const keycloakUrl = 'http://localhost:8180';
    const appUrl = window.location.origin;
    this.oidc.logoffAndRevokeTokens().subscribe(() => {
      const logoutUrl = new URL(`${keycloakUrl}/realms/macmarket/protocol/openid-connect/logout`);
      logoutUrl.searchParams.set('client_id', 'macmarket-shop');
      logoutUrl.searchParams.set('post_logout_redirect_uri', appUrl);
      window.location.href = logoutUrl.toString();
    });
  }
}
