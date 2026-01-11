import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { AuthResponse, User } from '../models/rbac.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly baseUrl = `${environment.apiUrl}/auth`;

    // Signals for UI state
    currentUser = signal<User | null>(null);
    token = signal<string | null>(localStorage.getItem('token'));

    constructor() {
        // Initial load if token exists
        if (this.token()) {
            this.fetchCurrentUser().subscribe();
        }
    }

    login(credentials: any): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, credentials).pipe(
            tap(res => {
                if (res.success) {
                    this.setSession(res.data);
                }
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        this.token.set(null);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    private setSession(auth: AuthResponse): void {
        localStorage.setItem('token', auth.token);
        this.token.set(auth.token);
        this.fetchCurrentUser().subscribe();
        this.router.navigate(['/dashboard']);
    }

    private fetchCurrentUser(): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/users/me`).pipe(
            tap(res => {
                if (res.success) {
                    this.currentUser.set(res.data);
                }
            })
        );
    }

    isAuthenticated(): boolean {
        return !!this.token();
    }

    hasRole(role: string): boolean {
        const user = this.currentUser();
        return user ? user.roles.some(r => r.name === role) : false;
    }
}
