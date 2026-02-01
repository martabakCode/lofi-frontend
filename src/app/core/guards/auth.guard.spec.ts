import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('authGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => authGuard(...guardParameters));

    let authServiceMock: jest.Mocked<AuthService>;
    let routerMock: jest.Mocked<Router>;
    let route: ActivatedRouteSnapshot;
    let state: RouterStateSnapshot;

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: jest.fn(),
            hasRole: jest.fn(),
            token: signal(null)
        } as unknown as jest.Mocked<AuthService>;

        routerMock = {
            navigate: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<Router>;

        route = { data: {} } as any;
        state = { url: '/test' } as any;

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
    });

    it('should allow access when user is authenticated', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);

        const result = executeGuard(route, state);

        expect(result).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to login when user is not authenticated', () => {
        authServiceMock.isAuthenticated.mockReturnValue(false);

        const result = executeGuard(route, state);

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/test' } });
    });

    it('should deny access if role required and user lacks it', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(false);
        route.data = { role: 'ADMIN' };

        const result = executeGuard(route, state);

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should allow access if role required and user has it', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);
        route.data = { role: 'ADMIN' };

        const result = executeGuard(route, state);

        expect(result).toBe(true);
    });
});
