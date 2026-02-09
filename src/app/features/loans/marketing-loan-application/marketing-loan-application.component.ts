import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoanService, MarketingLoanApplicationRequest } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentUploadService } from '../../../core/services/document-upload.service';
import { LocationService, Province, Regency, District, Village } from '../../../core/services/location.service';
import { ProductFacade } from '../../products/facades/product.facade';
import { LeafletMapComponent, MapLocation } from '../../../shared/components/leaflet-map/leaflet-map.component';
import { RbacService } from '../../../core/services/rbac.service';
import { AuthService } from '../../../core/services/auth.service';

// Select options constants
const EDUCATION_OPTIONS = [
    { value: 'SD', label: 'SD (Sekolah Dasar)' },
    { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
    { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' },
    { value: 'D1', label: 'D1 (Diploma 1)' },
    { value: 'D2', label: 'D2 (Diploma 2)' },
    { value: 'D3', label: 'D3 (Diploma 3)' },
    { value: 'S1', label: 'S1 (Sarjana)' },
    { value: 'S2', label: 'S2 (Magister)' },
    { value: 'S3', label: 'S3 (Doktor)' }
] as const;

const OCCUPATION_OPTIONS = [
    { value: 'KARYAWAN', label: 'Karyawan Swasta' },
    { value: 'WIRASWASTA', label: 'Wiraswasta' },
    { value: 'PNS', label: 'Pegawai Negeri Sipil (PNS)' },
    { value: 'TNI_POLRI', label: 'TNI / POLRI' },
    { value: 'PENSIUNAN', label: 'Pensiunan' },
    { value: 'IBU_RUMAH_TANGGA', label: 'Ibu Rumah Tangga' },
    { value: 'PELAJAR_MAHASISWA', label: 'Pelajar / Mahasiswa' },
    { value: 'PROFESIONAL', label: 'Profesional (Dokter, Pengacara, dll)' },
    { value: 'LAINNYA', label: 'Lainnya' }
] as const;

const INCOME_SOURCE_OPTIONS = [
    { value: 'GAJI', label: 'Gaji / Upah' },
    { value: 'USAHA', label: 'Hasil Usaha' },
    { value: 'INVESTASI', label: 'Hasil Investasi' },
    { value: 'LAINNYA', label: 'Lainnya' }
] as const;

const INCOME_TYPE_OPTIONS = [
    { value: 'BULANAN', label: 'Bulanan' },
    { value: 'MINGGUAN', label: 'Mingguan' },
    { value: 'HARIAN', label: 'Harian' },
    { value: 'PROYEK', label: 'Per Proyek' }
] as const;

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
    private locationService = inject(LocationService);
    private authService = inject(AuthService);

    products = this.productFacade.products;
    loading = signal(false);
    submittedLoanId = signal<string | null>(null);
    showLocationMap = signal(false);
    showTncModal = signal(false);
    tncAccepted = signal(false);

    // Document preview
    documentPreviews = signal<Map<string, string>>(new Map());

    // Default Jakarta location
    defaultLocation: MapLocation = {
        latitude: -6.2088,
        longitude: 106.8456
    };

    // Select options
    readonly educationOptions = EDUCATION_OPTIONS;
    readonly occupationOptions = OCCUPATION_OPTIONS;
    readonly incomeSourceOptions = INCOME_SOURCE_OPTIONS;
    readonly incomeTypeOptions = INCOME_TYPE_OPTIONS;

    // Location data
    provinces = signal<Province[]>([]);
    regencies = signal<Regency[]>([]);
    districts = signal<District[]>([]);
    villages = signal<Village[]>([]);
    loadingLocation = signal(false);

    // Document types for upload
    readonly documentTypes = ['KTP', 'SELFIE_KTP', 'NPWP', 'PAYSLIP'] as const;

    // Expose document upload status signals for template
    ktpStatus = this.documentUploadService.ktpStatus;
    selfieKtpStatus = this.documentUploadService.selfieKtpStatus;
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
        phoneNumber: ['', Validators.required],
        branchId: [''],

        incomeSource: ['', Validators.required],
        incomeType: ['', Validators.required],
        monthlyIncome: [0, [Validators.required, Validators.min(0)]],

        nik: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
        dateOfBirth: ['', Validators.required],
        placeOfBirth: ['', Validators.required],

        gender: ['MALE', Validators.required],
        maritalStatus: ['SINGLE', Validators.required],
        education: ['', Validators.required],
        occupation: ['', Validators.required],

        // Address
        address: ['', Validators.required],
        province: ['', Validators.required],
        city: ['', Validators.required],
        district: ['', Validators.required],
        subDistrict: ['', Validators.required],
        postalCode: ['', Validators.required],

        // Loan
        productId: ['', Validators.required],
        loanAmount: [0, [Validators.required, Validators.min(100000)]],
        tenor: [0, [Validators.required, Validators.min(1)]],
        purpose: ['', Validators.required],

        // Bank Account
        bankName: ['', Validators.required],
        bankBranch: [''],
        accountNumber: ['', Validators.required],
        accountHolderName: ['', Validators.required],

        // Location
        longitude: [null as number | null],
        latitude: [null as number | null]
    });

    ngOnInit() {
        this.productFacade.loadProducts();
        this.loadProvinces();

        // Watch for province changes to load regencies
        this.applyForm.get('province')?.valueChanges.subscribe((provinceId) => {
            if (provinceId) {
                this.loadRegencies(provinceId);
                this.applyForm.patchValue({ city: '', district: '', subDistrict: '' }, { emitEvent: false });
                this.districts.set([]);
                this.villages.set([]);
            }
        });

        // Watch for city/regency changes to load districts
        this.applyForm.get('city')?.valueChanges.subscribe((regencyId) => {
            if (regencyId) {
                this.loadDistricts(regencyId);
                this.applyForm.patchValue({ district: '', subDistrict: '' }, { emitEvent: false });
                this.villages.set([]);
            }
        });

        // Watch for district changes to load villages
        this.applyForm.get('district')?.valueChanges.subscribe((districtId) => {
            if (districtId) {
                this.loadVillages(districtId);
                this.applyForm.patchValue({ subDistrict: '' }, { emitEvent: false });
            }
        });
    }

    // Location loading methods
    private loadProvinces() {
        this.locationService.getProvinces().subscribe(provinces => {
            this.provinces.set(provinces);
        });
    }

    private loadRegencies(provinceId: string) {
        this.loadingLocation.set(true);
        this.locationService.getRegencies(provinceId).subscribe(regencies => {
            this.regencies.set(regencies);
            this.loadingLocation.set(false);
        });
    }

    private loadDistricts(regencyId: string) {
        this.loadingLocation.set(true);
        this.locationService.getDistricts(regencyId).subscribe(districts => {
            this.districts.set(districts);
            this.loadingLocation.set(false);
        });
    }

    private loadVillages(districtId: string) {
        this.loadingLocation.set(true);
        this.locationService.getVillages(districtId).subscribe(villages => {
            this.villages.set(villages);
            this.loadingLocation.set(false);
        });
    }

    // Initialize with auth service check
    constructor() {
        // Effect to watch for user load
        effect(() => {
            const user = this.authService.currentUser();
            if (user?.branchId) {
                this.applyForm.patchValue({ branchId: user.branchId });
            }
        });
    }

    currentBranchName = computed(() => {
        return this.authService.currentUser()?.branchName || 'No Branch Assigned';
    });

    // Get location names for display
    getSelectedProvinceName(): string {
        const provinceId = this.applyForm.get('province')?.value;
        const province = this.provinces().find(p => p.id === provinceId);
        return province?.name || '';
    }

    getSelectedRegencyName(): string {
        const regencyId = this.applyForm.get('city')?.value;
        const regency = this.regencies().find(r => r.id === regencyId);
        return regency?.name || '';
    }

    getSelectedDistrictName(): string {
        const districtId = this.applyForm.get('district')?.value;
        const district = this.districts().find(d => d.id === districtId);
        return district?.name || '';
    }

    getSelectedVillageName(): string {
        const villageId = this.applyForm.get('subDistrict')?.value;
        const village = this.villages().find(v => v.id === villageId);
        return village?.name || '';
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

        // Use selected branch from Auth
        let branchId = formValue.branchId;
        if (!branchId) {
            this.toast.show('No branch assigned to your account. Please contact admin.', 'error');
            this.loading.set(false);
            return;
        }

        const request: MarketingLoanApplicationRequest = {
            fullName: formValue.fullName!,
            email: formValue.email!,
            username: username,
            phoneNumber: formValue.phoneNumber!,
            branchId: branchId!,
            incomeSource: formValue.incomeSource!,
            incomeType: formValue.incomeType!,
            monthlyIncome: Number(formValue.monthlyIncome),
            nik: formValue.nik!,
            dateOfBirth: formValue.dateOfBirth!,
            placeOfBirth: formValue.placeOfBirth!,
            city: this.getSelectedRegencyName() || formValue.city!,
            address: formValue.address!,
            province: this.getSelectedProvinceName() || formValue.province!,
            district: this.getSelectedDistrictName() || formValue.district!,
            subDistrict: this.getSelectedVillageName() || formValue.subDistrict!,
            postalCode: formValue.postalCode!,
            gender: formValue.gender!,
            maritalStatus: formValue.maritalStatus!,
            // Note: education is not in backend DTO - only collect for display
            occupation: formValue.occupation!,
            productId: formValue.productId!,
            loanAmount: Number(formValue.loanAmount),
            tenor: Number(formValue.tenor),
            purpose: formValue.purpose!,
            bankName: formValue.bankName!,
            bankBranch: formValue.bankBranch || undefined,
            accountNumber: formValue.accountNumber!,
            accountHolderName: formValue.accountHolderName!
            // Note: longitude and latitude are not in backend DTO - removed
        };

        this.loanService.applyLoanOnBehalf(request).subscribe({
            next: (resp) => {
                this.loading.set(false);
                this.submittedLoanId.set(resp.id);
                this.toast.show('Loan application initialized! Please upload documents.', 'success');
                // Reset document statuses for new application
                this.documentUploadService.resetStatuses();
                this.documentPreviews.set(new Map());
                // Auto-submit the loan to move from DRAFT to SUBMITTED
                this.autoSubmitLoan(resp.id);
            },
            error: (err) => {
                this.loading.set(false);
                const errorMessage = err.error?.message || err.message || 'Application failed. Please try again.';
                this.toast.show(errorMessage, 'error');
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
     * Auto-submit loan after successful application creation
     */
    private autoSubmitLoan(loanId: string): void {
        this.loanService.submitLoan(loanId).subscribe({
            next: () => {
                console.log(`[MarketingLoanApplication] Loan ${loanId} auto-submitted successfully`);
            },
            error: (err) => {
                console.error(`[MarketingLoanApplication] Failed to auto-submit loan ${loanId}:`, err);
                // Don't show error toast here as the loan was created successfully
                // The user can still manually submit after uploading documents
            }
        });
    }

    /**
     * Handle file selection with preview
     */
    onFileSelected(event: Event, type: string) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const loanId = this.submittedLoanId();
        if (!loanId) return;

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previews = new Map(this.documentPreviews());
                previews.set(type, e.target?.result as string);
                this.documentPreviews.set(previews);
            };
            reader.readAsDataURL(file);
        }

        this.documentUploadService.uploadDocument(loanId, file, type);
    }

    /**
     * Get document preview URL
     */
    getDocumentPreview(type: string): string | undefined {
        return this.documentPreviews().get(type);
    }

    /**
     * Open TnC modal
     */
    openTncModal() {
        this.showTncModal.set(true);
    }

    /**
     * Close TnC modal
     */
    closeTncModal() {
        this.showTncModal.set(false);
    }

    /**
     * Accept TnC
     */
    acceptTnc() {
        this.tncAccepted.set(true);
        this.closeTncModal();
    }

    /**
     * Reject TnC
     */
    rejectTnc() {
        this.tncAccepted.set(false);
        this.closeTncModal();
    }

    /**
     * Check if can finish
     */
    canFinish(): boolean {
        return this.allDocumentsUploaded() && this.tncAccepted();
    }

    finish() {
        if (!this.allDocumentsUploaded()) {
            this.toast.show('Please upload all required documents before finishing', 'error');
            return;
        }
        if (!this.tncAccepted()) {
            this.toast.show('Please accept the Terms and Conditions', 'error');
            this.openTncModal();
            return;
        }
        this.toast.show('Application Process Completed!', 'success');
        this.router.navigate(['/dashboard/loans', this.submittedLoanId()]);
    }
}
