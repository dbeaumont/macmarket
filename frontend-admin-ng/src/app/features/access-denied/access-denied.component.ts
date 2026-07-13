import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="flex min-h-[60vh] items-center justify-center">
      <div class="text-center">
        <mat-icon class="text-6xl text-red-400 mb-4 block">lock</mat-icon>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
        <p class="text-gray-500 mb-6">Vous n'avez pas les permissions nécessaires.</p>
        <a routerLink="/dashboard" mat-raised-button color="primary">
          Retour au tableau de bord
        </a>
      </div>
    </div>
  `,
})
export class AccessDeniedComponent {}
