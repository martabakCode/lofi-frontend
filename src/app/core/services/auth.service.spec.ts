import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserInfo } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let tokenStorageMock: jest.Mocked<TokenStorageService>;

    const mockUserInfo: UserInfo = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        branchId: 'branch-1',
        branchName: 'Main Branch',
        roles: ['ROLE_MARKETING'],
        permissions: ['LOAN_READ', 'LOAN_CREATE']
    };

    beforeEach(() => {
        // Create mock for TokenStorageService
        tokenStorageMock = {
            getToken: jest.fn().mockReturnValue(null),
            saveToken: jest.fn(),
            saveRefreshToken: jest.fn(),
            getRefreshToken: jest.fn().mockReturnValue('ref-token'),
            removeToken: jest.fn(),
            removeRefreshToken: jest.fn(),
            clearToken: jest.fn()
        } as unknown as jest.Mocked<TokenStorageService>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthService,
                { provide: TokenStorageService, useValue: tokenStorageMock }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('login', () => {
        it('should authenticate user and store tokens', (done) => {
            const credentials = { email: 'test@example.com', password: 'password' };
            const authResponse = {
                data: {
                    accessToken: 'access-token-123',
                    refreshToken: 'refresh-token-123'
                }
            };

            service.login(credentials).subscribe(() => {
                expect(tokenStorageMock.saveToken).toHaveBeenCalledWith('access-token-123');
                expect(tokenStorageMock.saveRefreshToken).toHaveBeenCalledWith('refresh-token-123');
                expect(service.token()).toBe('access-token-123');
                expect(service.currentUser()).toEqual(mockUserInfo);
                done();
            });

            // Mock login request
            const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            expect(loginReq.request.method).toBe('POST');
            loginReq.flush(authResponse);

            // Mock user info request (triggered by switchMap)
            const userReq = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
            expect(userReq.request.method).toBe('GET');
            userReq.flush({ success: true, data: mockUserInfo });
        });

        it('should handle login error', (done) => {
            const credentials = { email: 'test@example.com', password: 'wrong' };

            service.login(credentials).subscribe({
                error: (error) => {
                    expect(error.status).toBe(401);
                    done();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        });
    });

    describe('logout', () => {
        it('should clear tokens and user data', () => {
            service.logout();

            expect(tokenStorageMock.clearToken).toHaveBeenCalled();
            expect(service.currentUser()).toBeNull();
            expect(service.token()).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return true when token exists', () => {
            service.token.set('valid-token');
            expect(service.isAuthenticated()).toBe(true);
        });

        it('should return false when token is null', () => {
            service.token.set(null);
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('hasRole', () => {
        beforeEach(() => {
            service.currentUser.set(mockUserInfo);
        });

        it('should return true when user has role', () => {
            expect(service.hasRole('ROLE_MARKETING')).toBe(true);
        });

        it('should return false when user does not have role', () => {
            expect(service.hasRole('ROLE_ADMIN')).toBe(false);
        });

        it('should return false when user is null', () => {
            service.currentUser.set(null);
            expect(service.hasRole('ROLE_MARKETING')).toBe(false);
        });
    });
});
