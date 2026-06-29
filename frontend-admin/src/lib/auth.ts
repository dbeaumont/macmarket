import type { AuthProviderProps } from 'react-oidc-context';
import type { User } from 'oidc-client-ts';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const APP_URL = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174');

export const oidcConfig: AuthProviderProps = {
  authority: `${KEYCLOAK_URL}/realms/macmarket`,
  client_id: 'macmarket-admin',
  redirect_uri: `${APP_URL}/auth/callback`,
  post_logout_redirect_uri: APP_URL,
  scope: 'openid profile email roles',
  automaticSilentRenew: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, '/dashboard');
  },
};

interface KeycloakProfile {
  readonly realm_access?: {
    readonly roles?: readonly string[];
  };
}

export function getUserRoles(user: User | null | undefined): readonly string[] {
  const profile = user?.profile as KeycloakProfile | undefined;
  return profile?.realm_access?.roles ?? [];
}

export function hasRole(user: User | null | undefined, ...roles: readonly string[]): boolean {
  const userRoles = getUserRoles(user);
  return roles.some(r => userRoles.includes(r));
}
