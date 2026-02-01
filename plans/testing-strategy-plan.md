# Testing Strategy Plan - Lofi Frontend

## Executive Summary

Saat ini project ini menggunakan **Vitest** untuk testing (terlihat dari `tsconfig.spec.json` dan beberapa file `.spec.ts` yang sudah ada). Namun, untuk standarisasi dan kompatibilitas yang lebih baik dengan Angular ecosystem, akan dilakukan migrasi ke **Jest**.

## Current State Analysis

### Existing Test Files
| File | Type | Framework | Status |
|------|------|-----------|--------|
| `src/app/core/patterns/loan-status-engine.spec.ts` | Unit | Vitest | Working |
| `src/app/core/services/sla.service.spec.ts` | Unit | Vitest | Working |
| `src/app/features/products/adapters/product.adapter.spec.ts` | Unit | Vitest | Working |
| `src/app/features/products/facades/product.facade.spec.ts` | Unit | Vitest | Working |
| `src/app/features/loans/loan-ui-logic.spec.ts` | Component | Jasmine/Karma style | Needs migration |

### Current Dependencies
```json
"vitest": "^4.0.8"
"jsdom": "^27.1.0"
```

## Target Architecture with Jest

### Dependencies to Add
```json
"jest": "^29.7.0"
"@types/jest": "^29.5.0"
"jest-preset-angular": "^14.0.0"
"ts-jest": "^29.1.0"
```

### File Structure
```
project-root/
├── jest.config.ts              # Jest configuration
├── jest.setup.ts               # Global test setup
├── jest-global-mocks.ts        # Angular-specific mocks
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.service.spec.ts      # NEW
│   │   │   │   ├── loan.service.spec.ts      # NEW
│   │   │   │   └── profile.service.spec.ts   # NEW
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.spec.ts        # NEW
│   │   │   │   └── role.guard.spec.ts        # NEW
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.spec.ts  # NEW
│   │   └── testing/
│   │       ├── mocks/
│   │       │   ├── services.mock.ts          # Shared service mocks
│   │       │   └── models.mock.ts            # Mock data generators
│   │       └── test-utils.ts                 # Testing utilities
```

## Testing Strategy

### 1. Unit Tests (Priority: High)
**Target Coverage: 80%+**

#### Services
- `AuthService` - Login, logout, token management
- `LoanService` - CRUD operations, API calls
- `ProfileService` - User profile management
- `RbacService` - Role-based access control
- `SlaService` - SLA calculations (already has tests)
- `TokenStorageService` - Token persistence

#### Patterns & Utilities
- `LoanStatusEngine` - Status transitions (already has tests)
- `LoanAdapter` - Data transformation
- `ProductAdapter` - Product data mapping (already has tests)
- `DisbursementBuilder` - Builder pattern validation

#### Guards
- `AuthGuard` - Route protection
- `RoleGuard` - Role-based routing
- `RoleRedirectGuard` - Dynamic redirects

#### Interceptors
- `AuthInterceptor` - Token injection
- `JwtInterceptor` - JWT handling
- `ErrorInterceptor` - Error handling

### 2. Component Tests (Priority: Medium)
**Target Coverage: 60%+**

#### Shared Components
- `ConfirmationModalComponent`
- `DocumentUploadComponent`
- `PaginationComponent`
- `SlaBadgeComponent`
- `ToastComponent`

#### Feature Components
- `LoginComponent`
- `LoanListComponent`
- `LoanDetailComponent`
- `LoanApplicationComponent`
- `ProfileComponent`

### 3. Integration Tests (Priority: Medium)
**Target Coverage: 40%+**

- Facade pattern integration
- Service-to-API integration
- Component-to-Service integration

### 4. E2E Tests (Priority: Low - Future)
Consider using Cypress or Playwright for critical user flows.

## Jest Configuration

### jest.config.ts
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/main.server.ts',
    '!src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

export default config;
```

### jest.setup.ts
```typescript
import 'jest-preset-angular/setup-jest';
import './jest-global-mocks';

// Global test configurations
globalThis.ngJest = {
  skipNgcc: true
};
```

## Migration Plan from Vitest to Jest

### Phase 1: Setup (Week 1)
1. Install Jest dependencies
2. Create Jest configuration files
3. Update package.json scripts
4. Create testing utilities and mocks

### Phase 2: Service Tests (Week 2-3)
1. Migrate existing Vitest service tests to Jest
2. Create missing service tests
3. Achieve 80% service coverage

### Phase 3: Component Tests (Week 4-5)
1. Create component test templates
2. Test shared components
3. Test critical feature components

### Phase 4: Integration (Week 6)
1. Integration tests for facades
2. Guard and interceptor tests
3. End-to-end critical path validation

## Testing Best Practices

### Naming Conventions
- Test files: `[name].spec.ts`
- Test suites: `describe('ServiceName', () => {})`
- Test cases: `it('should do something when condition', () => {})`

### AAA Pattern (Arrange-Act-Assert)
```typescript
it('should calculate SLA correctly', () => {
  // Arrange
  const startTime = new Date(Date.now() - 3600000).toISOString();
  const targetHours = 24;
  
  // Act
  const result = service.calculateSLA(startTime, targetHours);
  
  // Assert
  expect(result.status).toBe('SAFE');
});
```

### Mocking Strategy
- Use `jest.mock()` for module mocking
- Use `jest.spyOn()` for method spying
- Create reusable mocks in `testing/mocks/` directory

### Test Isolation
- Use `beforeEach()` to reset state
- Avoid shared state between tests
- Clean up subscriptions and timers

## Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login"
```

## Success Metrics

- **Unit Test Coverage**: 80%+
- **Component Test Coverage**: 60%+
- **Build Time Impact**: < 10% increase
- **Test Execution Time**: < 2 minutes for full suite
- **Flaky Tests**: 0%

## Next Steps

1. Switch to Code mode to implement Jest configuration
2. Install required dependencies
3. Create base configuration files
4. Migrate existing Vitest tests
5. Create example tests for critical services
