import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../services/token-storage.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let tokenStorageMock: jest.Mocked<TokenStorageService>;

    beforeEach(() => {
        tokenStorageMock = {
            getToken: jest.fn()
        } as unknown as jest.Mocked<TokenStorageService>;

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: TokenStorageService, useValue: tokenStorageMock }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when token exists and URL is API URL', () => {
        tokenStorageMock.getToken.mockReturnValue('valid-token');

        httpClient.get(`${environment.apiUrl}/test`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/test`);
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
        req.flush({});
    });

    it('should not add Authorization header when token is missing', () => {
        tokenStorageMock.getToken.mockReturnValue(null);

        httpClient.get(`${environment.apiUrl}/test`).subscribe();

        const req = httpMock.expectOne(`${environment.apiUrl}/test`);
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add Authorization header when URL is NOT API URL', () => {
        tokenStorageMock.getToken.mockReturnValue('valid-token');

        httpClient.get('https://other-api.com/test').subscribe();

        const req = httpMock.expectOne('https://other-api.com/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });
});
