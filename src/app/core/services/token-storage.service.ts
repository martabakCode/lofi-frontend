import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private cookieService = inject(CookieService);
    private readonly TOKEN_KEY = 'token';

    /**
     * Get the token from storage
     */
    getToken(): string | null {
        return this.cookieService.get(this.TOKEN_KEY) || null;
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
     * Remove the token from storage
     */
    clearToken(): void {
        this.cookieService.delete(this.TOKEN_KEY, '/');
    }

    /**
     * Check if a token exists
     */
    hasToken(): boolean {
        return this.cookieService.check(this.TOKEN_KEY);
    }
}
