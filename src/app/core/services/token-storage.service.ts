import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private cookieService: CookieService = inject(CookieService);
    private readonly TOKEN_KEY = 'token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    /**
     * Get the token from storage
     */
    getToken(): string | null {
        return this.cookieService.get(this.TOKEN_KEY) || null;
    }

    /**
     * Get the refresh token from storage
     */
    getRefreshToken(): string | null {
        return this.cookieService.get(this.REFRESH_TOKEN_KEY) || null;
    }

    /**
     * Save the token to storage
     * @param token The authentication token
     */
    saveToken(token: string): void {
        this.cookieService.set(
            this.TOKEN_KEY,
            token,
            {
                path: '/',
                secure: environment.production,
                sameSite: 'Strict'
            }
        );
    }

    /**
     * Save the refresh token to storage
     * @param refreshToken The refresh token
     */
    saveRefreshToken(refreshToken: string): void {
        this.cookieService.set(
            this.REFRESH_TOKEN_KEY,
            refreshToken,
            {
                path: '/',
                secure: environment.production,
                sameSite: 'Strict'
            }
        );
    }

    /**
     * Remove the tokens from storage
     */
    clearToken(): void {
        this.cookieService.delete(this.TOKEN_KEY, '/');
        this.cookieService.delete(this.REFRESH_TOKEN_KEY, '/');
    }

    /**
     * Check if a token exists
     */
    hasToken(): boolean {
        return this.cookieService.check(this.TOKEN_KEY);
    }
}
