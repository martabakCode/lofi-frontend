import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';

describe('jwtInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            getToken: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([jwtInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceMock }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when token exists', () => {
        authServiceMock.getToken.mockReturnValue('valid-jwt-token');

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer valid-jwt-token');
        req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
        authServiceMock.getToken.mockReturnValue(null);

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add Authorization header when token is empty string', () => {
        authServiceMock.getToken.mockReturnValue('');

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer ');
        req.flush({});
    });

    it('should work with POST requests', () => {
        authServiceMock.getToken.mockReturnValue('post-token');

        httpClient.post('/api/data', { test: 'data' }).subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.headers.get('Authorization')).toBe('Bearer post-token');
        expect(req.request.body).toEqual({ test: 'data' });
        req.flush({});
    });

    it('should work with PUT requests', () => {
        authServiceMock.getToken.mockReturnValue('put-token');

        httpClient.put('/api/data/1', { updated: 'data' }).subscribe();

        const req = httpMock.expectOne('/api/data/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer put-token');
        req.flush({});
    });

    it('should work with DELETE requests', () => {
        authServiceMock.getToken.mockReturnValue('delete-token');

        httpClient.delete('/api/data/1').subscribe();

        const req = httpMock.expectOne('/api/data/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer delete-token');
        req.flush({});
    });
});
