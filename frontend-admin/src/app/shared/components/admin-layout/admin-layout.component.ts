import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatest } from 'rxjs';
import { getAdminRoles } from '../../../core/guards/admin.guard';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  readonly adminOnly?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { path: '/orders', label: 'Commandes', icon: 'receipt_long' },
  { path: '/inventory', label: 'Inventaire', icon: 'inventory_2' },
  { path: '/customers', label: 'Clients', icon: 'people' },
  { path: '/stats', label: 'Statistiques', icon: 'bar_chart', adminOnly: true },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, MatButtonModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly router = inject(Router);

  readonly isAuthenticated = signal(false);
  readonly userName = signal('');
  readonly isAdmin = signal(false);
  readonly sidebarOpen = signal(false);
  readonly navItems = NAV_ITEMS;

  ngOnInit(): void {
    combineLatest([this.oidc.isAuthenticated$, this.oidc.userData$]).subscribe(
      ([{ isAuthenticated }, { userData }]) => {
        this.isAuthenticated.set(isAuthenticated);
        if (userData) {
          this.userName.set((userData['name'] as string) || (userData['preferred_username'] as string) || '');
          const roles = getAdminRoles(userData);
          this.isAdmin.set(roles.includes('ADMIN'));
        }
      }
    );
  }

  visibleNav(): readonly NavItem[] {
    return this.navItems.filter((n) => !n.adminOnly || this.isAdmin());
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    const keycloakUrl = 'http://localhost:8180';
    const appUrl = window.location.origin;
    this.oidc.logoffAndRevokeTokens().subscribe(() => {
      const url = new URL(`${keycloakUrl}/realms/macmarket/protocol/openid-connect/logout`);
      url.searchParams.set('client_id', 'macmarket-admin');
      url.searchParams.set('post_logout_redirect_uri', appUrl);
      window.location.href = url.toString();
    });
  }
}
