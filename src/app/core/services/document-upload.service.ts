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
    kkStatus = signal<DocumentUploadStatus>('pending');
    npwpStatus = signal<DocumentUploadStatus>('pending');
    slipGajiStatus = signal<DocumentUploadStatus>('pending');

    // Computed property to check if all required documents are uploaded
    allDocumentsUploaded = computed(() => {
        return this.ktpStatus() === 'done' &&
            this.kkStatus() === 'done' &&
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
            case 'KK': return this.kkStatus;
            case 'NPWP': return this.npwpStatus;
            case 'SLIP_GAJI':
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
        this.kkStatus.set('pending');
        this.npwpStatus.set('pending');
        this.slipGajiStatus.set('pending');
    }

    /**
     * Upload a document with status tracking
     * @param loanId - The loan ID to associate with the document
     * @param file - The file to upload
     * @param type - The document type (KTP, KK, NPWP, SLIP_GAJI)
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
        const statusSignal = this.getStatusSignal(type);
        if (!statusSignal) {
            console.error(`Unknown document type: ${type}`);
            return;
        }

        statusSignal.set('uploading');

        this.documentService.uploadDocument(loanId, file, type).subscribe({
            next: () => {
                statusSignal.set('done');
                if (!options?.silent) {
                    this.toast.show(`${type} uploaded successfully`, 'success');
                }
                options?.onSuccess?.();
            },
            error: (err) => {
                statusSignal.set('error');
                console.error(`Failed to upload ${type}:`, err);
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
}
