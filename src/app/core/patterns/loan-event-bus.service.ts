import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * PUBLISHER/SUBSCRIBER PATTERN
 * Also implements OBSERVER PATTERN via RxJS Observables.
 * Allows loosely coupled communication between components.
 */
@Injectable({
    providedIn: 'root'
})
export class LoanEventBus {
    // Publisher stream for new applications
    private loanAppliedSubject = new Subject<string>();
    loanApplied$ = this.loanAppliedSubject.asObservable();

    // Generic update event to refresh lists
    private loanUpdatedSubject = new Subject<void>();
    loanUpdated$ = this.loanUpdatedSubject.asObservable();

    emitLoanApplied(loanId: string) {
        console.log('EVENT BUS: Publishing Loan Applied event for ID:', loanId);
        this.loanAppliedSubject.next(loanId);
        this.loanUpdatedSubject.next();
    }

    emitLoanUpdated() {
        console.log('EVENT BUS: Publishing Loan Updated event');
        this.loanUpdatedSubject.next();
    }
}
