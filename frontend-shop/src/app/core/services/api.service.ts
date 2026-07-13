import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { GuestCartService } from './guest-cart.service';

const API_BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly oidc = inject(OidcSecurityService);
  private readonly guestCart = inject(GuestCartService);

  get<T>(path: string): Observable<T> {
    return this.withAuth(path, (headers) =>
      this.http.get<T>(`${API_BASE}${path}`, { headers })
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.withAuth(path, (headers) =>
      this.http.post<T>(`${API_BASE}${path}`, body, { headers })
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.withAuth(path, (headers) =>
      this.http.put<T>(`${API_BASE}${path}`, body, { headers })
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.withAuth(path, (headers) =>
      this.http.delete<T>(`${API_BASE}${path}`, { headers })
    );
  }

  getWithParams<T>(path: string, params: HttpParams | Record<string, string>): Observable<T> {
    return this.withAuth(path, (headers) =>
      this.http.get<T>(`${API_BASE}${path}`, { headers, params })
    );
  }

  private withAuth<T>(path: string, fn: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.oidc.getAccessToken()).pipe(
      switchMap((token) => {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        } else if (path.startsWith('/cart')) {
          headers = headers.set('X-Guest-Cart-Token', this.guestCart.getOrCreateToken());
        }
        return fn(headers);
      })
    );
  }

  getBlobWithAuth(path: string): Observable<Blob> {
    return from(this.oidc.getAccessToken()).pipe(
      switchMap((token) => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get(`${API_BASE}${path}`, { headers, responseType: 'blob' });
      })
    );
  }
}
