
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanReviewComponent } from './loan-review/loan-review.component';
import { LoanApprovalComponent } from './loan-approval/loan-approval.component';
import { LoanFacade } from '../../core/facades/loan.facade';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';

describe('Loan UI Logic Tests', () => {
    let facadeMock: any;

    beforeEach(() => {
        facadeMock = {
            loading: signal(false),
            getLatestLoans: jasmine.createSpy('getLatestLoans').and.returnValue({ subscribe: () => { } }),
            canPerformAction: jasmine.createSpy('canPerformAction').and.returnValue(false),
            approveLoan: jasmine.createSpy('approveLoan').and.returnValue({ subscribe: () => { } }),
            rollbackLoan: jasmine.createSpy('rollbackLoan').and.returnValue({ subscribe: () => { } })
        };
    });

    describe('LoanApprovalComponent (Branch Manager)', () => {
        let component: LoanApprovalComponent;
        let fixture: ComponentFixture<LoanApprovalComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [LoanApprovalComponent],
                providers: [
                    { provide: LoanFacade, useValue: facadeMock }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(LoanApprovalComponent);
            component = fixture.componentInstance;
        });

        it('should only show Approve/Reject buttons', () => {
            component.loans.set([
                { id: '1', status: 'REVIEWED', amount: 1000000, customerName: 'Test' }
            ]);
            fixture.detectChanges();

            const approveBtn = fixture.debugElement.query(By.css('button.bg-amber-600')); // Tailwind class for Approve
            const rejectBtn = fixture.debugElement.query(By.css('button.text-red-500')); // Tailwind class for Reject

            expect(approveBtn).toBeTruthy('Approve button should be visible');
            expect(rejectBtn).toBeTruthy('Reject button should be visible');
        });

        it('should filter for REVIEWED status loans only', () => {
            component.loadLoans();
            expect(facadeMock.getLatestLoans).toHaveBeenCalledWith(jasmine.objectContaining({ status: 'REVIEWED' }));
        });
    });

    describe('LoanReviewComponent (Marketing)', () => {
        let component: LoanReviewComponent;
        let fixture: ComponentFixture<LoanReviewComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [LoanReviewComponent],
                providers: [
                    { provide: LoanFacade, useValue: facadeMock }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(LoanReviewComponent);
            component = fixture.componentInstance;
        });

        it('should show Review button for SUBMITTED loans', () => {
            component.loans.set([
                { id: '1', status: 'SUBMITTED', customerName: 'New Applicant' }
            ]);
            fixture.detectChanges();

            const reviewBtn = fixture.debugElement.query(By.css('.btn-primary'));
            expect(reviewBtn).toBeTruthy();
            expect(reviewBtn.nativeElement.textContent).toContain('Review');
        });

        it('should NOT show Approve button directly in list', () => {
            component.loans.set([
                { id: '1', status: 'SUBMITTED', customerName: 'New Applicant' }
            ]);
            fixture.detectChanges();

            const approveBtn = fixture.debugElement.query(By.css('.bg-green-600')); // Typical approve class
            expect(approveBtn).toBeFalsy('Approve button should not be in the list view for Marketing');
        });
    });
});
