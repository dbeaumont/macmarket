import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatest, map, take } from 'rxjs';

function getRoles(userData: unknown): readonly string[] {
  if (!userData || typeof userData !== 'object') return [];
  const profile = userData as Record<string, unknown>;
  const realmAccess = profile['realm_access'] as Record<string, unknown> | undefined;
  return (realmAccess?.['roles'] as string[] | undefined) ?? [];
}

export const adminGuard: CanActivateFn = (route) => {
  const oidc = inject(OidcSecurityService);
  const router = inject(Router);
  const requiredRole = route.data?.['requiredRole'] as string | undefined;

  return combineLatest([oidc.isAuthenticated$, oidc.userData$]).pipe(
    take(1),
    map(([{ isAuthenticated }, { userData }]) => {
      if (!isAuthenticated) {
        oidc.authorize();
        return false;
      }
      const roles = getRoles(userData);
      const hasManagerOrAdmin = roles.includes('MANAGER') || roles.includes('ADMIN');
      if (!hasManagerOrAdmin) {
        void router.navigate(['/access-denied']);
        return false;
      }
      if (requiredRole && !roles.includes(requiredRole)) {
        void router.navigate(['/access-denied']);
        return false;
      }
      return true;
    })
  );
};

export function getAdminRoles(userData: unknown): readonly string[] {
  return getRoles(userData);
}
