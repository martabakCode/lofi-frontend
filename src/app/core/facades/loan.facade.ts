import { Injectable, inject, signal } from '@angular/core';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../services/auth.service';
import { SlaService } from '../services/sla.service';
import { LoanStatusEngine } from '../patterns/loan-status-engine';
import { LoanStatus, LoanSLA } from '../models/loan.models';
import { finalize, map, Observable } from 'rxjs';
import { DisbursementPayload } from '../patterns/disbursement-builder';

@Injectable({
    providedIn: 'root'
})
export class LoanFacade {
    private loanService = inject(LoanService);
    private authService = inject(AuthService);
    private slaService = inject(SlaService);

    loading = signal(false);

    getLatestLoans(params: any = { page: 0, size: 10 }) {
        this.loading.set(true);
        return this.loanService.getLoans(params).pipe(
            finalize(() => this.loading.set(false))
        );
    }

    getLoanDetails(id: string) {
        return this.loanService.getLoanById(id);
    }

    /**
     * OBSERVER PATTERN: Get real-time SLA status for a loan
     */
    getLoanSLA(submittedAt: string): Observable<LoanSLA> {
        return this.slaService.getSlaStatus(submittedAt);
    }

    /**
     * COMPOSITE PATTERN: Check if action is allowed based on status engine
     */
    canPerformAction(status: LoanStatus, action: 'APPROVE' | 'ROLLBACK'): boolean {
        const node = LoanStatusEngine.getNode(status);
        if (!node) return false;

        const userRoles = this.authService.getUserRoles();

        if (action === 'APPROVE') {
            return node.canApprove(userRoles);
        } else {
            return node.canRollback();
        }
    }

    /**
     * FACADE methods for Lifecycle
     */
    applyLoan(request: any) {
        this.loading.set(true);
        return this.loanService.applyLoan(request).pipe(
            finalize(() => this.loading.set(false))
        );
    }

    submitLoan(loanId: string) {
        this.loading.set(true);
        return this.loanService.submitLoan(loanId).pipe(
            finalize(() => this.loading.set(false))
        );
    }

    approveLoan(loanId: string, notes: string) {
        return this.loanService.approveLoan(loanId, notes);
    }

    reviewLoan(loanId: string, notes: string) {
        return this.loanService.reviewLoan(loanId, notes);
    }

    rollbackLoan(loanId: string, notes: string) {
        return this.loanService.rollbackLoan(loanId, notes);
    }

    disburseLoan(payload: DisbursementPayload) {
        return this.loanService.disburseLoan(
            payload.loanId,
            payload.disbursementDate,
            payload.referenceNumber
        );
    }
}
