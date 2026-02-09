import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentUploadService } from '../../../core/services/document-upload.service';
import { ProductFacade } from '../../products/facades/product.facade';
import { LoanRequestBuilder } from '../../../core/patterns/loan-request.builder';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';

/**
 * Loan Application Component
 * 
 * Refactored to use DocumentUploadService and DocumentUploadComponent
 * for document upload functionality, eliminating code duplication
 * with MarketingLoanApplicationComponent.
 */
@Component({
    selector: 'app-loan-application',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './loan-application.component.html',
    styleUrls: ['./loan-application.component.css']
})
export class LoanApplicationComponent implements OnInit {
    private fb = inject(FormBuilder);
    private loanService = inject(LoanService);
    private loanFacade = inject(LoanFacade);
    private productFacade = inject(ProductFacade);
    private eventBus = inject(LoanEventBus);
    private router = inject(Router);
    private toast = inject(ToastService);
    private documentUploadService = inject(DocumentUploadService);

    products = this.productFacade.products;
    loading = this.loanFacade.loading;
    submittedLoanId = signal<string | null>(null);

    // Document types for upload
    readonly documentTypes = ['KTP', 'SELFIE_KTP', 'NPWP'] as const;

    // Expose document upload status signals for template
    ktpStatus = this.documentUploadService.ktpStatus;
    selfieKtpStatus = this.documentUploadService.selfieKtpStatus;
    npwpStatus = this.documentUploadService.npwpStatus;

    // Computed property from service
    allDocumentsUploaded = this.documentUploadService.allDocumentsUploaded;

    // 2️⃣ Product Selector UI - Sort order: Basic, Standard, Premium
    // 2️⃣ Product Selector UI - Sort by Min Amount (Basic -> Standard -> Premium)
    filteredProducts = computed(() => {
        return this.products()
            .filter(p => p.isActive !== false) // Show all active
            .sort((a, b) => a.minAmount - b.minAmount);
    });

    applyForm = this.fb.group({
        product: ['', Validators.required], // Changed from productId to product (code)
        loanAmount: [5000000, [Validators.required]],
        tenor: [12, [Validators.required]]
    });

    constructor() {
        // 3️⃣ Dynamic Validation
        effect(() => {
            const productCode = this.applyForm.controls.product.value;
            if (productCode) {
                this.onProductChange(productCode);
            }
        });

        // Also listen to product control changes directly for non-signal based updates if needed
        this.applyForm.controls.product.valueChanges.subscribe(code => {
            if (code) this.onProductChange(code);
        });
    }

    onProductChange(code: string) {
        const product = this.filteredProducts().find(p => p.code === code);
        if (!product) return;

        // Update validators
        this.applyForm.controls['loanAmount'].setValidators([
            Validators.required,
            Validators.min(product.minAmount),
            Validators.max(product.maxAmount)
        ]);

        this.applyForm.controls['tenor'].setValidators([
            Validators.required,
            Validators.min(product.minTenor),
            Validators.max(product.maxTenor)
        ]);

        this.applyForm.controls['loanAmount'].updateValueAndValidity();
        this.applyForm.controls['tenor'].updateValueAndValidity();
    }

    ngOnInit() {
        this.productFacade.loadProducts();
    }

    onApply() {
        if (this.applyForm.invalid) {
            // 4️⃣ UX RULES - Show validation errors via toast
            const controls = this.applyForm.controls;
            const productCode = controls.product.value;
            const product = this.filteredProducts().find(p => p.code === productCode);

            if (controls.product.errors?.['required']) {
                this.toast.show('Please select a product', 'error');
            }
            if (controls.loanAmount.errors) {
                if (product) {
                    this.toast.show(`Amount must be between ${product.minAmount.toLocaleString()} and ${product.maxAmount.toLocaleString()}`, 'error');
                } else {
                    this.toast.show('Invalid loan amount', 'error');
                }
            }
            if (controls.tenor.errors) {
                if (product) {
                    this.toast.show(`Tenor hanya boleh ${product.minTenor}–${product.maxTenor} bulan`, 'error');
                } else {
                    this.toast.show('Invalid tenor', 'error');
                }
            }
            return;
        }

        const val = this.applyForm.value;
        // Lookup Product ID from Code
        const product = this.filteredProducts().find(p => p.code === val.product);
        if (!product) {
            this.toast.show('Invalid product selection', 'error');
            return;
        }

        // BUILDER PATTERN
        const request = new LoanRequestBuilder()
            .setProduct(product.id || product.code) // Use ID if available, else code (fallback)
            .setAmount(Number(val.loanAmount))
            .setTenor(Number(val.tenor))
            .build();

        this.loanFacade.applyLoan(request).subscribe({
            next: (loan) => {
                this.submittedLoanId.set(loan.id);
                this.toast.show('Draft loan created. Please review and submit.', 'success');
            },
            error: (err) => {
                // Error handled by Global Interceptor mostly, but if we need specific local logic:
                console.error(err);
            }
        });
    }

    /**
     * Legacy method for direct file selection (kept for backward compatibility)
     * Now delegates to DocumentUploadService
     */
    onFileSelected(event: Event, type: 'KTP' | 'SELFIE_KTP' | 'NPWP') {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        const loanId = this.submittedLoanId();
        if (!loanId) return;

        this.documentUploadService.uploadDocument(loanId, file, type);
    }

    onSubmitFinal() {
        if (!this.allDocumentsUploaded()) {
            this.toast.show('Please upload all required documents (KTP, Photo with KTP, NPWP)', 'error');
            return;
        }

        const id = this.submittedLoanId();
        if (!id) return;

        this.loanFacade.submitLoan(id).subscribe({
            next: () => {
                this.eventBus.emitLoanApplied(id);
                this.toast.show('Loan application submitted successfully!', 'success');
                // Reset state
                this.submittedLoanId.set(null);
                this.documentUploadService.resetStatuses();
                this.applyForm.reset({ loanAmount: 5000000, tenor: 12 });
            },
            error: (err) => console.error(err)
        });
    }

    onCancel() {
        const id = this.submittedLoanId();
        if (!id) return;

        if (!confirm('Are you sure you want to cancel this application?')) return;

        // Facade handles loading state
        this.loanFacade.cancelLoan(id, 'Cancelled by user during application').subscribe({
            next: () => {
                // this.toast.show('Application cancelled.', 'info'); // Facade handles toast
                this.submittedLoanId.set(null);
                this.documentUploadService.resetStatuses();
            },
            error: (err) => {
                console.error(err);
            }
        });
    }
}
