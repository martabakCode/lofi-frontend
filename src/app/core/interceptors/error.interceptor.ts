import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const injector = inject(Injector);
    const toastService = inject(ToastService);
    // AuthService lazy loaded to avoid circular dependency
    // const authService = inject(AuthService);

    return next(req).pipe(
        // timeout(10000), // Optional: timeout after 10s
        catchError((error: HttpErrorResponse | TimeoutError) => {
            let errorMessage = 'An unexpected error occurred';

            if (error instanceof TimeoutError) {
                errorMessage = 'Network timeout. Please check your connection.';
                toastService.show(errorMessage, 'error');
                return throwError(() => error);
            }

            const httpError = error as HttpErrorResponse;

            if (httpError.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Error: ${httpError.error.message}`;
                toastService.show(errorMessage, 'error');
            } else {
                // Server-side error
                switch (httpError.status) {
                    case 400:
                        errorMessage = httpError.error?.message || 'Invalid Request';
                        // Handle validation errors if they come in a specific format (e.g., list of field errors)
                        if (httpError.error?.data) {
                            if (typeof httpError.error.data === 'string') {
                                errorMessage = httpError.error.data;
                            } else if (typeof httpError.error.data === 'object') {
                                const entries = Object.entries(httpError.error.data);
                                if (entries.length > 0) {
                                    errorMessage = entries.map(([key, value]) => `${key}: ${value}`).join(' | ');
                                }
                            }
                        }
                        toastService.show(errorMessage, 'warning');
                        break;

                    case 401:
                        // Auto-refresh token
                        const authService = injector.get(AuthService);
                        return authService.refreshToken().pipe(
                            switchMap((res) => {
                                // Retry request with new token
                                const newToken = res.data.accessToken;
                                const cloned = req.clone({
                                    setHeaders: {
                                        Authorization: `Bearer ${newToken}`
                                    }
                                });
                                return next(cloned);
                            }),
                            catchError((refreshError) => {
                                // Refresh failed, logout
                                errorMessage = 'Session expired. Please login again.';
                                toastService.show(errorMessage, 'error');
                                authService.logout();
                                return throwError(() => refreshError);
                            })
                        );

                    case 403:
                        errorMessage = 'You do not have permission to access this feature.';
                        toastService.show(errorMessage, 'error');
                        break;

                    case 404:
                        // Distinguish between API 404 and Page 404? 
                        // Usually API 404 means data not found.
                        errorMessage = httpError.error?.message || 'Data not found';
                        toastService.show(errorMessage, 'warning');
                        break;

                    case 500:
                        errorMessage = httpError.error?.message || 'Something went wrong. Please try again later.';
                        console.error('[ErrorInterceptor] 500 Server Error:', {
                            url: httpError.url,
                            error: httpError.error,
                            status: httpError.status,
                            statusText: httpError.statusText
                        });
                        toastService.show(errorMessage, 'error');
                        break;

                    case 0:
                        errorMessage = 'Network error. Please check your connection.';
                        toastService.show(errorMessage, 'error');
                        break;

                    default:
                        errorMessage = httpError.error?.message || `Error Code: ${httpError.status}`;
                        toastService.show(errorMessage, 'error');
                }
            }

            console.error('Global Error Handler:', error);
            return throwError(() => error);
        })
    );
};
