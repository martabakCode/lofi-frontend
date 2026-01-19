import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductFacade } from './product.facade';
import { ProductService } from '../services/product.service';
import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ProductResponse } from '../models/product.models';

describe('ProductFacade', () => {
    let facade: ProductFacade;
    let serviceMock: any;

    const mockProducts: ProductResponse[] = [
        {
            id: '1',
            productCode: 'P1',
            productName: 'Product 1',
            description: 'Desc 1',
            interestRate: 1,
            adminFee: 1,
            minTenor: 1,
            maxTenor: 12,
            minLoanAmount: 1000,
            maxLoanAmount: 10000,
            isActive: true
        }
    ];

    beforeEach(() => {
        serviceMock = {
            getProducts: vi.fn().mockReturnValue(of({ items: mockProducts, meta: {} })),
            getProductById: vi.fn(),
            createProduct: vi.fn(),
            updateProduct: vi.fn(),
            deleteProduct: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                ProductFacade,
                { provide: ProductService, useValue: serviceMock }
            ]
        });

        facade = TestBed.inject(ProductFacade);
    });

    it('should load products and update state', () => {
        facade.loadProducts();

        expect(facade.loading()).toBe(false);
        expect(facade.products().length).toBe(1);
        expect(facade.products()[0].productName).toBe('Product 1');
        expect(facade.products()[0].tenorLabel).toBe('1 - 12 months');
    });

    it('should handle error when loading fails', () => {
        serviceMock.getProducts.mockReturnValue(throwError(() => new Error('API Error')));

        facade.loadProducts();

        expect(facade.loading()).toBe(false);
        expect(facade.error()).toBe('API Error');
        expect(facade.products().length).toBe(0);
    });
});
