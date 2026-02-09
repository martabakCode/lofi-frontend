import { Permission, Role, Branch, User, AuthResponse } from '../../core/models/rbac.models';
import { LoanStatus, LoanSLA } from '../../core/models/loan.models';
import { ApiResponse, PaginatedResponse } from '../../core/models/api.models';

/**
 * MOCK PERMISSION FACTORY
 */
export const createMockPermission = (overrides: Partial<Permission> = {}): Permission => ({
    id: 'perm-1',
    name: 'LOAN_READ',
    description: 'Read loan data',
    ...overrides
});

/**
 * MOCK ROLE FACTORY
 */
export const createMockRole = (overrides: Partial<Role> = {}): Role => ({
    id: 'role-1',
    name: 'ROLE_MARKETING',
    description: 'Marketing role',
    permissions: [createMockPermission()],
    ...overrides
});

/**
 * MOCK BRANCH FACTORY
 */
export const createMockBranch = (overrides: Partial<Branch> = {}): Branch => ({
    id: 'branch-1',
    name: 'Main Branch',
    address: '123 Main St',
    city: 'Jakarta',
    state: 'DKI Jakarta',
    zipCode: '12190',
    phone: '021-1234567',
    ...overrides
});

/**
 * MOCK USER FACTORY
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john@example.com',
    roles: [createMockRole()],
    branch: createMockBranch(),
    status: 'Active',
    ...overrides
});

/**
 * MOCK AUTH RESPONSE FACTORY
 */
export const createMockAuthResponse = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    ...overrides
});

/**
 * MOCK PRODUCT FACTORY (Typed as generic object since interface is in service)
 */
export const createMockProduct = (overrides: any = {}) => ({
    id: 'prod-1',
    productCode: 'PL-001',
    productName: 'Personal Loan',
    description: 'Description',
    interestRate: 10.5,
    adminFee: 50000,
    minTenor: 6,
    maxTenor: 24,
    minLoanAmount: 1000000,
    maxLoanAmount: 50000000,
    isActive: true,
    ...overrides
});

/**
 * MOCK BACKEND LOAN FACTORY
 */
export const createMockBackendLoan = (overrides: any = {}) => ({
    id: 'loan-1',
    customerId: 'cust-1',
    customerName: 'John Doe',
    product: createMockProduct(),
    loanAmount: 5000000,
    tenor: 12,
    loanStatus: 'SUBMITTED',
    currentStage: 'MARKETING',
    submittedAt: new Date().toISOString(),
    ...overrides
});

/**
 * MOCK UI LOAN FACTORY
 */
export const createMockLoan = (overrides: any = {}) => ({
    id: 'loan-1',
    customerName: 'John Doe',
    productName: 'Personal Loan',
    amount: 5000000,
    tenure: 12,
    status: 'SUBMITTED',
    appliedDate: new Date().toISOString(),
    ...overrides
});

/**
 * MOCK SLA FACTORY
 */
export const createMockSLA = (overrides: Partial<LoanSLA> = {}): LoanSLA => ({
    status: 'SAFE',
    remainingSeconds: 3600,
    targetSeconds: 7200,
    isExpired: false,
    ...overrides
});

/**
 * API RESPONSE FACTORY
 */
export const createMockApiResponse = <T>(data: T, success = true, message = 'Success'): ApiResponse<T> => ({
    success,
    message,
    data
});

/**
 * PAGINATED RESPONSE FACTORY
 */
export const createMockPaginatedResponse = <T>(items: T[], page = 0, size = 10, total = items.length): PaginatedResponse<T> => ({
    content: items,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    size: size,
    number: page
});
