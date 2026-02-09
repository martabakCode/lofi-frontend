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
    fullName?: string; // Added to support profile display
    branchId?: string;
    branchName?: string;
    roles: string[]; // Backend returns role names as strings
    permissions: string[];
}

// Forgot Password Response
export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
    code: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
}

// Reset Password Response
export interface ResetPasswordResponse {
    success: boolean;
    message: string;
    code: string;
    data: Record<string, unknown>;
    errors: Record<string, unknown>;
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

    logout(): Observable<ApiResponse<Object>> {
        const token = this.tokenStorage.getToken();
        // Call backend logout first, then clear local storage
        return this.http.post<ApiResponse<Object>>(`${this.baseUrl}/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(
            tap(() => {
                this.tokenStorage.clearToken();
                this.token.set(null);
                this.currentUser.set(null);
            })
        );
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

    /**
     * Request a password reset email
     * @param email - User's email address
     */
    forgotPassword(email: string): Observable<ApiResponse<ForgotPasswordResponse>> {
        return this.http.post<ApiResponse<ForgotPasswordResponse>>(`${this.baseUrl}/forgot-password`, { email });
    }

    /**
     * Change password for authenticated user
     * @param payload - Object containing currentPassword and newPassword
     */
    changePassword(payload: { currentPassword: string; newPassword: string }): Observable<ApiResponse<Object>> {
        return this.http.post<ApiResponse<Object>>(`${this.baseUrl}/change-password`, payload);
    }

    /**
     * Reset password with token from email
     * @param token - Reset token from email
     * @param newPassword - New password
     */
    resetPassword(token: string, newPassword: string): Observable<ApiResponse<ResetPasswordResponse>> {
        return this.http.post<ApiResponse<ResetPasswordResponse>>(`${this.baseUrl}/reset-password`, {
            token,
            newPassword
        });
    }

    /**
     * Get the current authentication token
     * Used by JWT interceptor
     */
    getToken(): string | null {
        return this.tokenStorage.getToken();
    }
}

