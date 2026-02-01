import { LoanAdapter, UI_Loan } from './loan.adapter';

describe('LoanAdapter', () => {
    const mockBackendLoan = {
        id: 'loan-123',
        loanAmount: 5000000,
        loanStatus: 'SUBMITTED',
        submittedAt: '2024-01-15T08:30:00Z'
    };

    describe('adapt', () => {
        it('should adapt backend loan to UI loan format', () => {
            const result: UI_Loan = LoanAdapter.adapt(mockBackendLoan);

            expect(result.id).toBe('loan-123');
            expect(result.amountDisplay).toMatch(/\$5[,.]000[,.]000/);
            expect(result.statusColor).toBe('blue');
            expect(result.dateStr).toBe('1/15/2024'); // Locale dependent
        });

        it('should format large amounts correctly', () => {
            const largeLoan = {
                ...mockBackendLoan,
                loanAmount: 1000000000
            };

            const result = LoanAdapter.adapt(largeLoan);

            expect(result.amountDisplay).toMatch(/\$1[,.]000[,.]000[,.]000/);
        });

        it('should format small amounts correctly', () => {
            const smallLoan = {
                ...mockBackendLoan,
                loanAmount: 1000
            };

            const result = LoanAdapter.adapt(smallLoan);

            expect(result.amountDisplay).toMatch(/\$1[,.]000/);
        });

        it('should return green status color for APPROVED status', () => {
            const approvedLoan = {
                ...mockBackendLoan,
                loanStatus: 'APPROVED'
            };

            const result = LoanAdapter.adapt(approvedLoan);

            expect(result.statusColor).toBe('green');
        });

        it('should return red status color for REJECTED status', () => {
            const rejectedLoan = {
                ...mockBackendLoan,
                loanStatus: 'REJECTED'
            };

            const result = LoanAdapter.adapt(rejectedLoan);

            expect(result.statusColor).toBe('red');
        });

        it('should return blue status color for SUBMITTED status', () => {
            const submittedLoan = {
                ...mockBackendLoan,
                loanStatus: 'SUBMITTED'
            };

            const result = LoanAdapter.adapt(submittedLoan);

            expect(result.statusColor).toBe('blue');
        });

        it('should return gray status color for unknown status', () => {
            const unknownLoan = {
                ...mockBackendLoan,
                loanStatus: 'UNKNOWN_STATUS'
            };

            const result = LoanAdapter.adapt(unknownLoan);

            expect(result.statusColor).toBe('gray');
        });

        it('should format date correctly', () => {
            const loanWithDate = {
                ...mockBackendLoan,
                submittedAt: '2024-12-25T00:00:00Z'
            };

            const result = LoanAdapter.adapt(loanWithDate);

            expect(result.dateStr).toContain('2024');
        });
    });
});
