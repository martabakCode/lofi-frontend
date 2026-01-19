import { describe, it, expect } from 'vitest';
import { ProductAdapter } from './product.adapter';
import { ProductResponse } from '../models/product.models';

describe('ProductAdapter', () => {
    const mockProduct: ProductResponse = {
        id: '1',
        productCode: 'PROD-001',
        productName: 'Personal Loan',
        description: 'A flexible personal loan',
        interestRate: 10.5,
        adminFee: 50000,
        minTenor: 6,
        maxTenor: 24,
        minLoanAmount: 1000000,
        maxLoanAmount: 50000000,
        isActive: true
    };

    it('should transform ProductResponse to ProductVM correctly', () => {
        const vm = ProductAdapter.toView(mockProduct);

        expect(vm.id).toBe(mockProduct.id);
        expect(vm.productName).toBe(mockProduct.productName);
        expect(vm.tenorLabel).toBe('6 - 24 months');
        expect(vm.interestRateLabel).toBe('10.5% p.a.');
        expect(vm.amountRangeLabel).toContain('1.000.000');
        expect(vm.amountRangeLabel).toContain('50.000.000');
    });

    it('should transform a list of ProductResponse correctly', () => {
        const vms = ProductAdapter.toViewList([mockProduct]);
        expect(vms.length).toBe(1);
        expect(vms[0].productCode).toBe(mockProduct.productCode);
    });
});
