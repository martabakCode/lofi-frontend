import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentService } from '../../../core/services/document.service';
import { ProductFacade } from '../../products/facades/product.facade';
import { LoanRequestBuilder } from '../../../core/patterns/loan-request.builder';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';

@Component({
    selector: 'app-loan-application',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './loan-application.component.html',
    styleUrls: ['./loan-application.component.css']
})
export class LoanApplicationComponent implements OnInit {
    private fb = inject(FormBuilder);
    // private loanFacade = inject(LoanFacade); // Using Service directly might be easier if Facade is incomplete, but Facade has applyLoan/submitLoan. I'll stick to Facade for consistency if possible, or extend Facade. OR used Service for missing methods.
    // Facade didn't have cancel. I'll use LoanService for cancel or validly use Facade updates.
    // Let's inject LoanService for cancel to avoid editing Facade excessively if not needed, or better, edit Facade.
    // I'll edit Facade in a previous step? No, I skipped editing Facade. I'll inject LoanService directly for cancel.
    private loanService = inject(LoanService); // Inject Service for cancel
    private loanFacade = inject(LoanFacade);
    private productFacade = inject(ProductFacade);
    private eventBus = inject(LoanEventBus);
    private router = inject(Router);
    private toast = inject(ToastService);
    private documentService = inject(DocumentService);


    products = this.productFacade.products;
    loading = this.loanFacade.loading;
    submittedLoanId = signal<string | null>(null);

    // Document Upload States
    ktpStatus = signal<'pending' | 'uploading' | 'done'>('pending');
    kkStatus = signal<'pending' | 'uploading' | 'done'>('pending');
    npwpStatus = signal<'pending' | 'uploading' | 'done'>('pending');


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

        // Listen to form value changes to trigger validation toasts if needed,
        // but typically per UX rules, we show specific errors on submit or change.
        // I will rely on onApply for validation toasts as per "Example: this.toast.error".

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

    onFileSelected(event: Event, type: 'KTP' | 'KK' | 'NPWP') {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        const loanId = this.submittedLoanId();
        if (!loanId) return;

        // Update status
        if (type === 'KTP') this.ktpStatus.set('uploading');
        if (type === 'KK') this.kkStatus.set('uploading');
        if (type === 'NPWP') this.npwpStatus.set('uploading');

        this.documentService.uploadDocument(loanId, file, type).subscribe({
            next: () => {
                this.toast.show(`${type} uploaded successfully`, 'success');
                if (type === 'KTP') this.ktpStatus.set('done');
                if (type === 'KK') this.kkStatus.set('done');
                if (type === 'NPWP') this.npwpStatus.set('done');
            },
            error: (err) => {
                console.error(err);
                this.toast.show(`Failed to upload ${type}`, 'error');
                if (type === 'KTP') this.ktpStatus.set('pending');
                if (type === 'KK') this.kkStatus.set('pending');
                if (type === 'NPWP') this.npwpStatus.set('pending');
            }
        });
    }

    get allDocumentsUploaded() {
        return this.ktpStatus() === 'done' && this.kkStatus() === 'done' && this.npwpStatus() === 'done';
    }

    onSubmitFinal() {
        if (!this.allDocumentsUploaded) {
            this.toast.show('Please upload all required documents (KTP, KK, NPWP)', 'error');
            return;
        }

        const id = this.submittedLoanId();
        if (!id) return;

        this.loanFacade.submitLoan(id).subscribe({
            next: () => {
                this.eventBus.emitLoanApplied(id);
                this.toast.show('Loan application submitted successfully!', 'success');
                // Redirect to list or dashboard? Prompt doesn't specify Customer List route, mostly just "Apply".
                // Assuming customer can see list.
                // For now stay or refresh.
                this.submittedLoanId.set(null);
                this.applyForm.reset({ loanAmount: 5000000, tenor: 12 });
            },
            error: (err) => console.error(err)
        });
    }

    onCancel() {
        const id = this.submittedLoanId();
        if (!id) return;

        if (!confirm('Are you sure you want to cancel this application?')) return;

        this.loading.set(true);
        this.loanService.cancelLoan(id, 'Cancelled by user during application').subscribe({
            next: () => {
                this.toast.show('Application cancelled.', 'info');
                this.submittedLoanId.set(null);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                console.error(err);
            }
        });
    }
}
