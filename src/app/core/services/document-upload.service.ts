import { Injectable, signal, computed, inject } from '@angular/core';
import { DocumentService } from './document.service';
import { ToastService } from './toast.service';

export type DocumentUploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface DocumentTypeConfig {
    type: string;
    label: string;
    required: boolean;
}

/**
 * Document Upload Service
 * 
 * Consolidates document upload logic that was duplicated across
 * LoanApplicationComponent and MarketingLoanApplicationComponent.
 * 
 * Usage:
 * - Inject the service in components that need document upload
 * - Call uploadDocument() for each document type
 * - Use status signals for UI binding
 * - Use allDocumentsUploaded computed property for validation
 */
@Injectable({
    providedIn: 'root'
})
export class DocumentUploadService {
    private documentService = inject(DocumentService);
    private toast = inject(ToastService);

    // Status signals for each document type
    ktpStatus = signal<DocumentUploadStatus>('pending');
    selfieKtpStatus = signal<DocumentUploadStatus>('pending');
    npwpStatus = signal<DocumentUploadStatus>('pending');
    slipGajiStatus = signal<DocumentUploadStatus>('pending');

    // Computed property to check if all required documents are uploaded
    allDocumentsUploaded = computed(() => {
        return this.ktpStatus() === 'done' &&
            this.selfieKtpStatus() === 'done' &&
            this.npwpStatus() === 'done';
    });

    // Marketing-specific: includes slip gaji
    allMarketingDocumentsUploaded = computed(() => {
        return this.allDocumentsUploaded() && this.slipGajiStatus() === 'done';
    });

    /**
     * Get the status signal for a specific document type
     */
    getStatusSignal(type: string) {
        switch (type.toUpperCase()) {
            case 'KTP': return this.ktpStatus;
            case 'SELFIE_KTP':
            case 'SELFIE KTP':
            case 'SELFIEKTP':
            case 'FOTO_DENGAN_KTP':
            case 'FOTO DENGAN KTP': return this.selfieKtpStatus;
            case 'NPWP': return this.npwpStatus;
            case 'PAYSLIP':
            case 'SLIPGAJI':
            case 'SLIP GAJI': return this.slipGajiStatus;
            default: return null;
        }
    }

    /**
     * Reset all document statuses to pending
     */
    resetStatuses() {
        this.ktpStatus.set('pending');
        this.selfieKtpStatus.set('pending');
        this.npwpStatus.set('pending');
        this.slipGajiStatus.set('pending');
    }

    /**
     * Upload a document with status tracking
     * @param loanId - The loan ID to associate with the document
     * @param file - The file to upload
     * @param type - The document type (KTP, KK, NPWP, PAYSLIP)
     * @param options - Optional callbacks for success/error
     */
    uploadDocument(
        loanId: string,
        file: File,
        type: string,
        options?: {
            onSuccess?: () => void;
            onError?: (error: any) => void;
            silent?: boolean;
        }
    ): void {
        console.log(`[DocumentUploadService] Starting upload for ${type}:`, {
            loanId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        const statusSignal = this.getStatusSignal(type);
        if (!statusSignal) {
            console.error(`[DocumentUploadService] Unknown document type: ${type}`);
            return;
        }

        statusSignal.set('uploading');

        // Map frontend document types to backend enum values
        const backendType = this.mapToBackendDocumentType(type);
        console.log(`[DocumentUploadService] Mapped ${type} to backend type: ${backendType}`);

        this.documentService.uploadDocument(loanId, file, backendType).subscribe({
            next: (response) => {
                console.log(`[DocumentUploadService] Upload successful for ${type}:`, response);
                statusSignal.set('done');
                if (!options?.silent) {
                    this.toast.show(`${type} uploaded successfully`, 'success');
                }
                options?.onSuccess?.();
            },
            error: (err) => {
                console.error(`[DocumentUploadService] Failed to upload ${type}:`, err);
                console.error(`[DocumentUploadService] Error details:`, {
                    status: err.status,
                    statusText: err.statusText,
                    url: err.url,
                    error: err.error,
                    message: err.message
                });
                statusSignal.set('error');
                if (!options?.silent) {
                    this.toast.show(`Failed to upload ${type}`, 'error');
                }
                options?.onError?.(err);
            }
        });
    }

    /**
     * Check if a specific document type is uploaded
     */
    isDocumentUploaded(type: string): boolean {
        const statusSignal = this.getStatusSignal(type);
        return statusSignal ? statusSignal() === 'done' : false;
    }

    /**
     * Get the current status of a document type
     */
    getStatus(type: string): DocumentUploadStatus {
        const statusSignal = this.getStatusSignal(type);
        return statusSignal ? statusSignal() : 'pending';
    }

    /**
     * Map frontend document type to backend DocumentType enum value
     * Backend enum: KK, KTP, PAYSLIP, PROOFOFRESIDENCE, BANK_STATEMENT, OTHER, PROFILE_PICTURE, NPWP
     */
    private mapToBackendDocumentType(frontendType: string): string {
        const type = frontendType.toUpperCase();
        switch (type) {
            case 'KTP':
                return 'KTP';
            case 'SELFIE_KTP':
            case 'SELFIE KTP':
            case 'SELFIEKTP':
            case 'FOTO_DENGAN_KTP':
            case 'FOTO DENGAN KTP':
                return 'OTHER'; // Selfie KTP maps to OTHER
            case 'NPWP':
                return 'NPWP';
            case 'PAYSLIP':
            case 'SLIPGAJI':
            case 'SLIP GAJI':
            case 'SLIP_GAJI':
                return 'PAYSLIP';
            case 'KK':
                return 'KK';
            case 'PROFILE_PICTURE':
            case 'PROFILE PICTURE':
            case 'PROFILEPICTURE':
                return 'PROFILE_PICTURE';
            case 'PROOF_OF_RESIDENCE':
            case 'PROOF OF RESIDENCE':
            case 'PROOFOFRESIDENCE':
                return 'PROOFOFRESIDENCE';
            case 'BANK_STATEMENT':
            case 'BANK STATEMENT':
            case 'BANKSTATEMENT':
                return 'BANK_STATEMENT';
            default:
                return 'OTHER';
        }
    }
}
