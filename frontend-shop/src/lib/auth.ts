import type { AuthProviderProps } from 'react-oidc-context';
import type { User } from 'oidc-client-ts';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const APP_URL = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const oidcConfig: AuthProviderProps = {
  authority: `${KEYCLOAK_URL}/realms/macmarket`,
  client_id: 'macmarket-shop',
  redirect_uri: `${APP_URL}/auth/callback`,
  post_logout_redirect_uri: APP_URL,
  scope: 'openid profile email roles',
  automaticSilentRenew: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
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

export function hasRole(user: User | null | undefined, role: string): boolean {
  return getUserRoles(user).includes(role);
}
