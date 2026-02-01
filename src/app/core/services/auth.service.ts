import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of, map } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { AuthResponse } from '../models/rbac.models';

// Backend UserInfoResponse structure
export interface UserInfo {
    id: string;
    email: string;
    username: string;
    branchId?: string;
    branchName?: string;
    roles: string[]; // Backend returns role names as strings
    permissions: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private tokenStorage = inject(TokenStorageService);

    private readonly baseUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<UserInfo | null>(null);
    token = signal<string | null>(this.tokenStorage.getToken());

    constructor() {
        if (this.token()) {
            this.fetchCurrentUser().subscribe();
        }
    }

    login(credentials: any): Observable<ApiResponse<UserInfo>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, credentials).pipe(
            tap(res => {
                const authData = res.data;
                this.tokenStorage.saveToken(authData.accessToken);
                this.tokenStorage.saveRefreshToken(authData.refreshToken);
                this.token.set(authData.accessToken);
            }),
            switchMap(() => this.fetchCurrentUser())
        );
    }

    refreshToken(): Observable<ApiResponse<AuthResponse>> {
        const refreshToken = this.tokenStorage.getRefreshToken();
        return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
            tap(res => {
                const authData = res.data;
                this.tokenStorage.saveToken(authData.accessToken);
                this.token.set(authData.accessToken);
                // Optionally save new refresh token if rotated
                if (authData.refreshToken) {
                    this.tokenStorage.saveRefreshToken(authData.refreshToken);
                }
            })
        );
    }

    logout(): void {
        this.tokenStorage.clearToken();
        this.token.set(null);
        this.currentUser.set(null);
    }

    private fetchCurrentUser(): Observable<ApiResponse<UserInfo>> {
        return this.http.get<ApiResponse<UserInfo>>(`${this.baseUrl}/me`).pipe(
            tap(res => {
                if (res.success) {
                    console.log('Fetched user:', res.data);
                    this.currentUser.set(res.data);
                }
            })
        );
    }

    isAuthenticated(): boolean {
        return !!this.token();
    }

    getUserRoles(): string[] {
        return this.currentUser()?.roles || [];
    }

    hasRole(role: string): boolean {
        return this.getUserRoles().includes(role);
    }

    hasPermission(permission: string): boolean {
        const user = this.currentUser();
        return user ? user.permissions.includes(permission) : false;
    }

    forgotPassword(email: string): Observable<ApiResponse<Object>> {
        return this.http.post<ApiResponse<Object>>(`${this.baseUrl}/forgot-password`, { email });
    }

    changePassword(payload: any): Observable<ApiResponse<Object>> {
        return this.http.post<ApiResponse<Object>>(`${this.baseUrl}/change-password`, payload);
    }

    /**
     * Get the current authentication token
     * Used by JWT interceptor
     */
    getToken(): string | null {
        return this.tokenStorage.getToken();
    }
}

