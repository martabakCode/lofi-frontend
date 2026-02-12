import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductResponse } from '../models/product.models';
import { of } from 'rxjs';

describe('ProductFormComponent', () => {
    let component: ProductFormComponent;
    let fixture: ComponentFixture<ProductFormComponent>;
    let productServiceMock: any;
    let toastServiceMock: any;
    let routeMock: ActivatedRoute;

    const createMockProduct = (): ProductResponse => ({
        id: 'product-1',
        productCode: 'PL001',
        productName: 'Personal Loan',
        description: 'A personal loan product',
        interestRate: 0.12,
        adminFee: 0.01,
        minTenor: 1,
        maxTenor: 12,
        minLoanAmount: 1000000,
        maxLoanAmount: 50000000,
        isActive: true
    });

    beforeEach(async () => {
        productServiceMock = {
            getProductById: jest.fn(),
            createProduct: jest.fn(),
            updateProduct: jest.fn()
        };

        toastServiceMock = {
            show: jest.fn()
        };

        routeMock = {
            snapshot: {
                paramMap: {
                    get: jest.fn().mockReturnValue(null)
                }
            }
        } as any;

        await TestBed.configureTestingModule({
            imports: [ProductFormComponent, ReactiveFormsModule],
            providers: [
                FormBuilder,
                provideRouter([]),
                { provide: ProductService, useValue: productServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: ActivatedRoute, useValue: routeMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('form initialization', () => {
        it('should initialize form with required validators', () => {
            expect(component.productForm).toBeDefined();
            expect(component.productForm.get('productCode')?.hasValidator(Validators.required)).toBe(true);
            expect(component.productForm.get('productName')?.hasValidator(Validators.required)).toBe(true);
        });

        it('should have numeric validators for amount fields', () => {
            expect(component.productForm.get('minLoanAmount')?.hasValidator(Validators.min(0))).toBe(true);
            expect(component.productForm.get('maxLoanAmount')?.hasValidator(Validators.min(0))).toBe(true);
        });

        it('should have numeric validators for tenor fields', () => {
            expect(component.productForm.get('minTenor')?.hasValidator(Validators.min(1))).toBe(true);
            expect(component.productForm.get('maxTenor')?.hasValidator(Validators.min(1))).toBe(true);
        });

        it('should have numeric validators for interest rate', () => {
            expect(component.productForm.get('interestRate')?.hasValidator(Validators.min(0))).toBe(true);
        });

        it('should have default values for isActive', () => {
            expect(component.productForm.get('isActive')?.value).toBe(true);
        });

        it('should have default tenor values', () => {
            expect(component.productForm.get('minTenor')?.value).toBe(1);
            expect(component.productForm.get('maxTenor')?.value).toBe(12);
        });
    });

    describe('initial state', () => {
        it('should have isEditMode set to false initially', () => {
            expect(component.isEditMode()).toBe(false);
        });

        it('should have isSubmitting set to false initially', () => {
            expect(component.isSubmitting()).toBe(false);
        });

        it('should have null error initially', () => {
            expect(component.error()).toBeNull();
        });

        it('should have null productId initially', () => {
            expect(component.productId()).toBeNull();
        });
    });

    describe('ngOnInit', () => {
        it('should set edit mode when id is provided', () => {
            routeMock.snapshot.paramMap.get = jest.fn().mockReturnValue('product-1');

            component.ngOnInit();

            expect(component.isEditMode()).toBe(true);
            expect(component.productId()).toBe('product-1');
        });

        it('should not set edit mode when id is not provided', () => {
            component.ngOnInit();

            expect(component.isEditMode()).toBe(false);
            expect(component.productId()).toBeNull();
        });
    });

    describe('loadProduct', () => {
        it('should load product successfully', () => {
            const mockProduct = createMockProduct();
            productServiceMock.getProductById.mockReturnValue(of(mockProduct));
            component.productId.set('product-1');
            component.isEditMode.set(true);

            component.loadProduct('product-1');

            expect(component.productForm.get('productCode')?.value).toBe('PL001');
            expect(component.productForm.get('productName')?.value).toBe('Personal Loan');
            expect(component.isSubmitting()).toBe(false);
        });
    });

    describe('onSubmit validation', () => {
        it('should mark all fields as touched when form is invalid', () => {
            component.productForm.get('productCode')?.setValue('');
            component.productForm.get('productName')?.setValue('');

            component.onSubmit();

            expect(component.productForm.touched).toBe(true);
        });

        it('should set error when min loan amount is greater than max', () => {
            component.productForm.patchValue({
                productCode: 'PL001',
                productName: 'Test',
                minLoanAmount: 50000000,
                maxLoanAmount: 1000000
            });

            component.onSubmit();

            expect(component.error()).toBe('Minimum loan amount cannot be greater than maximum amount');
        });

        it('should set error when min tenor is greater than max', () => {
            component.productForm.patchValue({
                productCode: 'PL001',
                productName: 'Test',
                minTenor: 12,
                maxTenor: 1
            });

            component.onSubmit();

            expect(component.error()).toBe('Minimum tenor cannot be greater than maximum tenor');
        });
    });

    describe('signal updates', () => {
        it('should support isEditMode signal updates', () => {
            component.isEditMode.set(true);
            expect(component.isEditMode()).toBe(true);
        });

        it('should support isSubmitting signal updates', () => {
            component.isSubmitting.set(true);
            expect(component.isSubmitting()).toBe(true);
        });

        it('should support error signal updates', () => {
            component.error.set('Test error');
            expect(component.error()).toBe('Test error');
        });

        it('should support productId signal updates', () => {
            component.productId.set('product-1');
            expect(component.productId()).toBe('product-1');
        });
    });

    describe('form controls', () => {
        it('should contain all required form controls', () => {
            expect(component.productForm.contains('productCode')).toBe(true);
            expect(component.productForm.contains('productName')).toBe(true);
            expect(component.productForm.contains('description')).toBe(true);
            expect(component.productForm.contains('minLoanAmount')).toBe(true);
            expect(component.productForm.contains('maxLoanAmount')).toBe(true);
            expect(component.productForm.contains('minTenor')).toBe(true);
            expect(component.productForm.contains('maxTenor')).toBe(true);
            expect(component.productForm.contains('interestRate')).toBe(true);
            expect(component.productForm.contains('adminFee')).toBe(true);
            expect(component.productForm.contains('isActive')).toBe(true);
        });
    });
});
