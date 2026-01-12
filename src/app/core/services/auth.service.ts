import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { AuthResponse, User } from '../models/rbac.models';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private tokenStorage = inject(TokenStorageService);

    private readonly baseUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<User | null>(null);
    token = signal<string | null>(this.tokenStorage.getToken());

    constructor() {
        if (this.token()) {
            this.fetchCurrentUser().subscribe();
        }
    }

    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
            tap(res => {
                this.tokenStorage.saveToken(res.token);
                this.token.set(res.token);
                this.fetchCurrentUser().subscribe();
            })
        );
    }

    logout(): void {
        this.tokenStorage.clearToken();
        this.token.set(null);
        this.currentUser.set(null);
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
