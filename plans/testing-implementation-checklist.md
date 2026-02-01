# Testing Implementation Checklist

## Phase 1: Setup & Configuration

### Dependencies Installation
```bash
# Run these commands to install Jest dependencies
npm install --save-dev jest @types/jest jest-preset-angular ts-jest
npm install --save-dev @testing-library/angular @testing-library/jest-dom
```

### Files to Create

#### 1. Root Configuration Files
- [x] `jest.config.ts` - Main Jest configuration
- [x] `jest.setup.ts` - Test setup file
- [x] `jest-global-mocks.ts` - Global mocks for browser APIs

#### 2. Update Existing Files
- [x] `package.json` - Add test scripts
- [x] `tsconfig.spec.json` - Update types for Jest

### Package.json Scripts to Add
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:clear-cache": "jest --clearCache"
  }
}
```

---

## Phase 2: Core Services Tests (Priority: HIGH)

### Auth Module
- [x] `src/app/core/services/auth.service.spec.ts`
  - [x] Test login success/failure
  - [x] Test logout
  - [x] Test token refresh (implicitly via login)
  - [x] Test isAuthenticated method
  - [x] Test hasRole method
  - [x] Test hasPermission method (impl)

- [ ] `src/app/core/services/token-storage.service.spec.ts`
  - [ ] Test token save/retrieve
  - [ ] Test token removal
  - [ ] Test localStorage integration

### Loan Module
- [x] `src/app/core/services/loan.service.spec.ts`
  - [x] Test getLoans with pagination
  - [x] Test getLoanById
  - [x] Test createLoan (applyLoan)
  - [x] Test updateLoan (via approval/rollback)
  - [x] Test approveLoan
  - [x] Test rejectLoan (impl)
  - [x] Test rollbackLoan
  - [ ] Test disburseLoan

### Profile Module
- [ ] `src/app/core/services/profile.service.spec.ts`
  - [ ] Test getProfile
  - [ ] Test updateProfile
  - [ ] Test uploadProfilePicture

### RBAC Module
- [ ] `src/app/core/services/rbac.service.spec.ts`
  - [ ] Test getUsers
  - [ ] Test getRoles
  - [ ] Test getPermissions
  - [ ] Test getBranches
  - [ ] Test create/update/delete operations

### Other Services
- [ ] `src/app/core/services/notification.service.spec.ts`
- [ ] `src/app/core/services/document.service.spec.ts`
- [ ] `src/app/core/services/document-upload.service.spec.ts`
- [ ] `src/app/core/services/report.service.spec.ts`
- [ ] `src/app/core/services/theme.service.spec.ts`
- [ ] `src/app/core/services/toast.service.spec.ts`

---

## Phase 3: Guards & Interceptors (Priority: HIGH)

### Guards
- [x] `src/app/core/guards/auth.guard.spec.ts`
  - [x] Test allow access when authenticated
  - [x] Test redirect when not authenticated

- [ ] `src/app/core/guards/role.guard.spec.ts`
  - [ ] Test allow access with correct role
  - [ ] Test deny access with wrong role
  - [ ] Test redirect on role mismatch

- [ ] `src/app/core/guards/role-redirect.guard.spec.ts`
  - [ ] Test redirect based on user role

### Interceptors
- [x] `src/app/core/interceptors/auth.interceptor.spec.ts`
  - [x] Test token injection
  - [x] Test skip for auth endpoints

- [ ] `src/app/core/interceptors/jwt.interceptor.spec.ts`
  - [ ] Test JWT handling
  - [ ] Test token refresh on 401

- [ ] `src/app/core/interceptors/error.interceptor.spec.ts`
  - [ ] Test error handling
  - [ ] Test toast notifications on errors

---

## Phase 4: Patterns & Utilities (Priority: MEDIUM)

### Patterns
- [ ] `src/app/core/patterns/loan-status-engine.spec.ts` (Already exists - Vitest)
  - [ ] Migrate to Jest if needed

- [ ] `src/app/core/patterns/loan.adapter.spec.ts`
  - [ ] Test toView transformation
  - [ ] Test toBackend transformation

- [ ] `src/app/core/patterns/loan-request.builder.spec.ts`
  - [ ] Test builder pattern
  - [ ] Test validation

- [ ] `src/app/core/patterns/disbursement-builder.spec.ts`
  - [ ] Test builder methods
  - [ ] Test build result

### Directives
- [ ] `src/app/core/directives/has-permission.directive.spec.ts`
  - [ ] Test show/hide based on permission
  - [ ] Test role-based visibility

---

## Phase 5: Facades (Priority: MEDIUM)

- [ ] `src/app/core/facades/loan.facade.spec.ts`
  - [ ] Test loadLoans
  - [ ] Test loan actions (approve, reject, rollback)
  - [ ] Test SLA status
  - [ ] Test state management

- [ ] `src/app/features/products/facades/product.facade.spec.ts` (Already exists - Vitest)
  - [ ] Migrate to Jest if needed

---

## Phase 6: Shared Components (Priority: MEDIUM)

- [ ] `src/app/shared/components/confirmation-modal/confirmation-modal.component.spec.ts`
- [ ] `src/app/shared/components/detail-modal/detail-modal.component.spec.ts`
- [ ] `src/app/shared/components/document-upload/document-upload.component.spec.ts`
- [ ] `src/app/shared/components/pagination/pagination.component.spec.ts`
- [ ] `src/app/shared/components/sla-badge/sla-badge.component.spec.ts`
- [ ] `src/app/shared/components/sortable-header/sortable-header.component.spec.ts`
- [ ] `src/app/shared/components/theme-toggle/theme-toggle.component.spec.ts`
- [ ] `src/app/shared/components/toast/toast.component.spec.ts`
- [ ] `src/app/shared/components/leaflet-map/leaflet-map.component.spec.ts`

---

## Phase 7: Layout Components (Priority: LOW)

- [ ] `src/app/core/layouts/auth-layout/auth-layout.component.spec.ts`
- [ ] `src/app/core/layouts/main-layout/main-layout.component.spec.ts`
- [ ] `src/app/core/layouts/sidebar/sidebar.component.spec.ts`
- [ ] `src/app/core/layouts/topbar/topbar.component.spec.ts`
- [ ] `src/app/core/layouts/topbar/notification-panel.component.spec.ts`
- [ ] `src/app/core/layouts/topbar/profile-menu.component.spec.ts`

---

## Phase 8: Feature Components (Priority: LOW)

### Auth Features
- [ ] `src/app/features/auth/login/login.component.spec.ts`
- [ ] `src/app/features/auth/forgot-password/forgot-password.component.spec.ts`

### Loan Features
- [ ] `src/app/features/loans/loan-list/loan-list.component.spec.ts`
- [ ] `src/app/features/loans/loan-detail/loan-detail.component.spec.ts`
- [ ] `src/app/features/loans/loan-application/loan-application.component.spec.ts`
- [ ] `src/app/features/loans/loan-approval/loan-approval.component.spec.ts`
- [ ] `src/app/features/loans/loan-review/loan-review.component.spec.ts`
- [ ] `src/app/features/loans/marketing-loan-application/marketing-loan-application.component.spec.ts`

### Other Features
- [ ] `src/app/features/dashboard/pages/dashboard.component.spec.ts`
- [ ] `src/app/features/profile/profile.component.spec.ts`
- [ ] `src/app/features/branches/pages/branch-list.component.spec.ts`
- [ ] `src/app/features/disbursements/disbursement-list/disbursement-list.component.spec.ts`
- [ ] `src/app/features/products/product-list/product-list.component.spec.ts`
- [ ] `src/app/features/products/product-form/product-form.component.spec.ts`

---

## Phase 9: Testing Infrastructure

### Create Test Utilities
- [x] `src/app/testing/test-utils.ts`
  - [x] getByTestId helper
  - [x] setInputValue helper
  - [x] clickElement helper
  - [x] createPaginatedResponse helper
  - [x] createApiResponse helper

### Create Mock Factories
- [x] `src/app/testing/mocks/services.mock.ts`
  - [x] createAuthServiceMock
  - [x] createProfileServiceMock
  - [x] createLoanServiceMock
  - [x] createToastServiceMock
  - [x] createRouterMock
  - [x] createActivatedRouteMock

- [ ] `src/app/testing/mocks/models.mock.ts`
  - [ ] Mock data generators for all models

---

## Coverage Targets

| Category | Target Coverage | Priority |
|----------|----------------|----------|
| Services | 80%+ | HIGH |
| Guards | 90%+ | HIGH |
| Interceptors | 80%+ | HIGH |
| Patterns/Utilities | 70%+ | MEDIUM |
| Facades | 70%+ | MEDIUM |
| Shared Components | 60%+ | MEDIUM |
| Feature Components | 50%+ | LOW |
| Layout Components | 40%+ | LOW |

---

## Migration Notes

### Existing Vitest Tests to Migrate
1. `src/app/core/patterns/loan-status-engine.spec.ts`
2. `src/app/core/services/sla.service.spec.ts`
3. `src/app/features/products/adapters/product.adapter.spec.ts`
4. `src/app/features/products/facades/product.facade.spec.ts`

### Migration Steps
1. Replace `import { describe, it, expect } from 'vitest'` with Jest globals
2. Replace `vi.fn()` with `jest.fn()`
3. Update mock syntax if needed
4. Verify tests pass with Jest

---

## Success Criteria

- [ ] All new tests use Jest
- [ ] Existing Vitest tests migrated
- [ ] Minimum 70% overall coverage
- [ ] CI pipeline runs tests successfully
- [ ] No test failures in main branch
- [ ] Test execution time < 2 minutes
