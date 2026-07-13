import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserService } from '../../core/services/user.service';
import { type UserInfo } from '../../core/models/user.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly userService = inject(UserService);

  readonly userInfo = signal<UserInfo | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (u) => {
        this.userInfo.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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
