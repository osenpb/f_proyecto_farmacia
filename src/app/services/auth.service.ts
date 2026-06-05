import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UsuarioResponse } from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  private readonly _currentUser = signal<UsuarioResponse | null>(
    this.loadUserFromStorage()
  );
  readonly currentUser = this._currentUser.asReadonly();

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('auth_user', JSON.stringify(res.data.usuario));
        this._currentUser.set(res.data.usuario);
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUserFromStorage(): UsuarioResponse | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
  }
}
