import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminLayoutComponent],
  template: '<app-admin-layout />',
})
export class AppComponent implements OnInit {
  private readonly oidc = inject(OidcSecurityService);

  ngOnInit(): void {
    this.oidc.checkAuth().subscribe();
  }
}

