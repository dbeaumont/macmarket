import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAuth } from 'angular-auth-oidc-client';
import { routes } from './app.routes';

const KEYCLOAK_URL = 'http://localhost:8180';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4201';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideAuth({
      config: {
        authority: `${KEYCLOAK_URL}/realms/macmarket`,
        redirectUrl: `${APP_URL}/auth/callback`,
        postLogoutRedirectUri: APP_URL,
        clientId: 'macmarket-admin',
        scope: 'openid profile email roles',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        autoUserInfo: true,
        logLevel: 0,
      },
    }),
  ],
};

