import { TestBed } from '@angular/core/testing';
import { Router, CanActivateFn } from '@angular/router';
import { roleRedirectGuard } from './role-redirect.guard';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../models/rbac.models';

describe('roleRedirectGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => roleRedirectGuard(...guardParameters));

    let authServiceMock: jest.Mocked<AuthService>;
    let routerMock: jest.Mocked<Router>;

    beforeEach(() => {
        authServiceMock = {
            getUserRoles: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        routerMock = {
            createUrlTree: jest.fn().mockReturnValue({})
        } as unknown as jest.Mocked<Router>;

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
    });

    it('should redirect to login when user has no roles', () => {
        authServiceMock.getUserRoles.mockReturnValue([]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should redirect customer to customer dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.CUSTOMER]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/customer']);
    });

    it('should redirect admin to admin dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.ADMIN]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/admin']);
    });

    it('should redirect super_admin to admin dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.SUPER_ADMIN]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/admin']);
    });

    it('should redirect marketing to review dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.MARKETING]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/review']);
    });

    it('should redirect branch_manager to approval dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.BRANCH_MANAGER]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/approval']);
    });

    it('should redirect back_office to disbursement dashboard', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.BACK_OFFICE]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/disbursement']);
    });

    it('should allow access when role does not match any specific redirect', () => {
        authServiceMock.getUserRoles.mockReturnValue(['UNKNOWN_ROLE']);

        const result = executeGuard({} as any, {} as any);

        expect(result).toBe(true);
        expect(routerMock.createUrlTree).not.toHaveBeenCalled();
    });

    it('should prioritize admin redirect when user has multiple roles including admin', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.MARKETING, ROLES.ADMIN]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/admin']);
    });

    it('should prioritize customer redirect over other roles', () => {
        authServiceMock.getUserRoles.mockReturnValue([ROLES.CUSTOMER, ROLES.MARKETING]);

        executeGuard({} as any, {} as any);

        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard/customer']);
    });
});
