export interface DisbursementPayload {
    loanId: string;
    disbursementDate: string;
    referenceNumber: string;
    proofUrl?: string;
}

/**
 * BUILDER PATTERN
 * Constructs the disbursement payload step-by-step.
 */
export class LoanDisbursementBuilder {
    private payload: Partial<DisbursementPayload> = {};

    withLoanId(id: string): LoanDisbursementBuilder {
        this.payload.loanId = id;
        return this;
    }

    withAmount(amount: number): LoanDisbursementBuilder {
        // Logic could go here if amount needs special formatting/validation
        return this;
    }

    withReference(ref: string): LoanDisbursementBuilder {
        this.payload.referenceNumber = ref;
        return this;
    }

    withProof(url: string): LoanDisbursementBuilder {
        this.payload.proofUrl = url;
        return this;
    }

    withTodayAsDate(): LoanDisbursementBuilder {
        this.payload.disbursementDate = new Date().toISOString().split('T')[0];
        return this;
    }

    build(): DisbursementPayload {
        if (!this.payload.loanId || !this.payload.referenceNumber || !this.payload.disbursementDate) {
            throw new Error('Incomplete disbursement payload');
        }
        return this.payload as DisbursementPayload;
    }
}
