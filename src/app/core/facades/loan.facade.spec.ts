import { TestBed } from '@angular/core/testing';
import { of, asyncScheduler } from 'rxjs';
import { LoanFacade } from './loan.facade';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
import { SlaService } from '../services/sla.service';
import { LoanStatus } from '../models/loan.models';
import { DisbursementPayload } from '../patterns/disbursement-builder';

describe('LoanFacade', () => {
    let facade: LoanFacade;
    let loanServiceMock: jest.Mocked<LoanService>;
    let authServiceMock: jest.Mocked<AuthService>;
    let slaServiceMock: jest.Mocked<SlaService>;

    const mockLoan = {
        id: 'loan-1',
        customerName: 'John Doe',
        productName: 'Personal Loan',
        amount: 5000000,
        tenure: 12,
        status: 'SUBMITTED',
        appliedDate: '2024-01-01'
    };

    beforeEach(() => {
        loanServiceMock = {
            getLoans: jest.fn().mockReturnValue(of({
                content: [mockLoan],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0
            })),
            getLoanById: jest.fn().mockReturnValue(of(mockLoan)),
            applyLoan: jest.fn().mockReturnValue(of(mockLoan)),
            submitLoan: jest.fn().mockReturnValue(of(mockLoan)),
            reviewLoan: jest.fn().mockReturnValue(of(mockLoan)),
            approveLoan: jest.fn().mockReturnValue(of(mockLoan)),
            rollbackLoan: jest.fn().mockReturnValue(of(mockLoan)),
            disburseLoan: jest.fn().mockReturnValue(of(mockLoan))
        } as unknown as jest.Mocked<LoanService>;

        authServiceMock = {
            getUserRoles: jest.fn().mockReturnValue(['ROLE_MARKETING'])
        } as unknown as jest.Mocked<AuthService>;

        slaServiceMock = {
            getSlaStatus: jest.fn().mockReturnValue(of({
                status: 'ON_TRACK',
                remainingHours: 48,
                isOverdue: false
            }))
        } as unknown as jest.Mocked<SlaService>;

        TestBed.configureTestingModule({
            providers: [
                LoanFacade,
                { provide: LoanService, useValue: loanServiceMock },
                { provide: AuthService, useValue: authServiceMock },
                { provide: SlaService, useValue: slaServiceMock }
            ]
        });

        facade = TestBed.inject(LoanFacade);
    });

    describe('getLatestLoans', () => {
        it('should fetch loans with default pagination', (done) => {
            facade.getLatestLoans().subscribe(response => {
                expect(response.content).toHaveLength(1);
                expect(loanServiceMock.getLoans).toHaveBeenCalledWith({ page: 0, size: 10 });
                done();
            });
        });

        it('should set loading to true while fetching and false after', (done) => {
            // Use async observable to test loading state properly
            loanServiceMock.getLoans.mockReturnValue(of({ content: [] }, asyncScheduler));

            expect(facade.loading()).toBe(false);

            facade.getLatestLoans().subscribe(() => {
                expect(facade.loading()).toBe(false);
                done();
            });

            expect(facade.loading()).toBe(true);
        });
    });

    describe('canPerformAction', () => {
        it('should return false for unknown status', () => {
            const result = facade.canPerformAction('UNKNOWN' as LoanStatus, 'APPROVE');
            expect(result).toBe(false);
        });

        it('should check if user can approve based on roles', () => {
            // SUBMITTED status matches ROLE_MARKETING
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_MARKETING']);
            expect(facade.canPerformAction(LoanStatus.SUBMITTED, 'APPROVE')).toBe(true);

            // REVIEWED status matches ROLE_BRANCH_MANAGER
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_BRANCH_MANAGER']);
            expect(facade.canPerformAction(LoanStatus.REVIEWED, 'APPROVE')).toBe(true);

            // Should be false if role doesn't match
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_CUSTOMER']);
            expect(facade.canPerformAction(LoanStatus.SUBMITTED, 'APPROVE')).toBe(false);
        });
    });

    describe('applyLoan', () => {
        it('should set loading state during apply', (done) => {
            loanServiceMock.applyLoan.mockReturnValue(of(mockLoan as any, asyncScheduler));

            facade.applyLoan({}).subscribe(() => {
                expect(facade.loading()).toBe(false);
                done();
            });

            expect(facade.loading()).toBe(true);
        });
    });

    describe('submitLoan', () => {
        it('should submit a loan', (done) => {
            facade.submitLoan('loan-1').subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loanServiceMock.submitLoan).toHaveBeenCalledWith('loan-1');
                done();
            });
        });
    });

    describe('approveLoan', () => {
        it('should approve a loan with notes', (done) => {
            facade.approveLoan('loan-1', 'Approved by manager').subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loanServiceMock.approveLoan).toHaveBeenCalledWith('loan-1', 'Approved by manager');
                done();
            });
        });
    });

    describe('reviewLoan', () => {
        it('should review a loan with notes', (done) => {
            facade.reviewLoan('loan-1', 'Reviewed and looks good').subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loanServiceMock.reviewLoan).toHaveBeenCalledWith('loan-1', 'Reviewed and looks good');
                done();
            });
        });
    });

    describe('rollbackLoan', () => {
        it('should rollback a loan with notes', (done) => {
            facade.rollbackLoan('loan-1', 'Need more documents').subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loanServiceMock.rollbackLoan).toHaveBeenCalledWith('loan-1', 'Need more documents');
                done();
            });
        });
    });

    describe('disburseLoan', () => {
        it('should disburse a loan with payload', (done) => {
            const payload: DisbursementPayload = {
                loanId: 'loan-1',
                disbursementDate: '2024-01-15',
                referenceNumber: 'DISB-001',
                proofUrl: 'https://example.com/proof.pdf'
            };

            facade.disburseLoan(payload).subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loanServiceMock.disburseLoan).toHaveBeenCalledWith(
                    'loan-1',
                    '2024-01-15',
                    'DISB-001'
                );
                done();
            });
        });
    });
});
