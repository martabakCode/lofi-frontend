import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { provideRouter } from '@angular/router';
import { ProductFacade } from '../facades/product.facade';
import { ToastService } from '../../../core/services/toast.service';
import { ProductVM } from '../models/product.models';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ProductDetailComponent', () => {
    let component: ProductDetailComponent;
    let fixture: ComponentFixture<ProductDetailComponent>;
    let productFacadeMock: any;
    let toastServiceMock: any;
    let routeMock: ActivatedRoute;

    const createMockProduct = (): ProductVM => ({
        id: 'product-1',
        code: 'PL001',
        name: 'Personal Loan',
        minAmount: 1000000,
        maxAmount: 50000000,
        minTenor: 1,
        maxTenor: 12,
        interestRate: 0.12,
        tenorLabel: '1 - 12 months',
        amountRangeLabel: '1M - 50M',
        interestRateLabel: '12%'
    });

    beforeEach(async () => {
        productFacadeMock = {
            getProduct: jest.fn()
        };

        toastServiceMock = {
            show: jest.fn()
        };

        routeMock = {
            snapshot: {
                paramMap: {
                    get: jest.fn().mockReturnValue('product-1')
                }
            }
        } as any;

        await TestBed.configureTestingModule({
            imports: [ProductDetailComponent],
            providers: [
                provideRouter([]),
                { provide: ProductFacade, useValue: productFacadeMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: ActivatedRoute, useValue: routeMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have null product initially', () => {
            expect(component.product()).toBeNull();
        });

        it('should have loading set to false initially', () => {
            expect(component.loading()).toBe(false);
        });

        it('should have null error initially', () => {
            expect(component.error()).toBeNull();
        });
    });

    describe('ngOnInit', () => {
        it('should load product when id is provided', () => {
            const mockProduct = createMockProduct();
            productFacadeMock.getProduct.mockReturnValue(of(mockProduct));

            component.ngOnInit();

            expect(productFacadeMock.getProduct).toHaveBeenCalledWith('product-1');
        });

        it('should set error when id is not provided', () => {
            routeMock.snapshot.paramMap.get = jest.fn().mockReturnValue(null);

            component.ngOnInit();

            expect(component.error()).toBe('Product ID is required');
            expect(productFacadeMock.getProduct).not.toHaveBeenCalled();
        });
    });

    describe('loadProduct', () => {
        it('should load product successfully', () => {
            const mockProduct = createMockProduct();
            productFacadeMock.getProduct.mockReturnValue(of(mockProduct));

            component.loadProduct('product-1');

            expect(component.product()).toEqual(mockProduct);
            expect(component.loading()).toBe(false);
            expect(component.error()).toBeNull();
        });

        it('should handle error on load failure', () => {
            productFacadeMock.getProduct.mockReturnValue(of(null));

            component.loadProduct('product-1');

            expect(component.product()).toBeNull();
            expect(component.loading()).toBe(false);
        });

        it('should show toast on error', () => {
            productFacadeMock.getProduct.mockReturnValue(of(null));

            component.loadProduct('product-1');

            expect(toastServiceMock.show).toHaveBeenCalledWith('Failed to load product details', 'error');
        });
    });

    describe('goBack', () => {
        it('should navigate to products list', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');

            component.goBack();

            expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/products']);
        });
    });

    describe('editProduct', () => {
        it('should navigate to edit page when product exists', () => {
            const mockProduct = createMockProduct();
            component.product.set(mockProduct);
            const navigateSpy = jest.spyOn(component['router'], 'navigate');

            component.editProduct();

            expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/products', 'product-1', 'edit']);
        });

        it('should not navigate when product is null', () => {
            component.product.set(null);
            const navigateSpy = jest.spyOn(component['router'], 'navigate');

            component.editProduct();

            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('signal updates', () => {
        it('should support product signal updates', () => {
            const mockProduct = createMockProduct();
            component.product.set(mockProduct);
            expect(component.product()).toEqual(mockProduct);
        });

        it('should support loading signal updates', () => {
            component.loading.set(true);
            expect(component.loading()).toBe(true);
        });

        it('should support error signal updates', () => {
            component.error.set('Test error');
            expect(component.error()).toBe('Test error');
        });
    });
});
