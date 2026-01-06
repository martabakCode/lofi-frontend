import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, delay } from 'rxjs';
import { User, AuthResponse } from '../models/auth.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'antigravity_token';
  private readonly USER_KEY = 'antigravity_user';

  // State signals
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {}

  login(credentials: any): Observable<AuthResponse> {
    // In a real app: return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
    // Simulating API response for boilerplate
    // const mockResponse: AuthResponse = {
    //   token: 'mock-jwt-token',
    //   user: {
    //     id: '1',
    //     email: credentials.email,
    //     name: 'Admin User',
    //     role: 'ADMIN'
    //   }
    // };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
