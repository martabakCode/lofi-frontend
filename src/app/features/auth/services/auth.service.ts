import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../../../core/models/rbac.models';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ApiResponse } from '../../../core/models/api.models';
import { map } from 'rxjs/operators';

/**
 * SINGLETON PATTERN
 * Angular services with 'providedIn: root' are Singletons by default.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * DEPENDENCY INJECTION PATTERN
   * Using the inject() function to resolve dependencies.
   */
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  private readonly USER_KEY = 'lofi_user';

  // State signals
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() { }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      map(response => response.data),
      tap(response => this.setSession(response))
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  logout() {
    this.tokenStorage.clearToken();
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  hasPermission(permissionName: string): boolean {
    return this.getUserRoles().includes(permissionName);
  }

  getUserRoles(): string[] {
    const user = this.currentUser();
    if (!user) return [];

    // Extract role names from either roleNames or roles array
    const rolesSource = user.roleNames && user.roleNames.length > 0 ? user.roleNames : user.roles;
    if (!rolesSource) return [];

    return (rolesSource as any[]).map(r => {
      if (typeof r === 'string') return r;
      return r.name;
    }).filter(Boolean);
  }

  private setSession(authResult: AuthResponse) {
    this.tokenStorage.saveToken(authResult.accessToken);

    // Construct a basic User object from login
    // Detailed user info will be fetched by the app or current-user resolve
    const user: User = {
      id: 'current',
      username: 'User', // Will be updated by /me request
      fullName: 'User',
      email: '',
      roles: [],
      roleNames: []
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
