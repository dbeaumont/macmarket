import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

const API_BASE = '/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly oidc = inject(OidcSecurityService);

  get<T>(path: string): Observable<T> {
    return this.withAuth((h) => this.http.get<T>(`${API_BASE}${path}`, { headers: h }));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.withAuth((h) => this.http.post<T>(`${API_BASE}${path}`, body, { headers: h }));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.withAuth((h) => this.http.put<T>(`${API_BASE}${path}`, body, { headers: h }));
  }

  delete<T>(path: string): Observable<T> {
    return this.withAuth((h) => this.http.delete<T>(`${API_BASE}${path}`, { headers: h }));
  }

  getWithParams<T>(path: string, params: HttpParams): Observable<T> {
    return this.withAuth((h) => this.http.get<T>(`${API_BASE}${path}`, { headers: h, params }));
  }

  getBlobWithAuth(path: string): Observable<Blob> {
    return from(this.oidc.getAccessToken()).pipe(
      switchMap((token) => {
        let headers = new HttpHeaders();
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return this.http.get(`${API_BASE}${path}`, { headers, responseType: 'blob' });
      })
    );
  }

  private withAuth<T>(fn: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return from(this.oidc.getAccessToken()).pipe(
      switchMap((token) => {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token) headers = headers.set('Authorization', `Bearer ${token}`);
        return fn(headers);
      })
    );
  }
}
