import { ProductBuilder } from './product.builder';

describe('ProductBuilder', () => {
    let builder: ProductBuilder;

    beforeEach(() => {
        builder = new ProductBuilder();
    });

    it('should create an instance', () => {
        expect(builder).toBeTruthy();
    });

    describe('reset', () => {
        it('should reset the product to empty object', () => {
            builder.setBasicInfo('CODE', 'Name', 'Description');
            builder.reset();
            const product = builder.build();
            expect(product.productCode).toBeUndefined();
        });
    });

    describe('setBasicInfo', () => {
        it('should set product code', () => {
            builder.setBasicInfo('P001', 'Product Name', 'Description');
            const product = builder.build();
            expect(product.productCode).toBe('P001');
        });

        it('should set product name', () => {
            builder.setBasicInfo('P001', 'Product Name', 'Description');
            const product = builder.build();
            expect(product.productName).toBe('Product Name');
        });

        it('should set description', () => {
            builder.setBasicInfo('P001', 'Product Name', 'Product Description');
            const product = builder.build();
            expect(product.description).toBe('Product Description');
        });

        it('should return builder for chaining', () => {
            const result = builder.setBasicInfo('P001', 'Name', 'Desc');
            expect(result).toBe(builder);
        });
    });

    describe('setFinancials', () => {
        it('should set interest rate', () => {
            builder.setFinancials(10.5, 100);
            const product = builder.build();
            expect(product.interestRate).toBe(10.5);
        });

        it('should set admin fee', () => {
            builder.setFinancials(10.5, 100);
            const product = builder.build();
            expect(product.adminFee).toBe(100);
        });

        it('should return builder for chaining', () => {
            const result = builder.setFinancials(10.5, 100);
            expect(result).toBe(builder);
        });
    });

    describe('setLimits', () => {
        it('should set min tenor', () => {
            builder.setLimits(6, 24, 1000, 10000);
            const product = builder.build();
            expect(product.minTenor).toBe(6);
        });

        it('should set max tenor', () => {
            builder.setLimits(6, 24, 1000, 10000);
            const product = builder.build();
            expect(product.maxTenor).toBe(24);
        });

        it('should set min loan amount', () => {
            builder.setLimits(6, 24, 1000, 10000);
            const product = builder.build();
            expect(product.minLoanAmount).toBe(1000);
        });

        it('should set max loan amount', () => {
            builder.setLimits(6, 24, 1000, 10000);
            const product = builder.build();
            expect(product.maxLoanAmount).toBe(10000);
        });

        it('should return builder for chaining', () => {
            const result = builder.setLimits(6, 24, 1000, 10000);
            expect(result).toBe(builder);
        });
    });

    describe('build', () => {
        it('should build complete product with chaining', () => {
            const product = builder
                .setBasicInfo('P001', 'Personal Loan', 'A personal loan product')
                .setFinancials(12.5, 150)
                .setLimits(6, 36, 1000, 50000)
                .build();

            expect(product.productCode).toBe('P001');
            expect(product.productName).toBe('Personal Loan');
            expect(product.description).toBe('A personal loan product');
            expect(product.interestRate).toBe(12.5);
            expect(product.adminFee).toBe(150);
            expect(product.minTenor).toBe(6);
            expect(product.maxTenor).toBe(36);
            expect(product.minLoanAmount).toBe(1000);
            expect(product.maxLoanAmount).toBe(50000);
        });
    });
});
