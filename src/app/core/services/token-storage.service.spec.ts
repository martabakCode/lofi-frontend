import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { CookieService } from 'ngx-cookie-service';

describe('TokenStorageService', () => {
    let service: TokenStorageService;
    let cookieServiceMock: jest.Mocked<CookieService>;

    const TOKEN_KEY = 'token';
    const REFRESH_TOKEN_KEY = 'refresh_token';

    beforeEach(() => {
        cookieServiceMock = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            check: jest.fn()
        } as unknown as jest.Mocked<CookieService>;

        TestBed.configureTestingModule({
            providers: [
                TokenStorageService,
                { provide: CookieService, useValue: cookieServiceMock }
            ]
        });

        service = TestBed.inject(TokenStorageService);
    });

    describe('getToken', () => {
        it('should return token when it exists', () => {
            cookieServiceMock.get.mockReturnValue('valid-token');

            const result = service.getToken();

            expect(result).toBe('valid-token');
            expect(cookieServiceMock.get).toHaveBeenCalledWith(TOKEN_KEY);
        });

        it('should return null when token does not exist', () => {
            cookieServiceMock.get.mockReturnValue('');

            const result = service.getToken();

            expect(result).toBeNull();
        });
    });

    describe('getRefreshToken', () => {
        it('should return refresh token when it exists', () => {
            cookieServiceMock.get.mockReturnValue('valid-refresh-token');

            const result = service.getRefreshToken();

            expect(result).toBe('valid-refresh-token');
            expect(cookieServiceMock.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
        });

        it('should return null when refresh token does not exist', () => {
            cookieServiceMock.get.mockReturnValue('');

            const result = service.getRefreshToken();

            expect(result).toBeNull();
        });
    });

    describe('saveToken', () => {
        it('should save token to cookie with correct options', () => {
            const token = 'new-token';

            service.saveToken(token);

            expect(cookieServiceMock.set).toHaveBeenCalledWith(
                TOKEN_KEY,
                token,
                expect.objectContaining({
                    path: '/',
                    sameSite: 'Strict'
                })
            );
        });
    });

    describe('saveRefreshToken', () => {
        it('should save refresh token to cookie with correct options', () => {
            const refreshToken = 'new-refresh-token';

            service.saveRefreshToken(refreshToken);

            expect(cookieServiceMock.set).toHaveBeenCalledWith(
                REFRESH_TOKEN_KEY,
                refreshToken,
                expect.objectContaining({
                    path: '/',
                    sameSite: 'Strict'
                })
            );
        });
    });

    describe('clearToken', () => {
        it('should delete both token and refresh token', () => {
            service.clearToken();

            expect(cookieServiceMock.delete).toHaveBeenCalledWith(TOKEN_KEY, '/');
            expect(cookieServiceMock.delete).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, '/');
        });
    });

    describe('hasToken', () => {
        it('should return true when token exists', () => {
            cookieServiceMock.check.mockReturnValue(true);

            const result = service.hasToken();

            expect(result).toBe(true);
            expect(cookieServiceMock.check).toHaveBeenCalledWith(TOKEN_KEY);
        });

        it('should return false when token does not exist', () => {
            cookieServiceMock.check.mockReturnValue(false);

            const result = service.hasToken();

            expect(result).toBe(false);
        });
    });
});
