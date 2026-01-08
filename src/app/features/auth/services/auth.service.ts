import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../../../core/models/rbac.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'lofi_token';
  private readonly USER_KEY = 'lofi_user';

  // State signals
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
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

  hasPermission(permissionName: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    // The backend returns a flat list of roles and permissions in the 'roles' array.
    // We check if the permission exists in that list.
    return user.roleNames?.includes(permissionName) || false;
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    
    // Construct a User object from the response
    const user: User = {
      id: 'current', // ID not provided in login response, using placeholder
      username: authResult.email.split('@')[0],
      fullName: authResult.email.split('@')[0], // Placeholder, will update if we fetch user details
      email: authResult.email,
      roles: [], // We don't have detailed Role objects yet
      roleNames: authResult.roles // Store the flat list of roles/permissions here
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
