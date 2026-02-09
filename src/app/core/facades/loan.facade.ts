import { Injectable, inject, signal, computed } from '@angular/core';
import { LoanService, BackendLoanResponse, Loan } from '../services/loan.service';
import { LoanStatusEngine } from '../patterns/loan-status-engine';
import { LoanStatus, LoanSLA } from '../models/loan.models';
import { LoanAdapter } from '../../features/loans/adapters/loan.adapter';
import { LoanVM } from '../../features/loans/models/loan.models';
import { finalize, map, Observable, tap } from 'rxjs';
import { DisbursementPayload } from '../patterns/disbursement-builder';
import { ToastService } from '../services/toast.service';

@Injectable({
    providedIn: 'root'
})
export class LoanFacade {
    private loanService = inject(LoanService);
    private toastService = inject(ToastService);

    // State signals
    private loansSignal = signal<LoanVM[]>([]);
    private loadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    // Selectors
    loans = computed(() => this.loansSignal());
    loading = computed(() => this.loadingSignal());
    error = computed(() => this.errorSignal());

    /**
     * FACADE PATTERN
     * Simplifies component interaction by hiding complex logic (API calls, data transformation).
     */
    loadLoans(params: any = { page: 0, size: 10 }): Observable<{ content: LoanVM[], totalElements: number, totalPages: number }> {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        return this.loanService.getLoans(params)
            .pipe(
                map(res => ({
                    content: LoanAdapter.toViewList(res.content || []),
                    totalElements: res.totalElements || 0,
                    totalPages: res.totalPages || 0
                })),
                tap({
                    next: (res) => this.loansSignal.set(res.content),
                    error: (err) => {
                        this.errorSignal.set(err.message || 'Failed to load loans');
                        this.toastService.show('Failed to load loans', 'error');
                    },
                    finalize: () => this.loadingSignal.set(false)
                })
            );
    }

    getLatestLoans(params: any = { page: 0, size: 10 }) {
        return this.loadLoans(params);
    }

    getLoan(id: string) {
        return this.loanService.getLoanById(id).pipe(
            map(dto => LoanAdapter.toView(dto)),
            tap({
                error: () => this.toastService.show('Failed to load loan details', 'error')
            })
        );
    }

    /**
     * OBSERVER PATTERN: Get real-time SLA status for a loan
     */
    getLoanSLA(submittedAt: string): Observable<LoanSLA> {
        const { SlaService } = require('../services/sla.service');
        return new SlaService().getSlaStatus(submittedAt);
    }

    /**
     * COMPOSITE PATTERN: Check if action is allowed based on status engine
     */
    canPerformAction(status: LoanStatus, action: 'APPROVE' | 'ROLLBACK'): boolean {
        const node = LoanStatusEngine.getNode(status);
        if (!node) return false;

        const { AuthService } = require('../services/auth.service');
        const userRoles = new AuthService().getUserRoles();

        if (action === 'APPROVE') {
            return node.canApprove(userRoles);
        } else {
            return node.canRollback();
        }
    }

    /**
     * FACADE methods for Lifecycle with loading state and toast notifications
     */
    applyLoan(request: any) {
        this.loadingSignal.set(true);
        return this.loanService.applyLoan(request).pipe(
            tap({
                next: () => this.toastService.show('Loan application submitted successfully', 'success'),
                error: () => this.toastService.show('Failed to submit loan application', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    submitLoan(loanId: string) {
        this.loadingSignal.set(true);
        return this.loanService.submitLoan(loanId).pipe(
            tap({
                next: () => this.toastService.show('Loan submitted successfully', 'success'),
                error: () => this.toastService.show('Failed to submit loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    reviewLoan(loanId: string, notes: string) {
        this.loadingSignal.set(true);
        return this.loanService.reviewLoan(loanId, notes).pipe(
            tap({
                next: () => this.toastService.show('Loan reviewed successfully', 'success'),
                error: () => this.toastService.show('Failed to review loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    approveLoan(loanId: string, notes: string) {
        this.loadingSignal.set(true);
        return this.loanService.approveLoan(loanId, notes).pipe(
            tap({
                next: () => this.toastService.show('Loan approved successfully', 'success'),
                error: () => this.toastService.show('Failed to approve loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    rejectLoan(loanId: string, reason: string) {
        this.loadingSignal.set(true);
        return this.loanService.rejectLoan(loanId, reason).pipe(
            tap({
                next: () => this.toastService.show('Loan rejected', 'info'),
                error: () => this.toastService.show('Failed to reject loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    disburseLoan(loanIdOrPayload: string | any, date?: string, reference?: string) {
        let loanId: string;
        let finalDate: string;
        let finalRef: string;

        if (typeof loanIdOrPayload === 'object' && loanIdOrPayload !== null) {
            // Handle payload object
            loanId = loanIdOrPayload.loanId;
            finalDate = loanIdOrPayload.disbursementDate || loanIdOrPayload.date || new Date().toISOString().split('T')[0];
            finalRef = loanIdOrPayload.referenceNumber || loanIdOrPayload.reference || '';
        } else {
            // Handle separate arguments
            loanId = loanIdOrPayload;
            finalDate = date || new Date().toISOString().split('T')[0];
            finalRef = reference || '';
        }

        this.loadingSignal.set(true);
        return this.loanService.disburseLoan(loanId, finalDate, finalRef).pipe(
            tap({
                next: () => this.toastService.show('Loan disbursed successfully', 'success'),
                error: () => this.toastService.show('Failed to disburse loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    completeLoan(loanId: string) {
        this.loadingSignal.set(true);
        return this.loanService.completeLoan(loanId).pipe(
            tap({
                next: () => this.toastService.show('Loan completed successfully', 'success'),
                error: () => this.toastService.show('Failed to complete loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    cancelLoan(loanId: string, reason?: string) {
        this.loadingSignal.set(true);
        // Note: loanService.cancelLoan might support reason, passing it if available?
        // Checking previous file content, loanService.cancelLoan(loanId) was used.
        // Assuming implementation matches service.
        return this.loanService.cancelLoan(loanId).pipe(
            tap({
                next: () => this.toastService.show('Loan cancelled', 'info'),
                error: () => this.toastService.show('Failed to cancel loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }

    rollbackLoan(loanId: string, notes: string) {
        this.loadingSignal.set(true);
        return this.loanService.rollbackLoan(loanId, notes).pipe(
            tap({
                next: () => this.toastService.show('Loan rolled back successfully', 'success'),
                error: () => this.toastService.show('Failed to rollback loan', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadLoans().subscribe();
            })
        );
    }
}
