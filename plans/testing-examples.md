# Testing Examples - Jest Implementation

## 1. Service Test Example - AuthService

**File:** `src/app/core/services/auth.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserInfo } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

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
      removeToken: jest.fn(),
      removeRefreshToken: jest.fn()
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

      service.login(credentials).subscribe(user => {
        expect(user.data).toEqual(mockUserInfo);
        expect(tokenStorageMock.saveToken).toHaveBeenCalledWith('access-token-123');
        expect(tokenStorageMock.saveRefreshToken).toHaveBeenCalledWith('refresh-token-123');
        expect(service.token()).toBe('access-token-123');
        done();
      });

      // Mock login request
      const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(authResponse);

      // Mock user info request
      const userReq = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
      expect(userReq.request.method).toBe('GET');
      userReq.flush({ data: mockUserInfo });
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

      expect(tokenStorageMock.removeToken).toHaveBeenCalled();
      expect(tokenStorageMock.removeRefreshToken).toHaveBeenCalled();
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
```

## 2. Service Test Example - LoanService

**File:** `src/app/core/services/loan.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoanService, BackendLoanResponse } from './loan.service';
import { environment } from '../../../environments/environment';

describe('LoanService', () => {
  let service: LoanService;
  let httpMock: HttpTestingController;

  const mockLoan: BackendLoanResponse = {
    id: 'loan-1',
    customerId: 'cust-1',
    customerName: 'John Doe',
    product: {
      id: 'prod-1',
      productCode: 'PL-001',
      productName: 'Personal Loan',
      description: 'Personal loan description',
      interestRate: 10.5,
      adminFee: 50000,
      minTenor: 6,
      maxTenor: 24,
      minLoanAmount: 1000000,
      maxLoanAmount: 50000000,
      isActive: true
    },
    loanAmount: 5000000,
    tenor: 12,
    loanStatus: 'SUBMITTED',
    currentStage: 'MARKETING',
    submittedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoanService]
    });

    service = TestBed.inject(LoanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getLoans', () => {
    it('should fetch paginated loans', (done) => {
      const params = { page: 0, size: 10 };
      const mockResponse = {
        items: [mockLoan],
        meta: {
          page: 0,
          size: 10,
          totalItems: 1,
          totalPages: 1
        }
      };

      service.getLoans(params).subscribe(response => {
        expect(response.items).toHaveLength(1);
        expect(response.items[0].id).toBe('loan-1');
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/loans?page=0&size=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockResponse });
    });

    it('should handle search parameter', (done) => {
      const params = { page: 0, size: 10, search: 'John' };

      service.getLoans(params).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/loans?page=0&size=10&search=John`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: { items: [], meta: { page: 0, size: 10, totalItems: 0, totalPages: 0 } } });
      done();
    });
  });

  describe('getLoanById', () => {
    it('should fetch loan by id', (done) => {
      service.getLoanById('loan-1').subscribe(loan => {
        expect(loan.id).toBe('loan-1');
        expect(loan.customerName).toBe('John Doe');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockLoan });
    });
  });

  describe('createLoan', () => {
    it('should create new loan', (done) => {
      const newLoan = {
        customerName: 'Jane Doe',
        productId: 'prod-1',
        loanAmount: 10000000,
        tenor: 24
      };

      service.createLoan(newLoan).subscribe(loan => {
        expect(loan.customerName).toBe('John Doe');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/loans`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newLoan);
      req.flush({ data: mockLoan });
    });
  });

  describe('approveLoan', () => {
    it('should approve loan with notes', (done) => {
      const approvalData = { notes: 'Approved by manager' };

      service.approveLoan('loan-1', approvalData).subscribe(loan => {
        expect(loan.loanStatus).toBe('SUBMITTED');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1/approve`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(approvalData);
      req.flush({ data: mockLoan });
    });
  });

  describe('rollbackLoan', () => {
    it('should rollback loan with reason', (done) => {
      const rollbackData = { reason: 'Need more documents' };

      service.rollbackLoan('loan-1', rollbackData).subscribe(loan => {
        expect(loan.id).toBe('loan-1');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1/rollback`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(rollbackData);
      req.flush({ data: mockLoan });
    });
  });
});
```

## 3. Guard Test Example - AuthGuard

**File:** `src/app/core/guards/auth.guard.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: jest.fn(),
      token: signal(null)
    } as unknown as jest.Mocked<AuthService>;

    routerMock = {
      navigate: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow access when user is authenticated', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to login when user is not authenticated', () => {
      authServiceMock.isAuthenticated.mockReturnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
```

## 4. Component Test Example - SlaBadgeComponent

**File:** `src/app/shared/components/sla-badge/sla-badge.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlaBadgeComponent } from './sla-badge.component';
import { Component, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LoanSLA } from '../../../core/models/loan.models';

describe('SlaBadgeComponent', () => {
  let component: SlaBadgeComponent;
  let fixture: ComponentFixture<SlaBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SlaBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display SAFE status with correct styling', () => {
    const mockSLA: LoanSLA = {
      status: 'SAFE',
      remainingSeconds: 3600,
      targetSeconds: 7200,
      isExpired: false
    };

    fixture.componentRef.setInput('sla', mockSLA);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[data-testid="sla-badge"]'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('SAFE');
    expect(badge.nativeElement.classList).toContain('bg-green-100');
  });

  it('should display EXPIRED status with correct styling', () => {
    const mockSLA: LoanSLA = {
      status: 'EXPIRED',
      remainingSeconds: 0,
      targetSeconds: 3600,
      isExpired: true
    };

    fixture.componentRef.setInput('sla', mockSLA);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[data-testid="sla-badge"]'));
    expect(badge.nativeElement.classList).toContain('bg-red-100');
  });

  it('should format remaining time correctly', () => {
    const mockSLA: LoanSLA = {
      status: 'WARNING',
      remainingSeconds: 3661,
      targetSeconds: 7200,
      isExpired: false
    };

    fixture.componentRef.setInput('sla', mockSLA);
    fixture.detectChanges();

    const timeDisplay = fixture.debugElement.query(By.css('[data-testid="sla-time"]'));
    expect(timeDisplay.nativeElement.textContent).toContain('01:01:01');
  });

  it('should handle null SLA gracefully', () => {
    fixture.componentRef.setInput('sla', null);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[data-testid="sla-badge"]'));
    expect(badge).toBeFalsy();
  });
});
```

## 5. Interceptor Test Example - AuthInterceptor

**File:** `src/app/core/interceptors/auth.interceptor.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(() => {
    authServiceMock = {
      token: signal('test-token-123')
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });

  it('should not add Authorization header when token is null', () => {
    authServiceMock.token.set(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not add Authorization header for auth endpoints', () => {
    httpClient.get('/auth/login').subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
```

## 6. Test Utilities

**File:** `src/app/testing/test-utils.ts`

```typescript
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Helper function to get element by test id
 */
export function getByTestId<T>(fixture: ComponentFixture<T>, testId: string) {
  return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
}

/**
 * Helper function to get all elements by test id
 */
export function getAllByTestId<T>(fixture: ComponentFixture<T>, testId: string) {
  return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
}

/**
 * Helper function to trigger input event
 */
export function setInputValue<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  value: string
) {
  const element = fixture.debugElement.query(By.css(selector));
  element.nativeElement.value = value;
  element.nativeElement.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

/**
 * Helper function to click element
 */
export function clickElement<T>(fixture: ComponentFixture<T>, selector: string) {
  const element = fixture.debugElement.query(By.css(selector));
  element.nativeElement.click();
  fixture.detectChanges();
}

/**
 * Mock factory for creating paginated responses
 */
export function createPaginatedResponse<T>(items: T[], page = 0, total = items.length) {
  return {
    items,
    total,
    page,
    pageSize: 10,
    totalPages: Math.ceil(total / 10)
  };
}

/**
 * Mock factory for API responses
 */
export function createApiResponse<T>(data: T, success = true, message = 'Success') {
  return {
    success,
    message,
    data
  };
}
```

## 7. Service Mocks

**File:** `src/app/testing/mocks/services.mock.ts`

```typescript
import { signal, computed } from '@angular/core';
import { of, Observable } from 'rxjs';
import { UserInfo } from '../../core/services/auth.service';
import { UserProfile } from '../../core/services/profile.service';

/**
 * Mock AuthService
 */
export const createAuthServiceMock = () => ({
  currentUser: signal<UserInfo | null>(null),
  token: signal<string | null>(null),
  login: jest.fn().mockReturnValue(of({ data: {} as UserInfo })),
  logout: jest.fn(),
  refreshToken: jest.fn().mockReturnValue(of({ data: {} })),
  fetchCurrentUser: jest.fn().mockReturnValue(of({ data: {} as UserInfo })),
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
  getProfile: jest.fn().mockReturnValue(of({ data: {} as UserProfile })),
  updateProfile: jest.fn().mockReturnValue(of({ data: {} as UserProfile })),
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
```
