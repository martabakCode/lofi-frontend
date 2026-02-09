import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('roleGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

    let authServiceMock: jest.Mocked<AuthService>;
    let routerMock: jest.Mocked<Router>;
    let route: ActivatedRouteSnapshot;
    let state: RouterStateSnapshot;

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: jest.fn(),
            currentUser: signal(null),
            getUserRoles: jest.fn().mockReturnValue([]),
            hasRole: jest.fn((role: string) => {
                const user = authServiceMock.currentUser();
                return user ? user.roles.includes(role) : false;
            })
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

    it('should redirect to login when user is not authenticated', () => {
        authServiceMock.isAuthenticated.mockReturnValue(false);

        const result = executeGuard(route, state);

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login'], {
            queryParams: { returnUrl: '/test' }
        });
    });

    it('should allow access when no roles are required', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['ROLE_USER'],
            permissions: []
        });
        route.data = {};

        const result = executeGuard(route, state);

        expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['ROLE_ADMIN', 'ROLE_USER'],
            permissions: []
        });
        route.data = { roles: ['ROLE_ADMIN'] };

        const result = executeGuard(route, state);

        expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['ROLE_USER'],
            permissions: []
        });
        route.data = { roles: ['ROLE_ADMIN'] };

        const result = executeGuard(route, state);

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/unauthorized']);
    });

    it('should allow access when user has one of multiple required roles', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['ROLE_MARKETING'],
            permissions: []
        });
        route.data = { roles: ['ROLE_ADMIN', 'ROLE_MARKETING'] };

        const result = executeGuard(route, state);

        expect(result).toBe(true);
    });

    it('should deny access when user is null but authenticated', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set(null);
        route.data = { roles: ['ROLE_ADMIN'] };

        const result = executeGuard(route, state);

        expect(result).toBe(false);
    });

    it('should allow access when roles array is empty', () => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['ROLE_USER'],
            permissions: []
        });
        route.data = { roles: [] };

        const result = executeGuard(route, state);

        expect(result).toBe(true);
    });
});
