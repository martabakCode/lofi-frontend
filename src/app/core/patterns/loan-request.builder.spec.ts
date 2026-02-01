import { LoanRequestBuilder } from './loan-request.builder';

describe('LoanRequestBuilder', () => {
    let builder: LoanRequestBuilder;

    beforeEach(() => {
        builder = new LoanRequestBuilder();
    });

    describe('setAmount', () => {
        it('should set loan amount', () => {
            const result = builder.setAmount(5000000);

            expect(result).toBe(builder); // Returns this for chaining
        });
    });

    describe('setTenor', () => {
        it('should set tenor in months', () => {
            const result = builder.setTenor(12);

            expect(result).toBe(builder);
        });
    });

    describe('setProduct', () => {
        it('should set product id', () => {
            const result = builder.setProduct('prod-123');

            expect(result).toBe(builder);
        });
    });

    describe('setCustomer', () => {
        it('should set customer id', () => {
            const result = builder.setCustomer('cust-456');

            expect(result).toBe(builder);
        });
    });

    describe('build', () => {
        it('should build complete loan request', () => {
            const request = builder
                .setAmount(5000000)
                .setTenor(12)
                .setProduct('prod-123')
                .setCustomer('cust-456')
                .build();

            expect(request).toEqual({
                loanAmount: 5000000,
                tenor: 12,
                productId: 'prod-123',
                customerId: 'cust-456'
            });
        });

        it('should throw error when loanAmount is missing', () => {
            builder
                .setTenor(12)
                .setProduct('prod-123');

            expect(() => builder.build()).toThrow('Incomplete loan request');
        });

        it('should throw error when productId is missing', () => {
            builder
                .setAmount(5000000)
                .setTenor(12);

            expect(() => builder.build()).toThrow('Incomplete loan request');
        });

        it('should throw error when both required fields are missing', () => {
            expect(() => builder.build()).toThrow('Incomplete loan request');
        });

        it('should allow building with only required fields', () => {
            const request = builder
                .setAmount(10000000)
                .setProduct('prod-789')
                .build();

            expect(request.loanAmount).toBe(10000000);
            expect(request.productId).toBe('prod-789');
            expect(request.tenor).toBeUndefined();
            expect(request.customerId).toBeUndefined();
        });

        it('should support method chaining', () => {
            const request = builder
                .setAmount(5000000)
                .setTenor(24)
                .setProduct('prod-001')
                .setCustomer('cust-001')
                .build();

            expect(request).toEqual({
                loanAmount: 5000000,
                tenor: 24,
                productId: 'prod-001',
                customerId: 'cust-001'
            });
        });
    });
});
