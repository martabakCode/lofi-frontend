import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoanApplicationComponent } from './loan-application.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentUploadService } from '../../../core/services/document-upload.service';
import { ProductFacade } from '../../products/facades/product.facade';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('LoanApplicationComponent', () => {
    let component: LoanApplicationComponent;
    let fixture: ComponentFixture<LoanApplicationComponent>;
    let loanFacadeMock: any;
    let loanServiceMock: any;
    let toastServiceMock: any;
    let documentUploadServiceMock: any;
    let productFacadeMock: any;
    let loanEventBusMock: any;
    let routerMock: any;

    const mockProducts = [
        { id: '1', code: 'BASIC', name: 'Basic Loan', minAmount: 1000000, maxAmount: 5000000, minTenor: 3, maxTenor: 12, isActive: true },
        { id: '2', code: 'PREMIUM', name: 'Premium Loan', minAmount: 5000000, maxAmount: 20000000, minTenor: 6, maxTenor: 24, isActive: true }
    ];

    beforeEach(async () => {
        loanFacadeMock = {
            loading: signal(false),
            applyLoan: jest.fn().mockReturnValue(of({ id: 'loan-123' })),
            submitLoan: jest.fn().mockReturnValue(of({})),
            cancelLoan: jest.fn().mockReturnValue(of({}))
        };

        loanServiceMock = {};

        toastServiceMock = {
            show: jest.fn()
        };

        documentUploadServiceMock = {
            ktpStatus: signal('IDLE'),
            selfieKtpStatus: signal('IDLE'),
            npwpStatus: signal('IDLE'),
            allDocumentsUploaded: signal(false),
            uploadDocument: jest.fn(),
            resetStatuses: jest.fn()
        };

        productFacadeMock = {
            products: signal(mockProducts),
            loadProducts: jest.fn()
        };

        loanEventBusMock = {
            emitLoanApplied: jest.fn()
        };

        routerMock = {
            navigate: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LoanApplicationComponent, ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: LoanFacade, useValue: loanFacadeMock },
                { provide: LoanService, useValue: loanServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: DocumentUploadService, useValue: documentUploadServiceMock },
                { provide: ProductFacade, useValue: productFacadeMock },
                { provide: LoanEventBus, useValue: loanEventBusMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoanApplicationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load products on init', () => {
        expect(productFacadeMock.loadProducts).toHaveBeenCalled();
        expect(component.filteredProducts().length).toBe(2);
    });

    it('should validate form on product change', fakeAsync(() => {
        // Select Basic Product
        component.applyForm.patchValue({ product: 'BASIC' });
        tick();

        // Check validators update
        const amountControl = component.applyForm.get('loanAmount');

        amountControl?.setValue(500000); // Below min
        expect(amountControl?.valid).toBe(false);

        amountControl?.setValue(6000000); // Above max
        expect(amountControl?.valid).toBe(false);

        amountControl?.setValue(2000000); // Valid
        expect(amountControl?.valid).toBe(true);
    }));

    it('should handle apply loan success', () => {
        component.applyForm.setValue({
            product: 'BASIC',
            loanAmount: 2000000,
            tenor: 6
        } as any);

        component.onApply();

        expect(loanFacadeMock.applyLoan).toHaveBeenCalled();
        expect(component.submittedLoanId()).toBe('loan-123');
        expect(toastServiceMock.show).toHaveBeenCalledWith(expect.stringContaining('Draft loan created'), 'success');
    });

    it('should show error if form is invalid on apply', () => {
        component.applyForm.patchValue({ product: '' });
        component.onApply();
        expect(toastServiceMock.show).toHaveBeenCalledWith('Please select a product', 'error');
        expect(loanFacadeMock.applyLoan).not.toHaveBeenCalled();
    });
});
