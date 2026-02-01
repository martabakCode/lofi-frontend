import { LoanDisbursementBuilder, DisbursementPayload } from './disbursement-builder';

describe('LoanDisbursementBuilder', () => {
    let builder: LoanDisbursementBuilder;

    beforeEach(() => {
        builder = new LoanDisbursementBuilder();
    });

    describe('withLoanId', () => {
        it('should set loan id', () => {
            const result = builder.withLoanId('loan-123');

            expect(result).toBe(builder);
        });
    });

    describe('withAmount', () => {
        it('should accept amount (returns builder for chaining)', () => {
            const result = builder.withAmount(5000000);

            expect(result).toBe(builder);
        });
    });

    describe('withReference', () => {
        it('should set reference number', () => {
            const result = builder.withReference('REF-2024-001');

            expect(result).toBe(builder);
        });
    });

    describe('withProof', () => {
        it('should set proof URL', () => {
            const result = builder.withProof('https://example.com/proof.pdf');

            expect(result).toBe(builder);
        });
    });

    describe('withTodayAsDate', () => {
        it('should set disbursement date to today', () => {
            const today = new Date().toISOString().split('T')[0];

            const result = builder.withTodayAsDate();

            expect(result).toBe(builder);
            const payload = result.withLoanId('loan-1').withReference('REF-001').build();
            expect(payload.disbursementDate).toBe(today);
        });
    });

    describe('build', () => {
        it('should build complete disbursement payload', () => {
            const payload: DisbursementPayload = builder
                .withLoanId('loan-123')
                .withReference('REF-2024-001')
                .withTodayAsDate()
                .withProof('https://example.com/proof.pdf')
                .build();

            expect(payload.loanId).toBe('loan-123');
            expect(payload.referenceNumber).toBe('REF-2024-001');
            expect(payload.proofUrl).toBe('https://example.com/proof.pdf');
            expect(payload.disbursementDate).toBeDefined();
        });

        it('should throw error when loanId is missing', () => {
            builder
                .withReference('REF-001')
                .withTodayAsDate();

            expect(() => builder.build()).toThrow('Incomplete disbursement payload');
        });

        it('should throw error when referenceNumber is missing', () => {
            builder
                .withLoanId('loan-123')
                .withTodayAsDate();

            expect(() => builder.build()).toThrow('Incomplete disbursement payload');
        });

        it('should throw error when disbursementDate is missing', () => {
            builder
                .withLoanId('loan-123')
                .withReference('REF-001');

            expect(() => builder.build()).toThrow('Incomplete disbursement payload');
        });

        it('should throw error when all fields are missing', () => {
            expect(() => builder.build()).toThrow('Incomplete disbursement payload');
        });

        it('should allow building without proof URL', () => {
            const payload: DisbursementPayload = builder
                .withLoanId('loan-123')
                .withReference('REF-2024-001')
                .withTodayAsDate()
                .build();

            expect(payload.loanId).toBe('loan-123');
            expect(payload.referenceNumber).toBe('REF-2024-001');
            expect(payload.proofUrl).toBeUndefined();
        });

        it('should support method chaining in any order', () => {
            const payload: DisbursementPayload = builder
                .withTodayAsDate()
                .withLoanId('loan-456')
                .withProof('https://example.com/doc.pdf')
                .withReference('REF-002')
                .build();

            expect(payload.loanId).toBe('loan-456');
            expect(payload.referenceNumber).toBe('REF-002');
            expect(payload.proofUrl).toBe('https://example.com/doc.pdf');
        });
    });
});
