import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-900">
      <div class="text-center text-white">
        <mat-icon class="text-6xl text-blue-400 mb-4 block">laptop_mac</mat-icon>
        <h1 class="text-3xl font-bold mb-2">MacMarket Backoffice</h1>
        <p class="text-gray-400 mb-8">Connectez-vous pour accéder à la gestion.</p>
        <button mat-raised-button color="primary" (click)="login()">
          <mat-icon>login</mat-icon>
          Se connecter
        </button>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.oidc.isAuthenticated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) void this.router.navigate(['/dashboard']);
    });
  }

  login(): void {
    this.oidc.authorize();
  }
}
