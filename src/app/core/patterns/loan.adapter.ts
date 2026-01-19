export interface UI_Loan {
    id: string;
    amountDisplay: string;
    statusColor: string;
    dateStr: string;
}

/**
 * ADAPTER PATTERN
 * Adapts backend response (API model) to frontend requirement (UI model).
 */
export class LoanAdapter {
    static adapt(backendLoan: any): UI_Loan {
        return {
            id: backendLoan.id,
            amountDisplay: `$${backendLoan.loanAmount.toLocaleString()}`,
            statusColor: this.getStatusColor(backendLoan.loanStatus),
            dateStr: new Date(backendLoan.submittedAt).toLocaleDateString()
        };
    }

    private static getStatusColor(status: string): string {
        switch (status) {
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'red';
            case 'SUBMITTED': return 'blue';
            default: return 'gray';
        }
    }
}
