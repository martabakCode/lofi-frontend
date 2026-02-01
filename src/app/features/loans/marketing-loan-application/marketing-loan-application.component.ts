import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanService, MarketingLoanApplicationRequest } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentUploadService } from '../../../core/services/document-upload.service';
import { ProductFacade } from '../../products/facades/product.facade';
import { LeafletMapComponent, MapLocation } from '../../../shared/components/leaflet-map/leaflet-map.component';

/**
 * Marketing Loan Application Component
 * 
 * Refactored to use DocumentUploadService and DocumentUploadComponent
 * for document upload functionality, eliminating code duplication
 * with LoanApplicationComponent.
 */
@Component({
    selector: 'app-marketing-loan-application',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LeafletMapComponent],
    templateUrl: './marketing-loan-application.component.html'
})
export class MarketingLoanApplicationComponent implements OnInit {
    private fb = inject(FormBuilder);
    private loanService = inject(LoanService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private productFacade = inject(ProductFacade);
    private documentUploadService = inject(DocumentUploadService);

    products = this.productFacade.products;
    loading = signal(false);
    submittedLoanId = signal<string | null>(null);
    showLocationMap = signal(false);

    // Default Jakarta location
    defaultLocation: MapLocation = {
        latitude: -6.2088,
        longitude: 106.8456
    };

    // Document types for upload
    readonly documentTypes = ['KTP', 'KK', 'NPWP', 'SLIP_GAJI'] as const;

    // Expose document upload status signals for template
    ktpStatus = this.documentUploadService.ktpStatus;
    kkStatus = this.documentUploadService.kkStatus;
    npwpStatus = this.documentUploadService.npwpStatus;
    slipGajiStatus = this.documentUploadService.slipGajiStatus;

    // Computed property from service
    allDocumentsUploaded = this.documentUploadService.allMarketingDocumentsUploaded;

    filteredProducts = computed(() => {
        return this.products().filter(p => p.isActive !== false);
    });

    applyForm = this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        // username: automatically generated from email/name
        phoneNumber: ['', Validators.required],
        // branchId: default hardcoded

        incomeSource: ['', Validators.required],
        incomeType: ['', Validators.required],
        monthlyIncome: [0, [Validators.required, Validators.min(0)]],

        // age: calculated from DOB
        nik: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
        dateOfBirth: ['', Validators.required],
        placeOfBirth: ['', Validators.required],

        gender: ['MALE', Validators.required],
        maritalStatus: ['SINGLE', Validators.required],
        education: ['', Validators.required],
        occupation: ['', Validators.required],

        // Address
        address: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        district: ['', Validators.required],
        subDistrict: ['', Validators.required],
        postalCode: ['', Validators.required],

        // Loan
        productId: ['', Validators.required],
        loanAmount: [0, [Validators.required, Validators.min(100000)]],
        tenor: [0, [Validators.required, Validators.min(1)]],

        // Location
        longitude: [null as number | null],
        latitude: [null as number | null]
    });

    ngOnInit() {
        this.productFacade.loadProducts();
    }

    onApply() {
        if (this.applyForm.invalid) {
            this.toast.show('Please fill all required fields correctly', 'error');
            this.applyForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        const formValue = this.applyForm.getRawValue();

        const dob = new Date(formValue.dateOfBirth!);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 18) {
            this.toast.show('Customer must be at least 18 years old', 'error');
            this.loading.set(false);
            return;
        }

        const username = formValue.email!.split('@')[0] + Math.floor(Math.random() * 1000);
        // Default branch ID for marketing applications
        const branchId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

        const request: MarketingLoanApplicationRequest = {
            fullName: formValue.fullName!,
            email: formValue.email!,
            username: username,
            phoneNumber: formValue.phoneNumber!,
            branchId: branchId,
            incomeSource: formValue.incomeSource!,
            incomeType: formValue.incomeType!,
            monthlyIncome: Number(formValue.monthlyIncome),
            age: age,
            nik: formValue.nik!,
            dateOfBirth: formValue.dateOfBirth!,
            placeOfBirth: formValue.placeOfBirth!,
            city: formValue.city!,
            address: formValue.address!,
            province: formValue.province!,
            district: formValue.district!,
            subDistrict: formValue.subDistrict!,
            postalCode: formValue.postalCode!,
            gender: formValue.gender!,
            maritalStatus: formValue.maritalStatus!,
            education: formValue.education!,
            occupation: formValue.occupation!,
            productId: formValue.productId!,
            loanAmount: Number(formValue.loanAmount),
            tenor: Number(formValue.tenor),
            longitude: formValue.longitude || undefined,
            latitude: formValue.latitude || undefined
        };

        this.loanService.applyLoanOnBehalf(request).subscribe({
            next: (resp) => {
                this.loading.set(false);
                this.submittedLoanId.set(resp.id);
                this.toast.show('Loan application initialized! Please upload documents.', 'success');
            },
            error: (err) => {
                this.loading.set(false);
                this.toast.show(err.error?.message || 'Application failed', 'error');
            }
        });
    }

    onLocationChange(location: MapLocation) {
        this.applyForm.patchValue({
            latitude: location.latitude,
            longitude: location.longitude
        });
    }

    getCurrentLocation(): MapLocation {
        const lat = this.applyForm.get('latitude')?.value;
        const lng = this.applyForm.get('longitude')?.value;
        if (lat && lng) {
            return { latitude: lat, longitude: lng };
        }
        return this.defaultLocation;
    }

    hasLocation(): boolean {
        const lat = this.applyForm.get('latitude')?.value;
        const lng = this.applyForm.get('longitude')?.value;
        return !!(lat && lng);
    }

    toggleLocationMap() {
        this.showLocationMap.set(!this.showLocationMap());
    }

    locateApplicant() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.applyForm.patchValue({
                        latitude: latitude,
                        longitude: longitude
                    });
                    this.showLocationMap.set(true);
                    this.toast.show('Location captured successfully', 'success');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.toast.show('Failed to get location. Please enable location services.', 'error');
                }
            );
        } else {
            this.toast.show('Geolocation is not supported by your browser', 'error');
        }
    }

    /**
     * Legacy method for direct file selection (kept for backward compatibility)
     * Now delegates to DocumentUploadService
     */
    onFileSelected(event: Event, type: string) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const loanId = this.submittedLoanId();
        if (!loanId) return;

        this.documentUploadService.uploadDocument(loanId, file, type);
    }

    finish() {
        if (!this.allDocumentsUploaded()) {
            this.toast.show('Please upload all required documents before finishing', 'error');
            return;
        }
        this.toast.show('Application Process Completed!', 'success');
        this.router.navigate(['/loans', this.submittedLoanId()]);
    }
}
