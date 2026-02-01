import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('errorInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let toastServiceMock: jest.Mocked<ToastService>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        authServiceMock = {
            refreshToken: jest.fn(),
            logout: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
                { provide: ToastService, useValue: toastServiceMock },
                { provide: AuthService, useValue: authServiceMock }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('400 Bad Request', () => {
        it('should show warning toast for 400 error', (done) => {
            httpClient.get('/api/test').subscribe({
                error: (error) => {
                    expect(error.status).toBe(400);
                    expect(toastServiceMock.show).toHaveBeenCalledWith('Invalid Request', 'warning');
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Invalid Request' }, { status: 400, statusText: 'Bad Request' });
        });

        it('should show validation errors from data field', (done) => {
            httpClient.get('/api/test').subscribe({
                error: () => {
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        'field1: error1 | field2: error2',
                        'warning'
                    );
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush(
                { message: 'Validation Failed', data: { field1: 'error1', field2: 'error2' } },
                { status: 400, statusText: 'Bad Request' }
            );
        });
    });

    describe('401 Unauthorized', () => {
        it('should attempt token refresh on 401', fakeAsync(() => {
            authServiceMock.refreshToken.mockReturnValue(of({
                success: true,
                message: 'Token refreshed',
                data: {
                    accessToken: 'new-token',
                    refreshToken: 'new-refresh',
                    expiresIn: 3600,
                    tokenType: 'Bearer'
                }
            }));

            httpClient.get('/api/test').subscribe();

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

            tick();

            expect(authServiceMock.refreshToken).toHaveBeenCalled();
        }));

        it('should logout when token refresh fails', fakeAsync(() => {
            authServiceMock.refreshToken.mockReturnValue(throwError(() => new Error('Refresh failed')));

            httpClient.get('/api/test').subscribe({
                error: () => {
                    expect(authServiceMock.logout).toHaveBeenCalled();
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        'Session expired. Please login again.',
                        'error'
                    );
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

            tick();
        }));
    });

    describe('403 Forbidden', () => {
        it('should show error toast for 403', (done) => {
            httpClient.get('/api/test').subscribe({
                error: (error) => {
                    expect(error.status).toBe(403);
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        'You do not have permission to access this feature.',
                        'error'
                    );
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
        });
    });

    describe('404 Not Found', () => {
        it('should show warning toast for 404', (done) => {
            httpClient.get('/api/test').subscribe({
                error: (error) => {
                    expect(error.status).toBe(404);
                    expect(toastServiceMock.show).toHaveBeenCalledWith('Data not found', 'warning');
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Data not found' }, { status: 404, statusText: 'Not Found' });
        });
    });

    describe('500 Internal Server Error', () => {
        it('should show error toast for 500', (done) => {
            httpClient.get('/api/test').subscribe({
                error: (error) => {
                    expect(error.status).toBe(500);
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        'Something went wrong. Please try again later.',
                        'error'
                    );
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('Network Error (status 0)', () => {
        it('should show network error toast', (done) => {
            httpClient.get('/api/test').subscribe({
                error: () => {
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        'Network error. Please check your connection.',
                        'error'
                    );
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
        });
    });

    describe('Client-side Error', () => {
        it('should handle client-side errors', (done) => {
            httpClient.get('/api/test').subscribe({
                error: () => {
                    expect(toastServiceMock.show).toHaveBeenCalledWith(
                        expect.stringContaining('Error:'),
                        'error'
                    );
                    done();
                }
            });

            const req = httpMock.expectOne('/api/test');
            // Simulate a client-side error by triggering an error event
            const errorEvent = new ErrorEvent('error', { message: 'Client error' });
            req.error(errorEvent, { status: 0, statusText: 'Error' });
        });
    });

    describe('Successful requests', () => {
        it('should pass through successful requests without showing toast', (done) => {
            httpClient.get('/api/test').subscribe(response => {
                expect(response).toEqual({ data: 'success' });
                expect(toastServiceMock.show).not.toHaveBeenCalled();
                done();
            });

            const req = httpMock.expectOne('/api/test');
            req.flush({ data: 'success' });
        });
    });
});
