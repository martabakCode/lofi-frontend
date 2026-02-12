import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanDetailComponent } from './loan-detail.component';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoanVM } from '../models/loan.models';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Child components to override
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status/status-badge.component';

describe('LoanDetailComponent', () => {
    let component: LoanDetailComponent;
    let fixture: ComponentFixture<LoanDetailComponent>;
    let loanFacadeMock: any;
    let toastServiceMock: any;
    let documentServiceMock: any;
    let authServiceMock: any;
    let routerMock: any;
    let routeMock: any;

    const mockLoan: LoanVM = {
        id: '123',
        status: 'SUBMITTED',
        amount: 1000000,
        customerName: 'John Doe',
        productName: 'Instant Cash',
        tenor: 12,
        appliedDate: '2024-01-01',
        documents: [],
        latitude: 0,
        longitude: 0,
        customerId: 'cust-123',
        customerEmail: 'john@example.com',
        productId: 'prod-123',
        updatedAt: '2024-01-01',
        amountLabel: 'Rp 1.000.000',
        tenorLabel: '12 Months',
        statusLabel: 'Submitted',
        statusVariant: 'INFO'
    };

    beforeEach(async () => {
        loanFacadeMock = {
            getLoan: jest.fn().mockReturnValue(of(mockLoan)),
            submitLoan: jest.fn().mockReturnValue(of({})),
            approveLoan: jest.fn().mockReturnValue(of({})),
            rejectLoan: jest.fn().mockReturnValue(of({})),
            reviewLoan: jest.fn().mockReturnValue(of({})),
            disburseLoan: jest.fn().mockReturnValue(of({})),
            completeLoan: jest.fn().mockReturnValue(of({})),
            cancelLoan: jest.fn().mockReturnValue(of({}))
        };

        toastServiceMock = {
            show: jest.fn()
        };

        documentServiceMock = {
            getDownloadUrl: jest.fn().mockReturnValue(of({ downloadUrl: 'http://example.com' }))
        };

        authServiceMock = {
            currentUser: jest.fn().mockReturnValue({ roles: ['ROLE_USER'] })
        };

        // Router mock needs to look like a Provider
        routerMock = {
            navigate: jest.fn()
        };

        routeMock = {
            paramMap: of({ get: (key: string) => '123' })
        };



        await TestBed.configureTestingModule({
            imports: [LoanDetailComponent],
            providers: [
                { provide: LoanFacade, useValue: loanFacadeMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: DocumentService, useValue: documentServiceMock },
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: routeMock }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .overrideComponent(LoanDetailComponent, {
                remove: {
                    imports: [
                        LoanActionsComponent,
                        PageHeaderComponent,
                        CardComponent,
                        StatusBadgeComponent
                    ]
                },
                add: {
                    schemas: [NO_ERRORS_SCHEMA]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(LoanDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load loan details on init', () => {
        expect(loanFacadeMock.getLoan).toHaveBeenCalledWith('123');
        expect(component.loan()).toEqual(mockLoan);
        expect(component.loading()).toBe(false);
    });

    it('should handle error when loading loan fails', () => {
        loanFacadeMock.getLoan.mockReturnValue(throwError(() => new Error('Network error')));
        component.loadLoan('123');
        expect(component.error()).toBe('Network error');
        expect(toastServiceMock.show).toHaveBeenCalledWith('Failed to load loan details', 'error');
    });

    it('should handle SUBMIT action', () => {
        component.handleAction({ type: 'SUBMIT' });
        expect(loanFacadeMock.submitLoan).toHaveBeenCalledWith('123');
    });

    it('should handle APPROVE action', () => {
        component.handleAction({ type: 'APPROVE' });
        expect(loanFacadeMock.approveLoan).toHaveBeenCalledWith('123', 'Approved');
    });

    it('should handle REJECT action with reason', () => {
        component.handleAction({ type: 'REJECT', payload: { reason: 'Bad credit' } });
        expect(loanFacadeMock.rejectLoan).toHaveBeenCalledWith('123', 'Bad credit');
    });
});
