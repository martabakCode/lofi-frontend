
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanReviewComponent } from './loan-review/loan-review.component';
import { LoanApprovalComponent } from './loan-approval/loan-approval.component';
import { LoanFacade } from '../../core/facades/loan.facade';
import { By } from '@angular/platform-browser';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('Loan UI Logic Tests', () => {
    let facadeMock: any;

    beforeEach(() => {
        facadeMock = {
            loading: signal(false),
            getLatestLoans: jest.fn().mockReturnValue({ subscribe: () => { } }),
            canPerformAction: jest.fn().mockReturnValue(false),
            approveLoan: jest.fn().mockReturnValue({ subscribe: () => { } }),
            rollbackLoan: jest.fn().mockReturnValue({ subscribe: () => { } })
        };
    });

    describe('LoanApprovalComponent (Branch Manager)', () => {
        let component: LoanApprovalComponent;
        let fixture: ComponentFixture<LoanApprovalComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [LoanApprovalComponent],
                providers: [
                    provideRouter([]),
                    { provide: ActivatedRoute, useValue: { params: of({}) } },
                    { provide: LoanFacade, useValue: facadeMock }
                ],
                schemas: [NO_ERRORS_SCHEMA]
            }).compileComponents();

            fixture = TestBed.createComponent(LoanApprovalComponent);
            component = fixture.componentInstance;
        });

        it('should only show Approve/Reject buttons', () => {
            component.loans.set([
                { id: '1', status: 'REVIEWED', amount: 1000000, customerName: 'Test' } as any
            ]);
            fixture.detectChanges();

            const approveBtn = fixture.debugElement.query(By.css('button.bg-amber-600')); // Tailwind class for Approve
            const rejectBtn = fixture.debugElement.query(By.css('button.text-red-500')); // Tailwind class for Reject

            expect(approveBtn).toBeTruthy();
            expect(rejectBtn).toBeTruthy();
        });

        it('should filter for REVIEWED status loans only', () => {
            component.loadLoans();
            expect(facadeMock.getLatestLoans).toHaveBeenCalledWith(expect.objectContaining({ status: 'REVIEWED' }));
        });
    });

    describe('LoanReviewComponent (Marketing)', () => {
        let component: LoanReviewComponent;
        let fixture: ComponentFixture<LoanReviewComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [LoanReviewComponent],
                providers: [
                    provideRouter([]),
                    { provide: ActivatedRoute, useValue: { params: of({}) } },
                    { provide: LoanFacade, useValue: facadeMock }
                ],
                schemas: [NO_ERRORS_SCHEMA]
            }).compileComponents();

            fixture = TestBed.createComponent(LoanReviewComponent);
            component = fixture.componentInstance;
        });

        it('should show Review button for SUBMITTED loans', () => {
            component.loans.set([
                { id: '1', status: 'SUBMITTED', customerName: 'New Applicant' } as any
            ]);
            fixture.detectChanges();

            const reviewBtn = fixture.debugElement.query(By.css('.btn-primary'));
            expect(reviewBtn).toBeTruthy();
            expect(reviewBtn.nativeElement.textContent).toContain('Review');
        });

        it('should NOT show Approve button directly in list', () => {
            component.loans.set([
                { id: '1', status: 'SUBMITTED', customerName: 'New Applicant' } as any
            ]);
            fixture.detectChanges();

            const approveBtn = fixture.debugElement.query(By.css('.bg-green-600')); // Typical approve class
            expect(approveBtn).toBeFalsy();
        });
    });
});
