import { signal } from '@angular/core';
import { of } from 'rxjs';

/**
 * Mock AuthService
 */
export const createAuthServiceMock = () => ({
    currentUser: signal<any | null>(null),
    token: signal<string | null>(null),
    login: jest.fn().mockReturnValue(of({ data: {} })),
    logout: jest.fn(),
    refreshToken: jest.fn().mockReturnValue(of({ data: {} })),
    fetchCurrentUser: jest.fn().mockReturnValue(of({ data: {} })),
    isAuthenticated: jest.fn().mockReturnValue(false),
    hasRole: jest.fn().mockReturnValue(false),
    hasPermission: jest.fn().mockReturnValue(false),
    getUserRoles: jest.fn().mockReturnValue([]),
    getUserBranch: jest.fn().mockReturnValue(null)
});

/**
 * Mock ProfileService
 */
export const createProfileServiceMock = () => ({
    getProfile: jest.fn().mockReturnValue(of({ data: {} })),
    updateProfile: jest.fn().mockReturnValue(of({ data: {} })),
    uploadProfilePicture: jest.fn().mockReturnValue(of({ data: '' }))
});

/**
 * Mock LoanService
 */
export const createLoanServiceMock = () => ({
    getLoans: jest.fn().mockReturnValue(of({ items: [], total: 0 })),
    getLoanById: jest.fn().mockReturnValue(of({})),
    createLoan: jest.fn().mockReturnValue(of({})),
    updateLoan: jest.fn().mockReturnValue(of({})),
    approveLoan: jest.fn().mockReturnValue(of({})),
    rejectLoan: jest.fn().mockReturnValue(of({})),
    rollbackLoan: jest.fn().mockReturnValue(of({})),
    disburseLoan: jest.fn().mockReturnValue(of({}))
});

/**
 * Mock ToastService
 */
export const createToastServiceMock = () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
});

/**
 * Mock Router
 */
export const createRouterMock = () => ({
    navigate: jest.fn().mockResolvedValue(true),
    navigateByUrl: jest.fn().mockResolvedValue(true),
    url: '/',
    events: of()
});

/**
 * Mock ActivatedRoute
 */
export const createActivatedRouteMock = (params = {}, queryParams = {}) => ({
    params: of(params),
    queryParams: of(queryParams),
    snapshot: {
        params,
        queryParams,
        url: []
    }
});
