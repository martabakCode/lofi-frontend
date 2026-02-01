import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentUploadService, DocumentUploadStatus } from '../../../core/services/document-upload.service';

export interface DocumentConfig {
    type: string;
    label: string;
    required: boolean;
    icon?: string;
}

/**
 * Document Upload Component
 * 
 * Reusable component for document upload UI.
 * Works with DocumentUploadService for state management.
 * 
 * Usage:
 * <app-document-upload
 *   [loanId]="submittedLoanId()"
 *   [documents]="documentConfigs"
 *   (allUploaded)="onAllDocumentsUploaded($event)"
 *   (uploadComplete)="onDocumentUploadComplete($event)">
 * </app-document-upload>
 */
@Component({
    selector: 'app-document-upload',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="document-upload-container space-y-4">
      @for (doc of documents; track doc.type) {
        <div class="document-item border rounded-lg p-4 transition-all"
             [class.border-green-500]="getStatus(doc.type) === 'done'"
             [class.border-blue-500]="getStatus(doc.type) === 'uploading'"
             [class.border-red-500]="getStatus(doc.type) === 'error'"
             [class.border-gray-200]="getStatus(doc.type) === 'pending'">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ doc.icon || getDefaultIcon(doc.type) }}</span>
              <div>
                <h4 class="font-medium text-gray-900">{{ doc.label }}</h4>
                <p class="text-sm text-gray-500">
                  @switch (getStatus(doc.type)) {
                    @case ('pending') {
                      Waiting for upload {{ doc.required ? '(Required)' : '(Optional)' }}
                    }
                    @case ('uploading') {
                      Uploading...
                    }
                    @case ('done') {
                      Uploaded successfully
                    }
                    @case ('error') {
                      Upload failed - please try again
                    }
                  }
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              @switch (getStatus(doc.type)) {
                @case ('pending') {
                  <label class="cursor-pointer px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <span>Choose File</span>
                    <input 
                      type="file" 
                      class="hidden" 
                      [accept]="acceptedFileTypes"
                      (change)="onFileSelected($event, doc.type)"
                    />
                  </label>
                }
                @case ('uploading') {
                  <span class="animate-spin text-2xl">⏳</span>
                }
                @case ('done') {
                  <span class="text-green-600 text-2xl">✓</span>
                  <button 
                    class="text-sm text-gray-500 hover:text-gray-700 underline"
                    (click)="reupload(doc.type)">
                    Change
                  </button>
                }
                @case ('error') {
                  <label class="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <span>Retry</span>
                    <input 
                      type="file" 
                      class="hidden" 
                      [accept]="acceptedFileTypes"
                      (change)="onFileSelected($event, doc.type)"
                    />
                  </label>
                }
              }
            </div>
          </div>
        </div>
      }
      
      <!-- Overall Status -->
      @if (showOverallStatus) {
        <div class="mt-4 p-3 rounded-lg text-center"
             [class.bg-green-100]="allRequiredUploaded"
             [class.text-green-800]="allRequiredUploaded"
             [class.bg-yellow-100]="!allRequiredUploaded">
          @if (allRequiredUploaded) {
            <span class="font-medium">✓ All required documents uploaded</span>
          } @else {
            <span class="font-medium text-yellow-800">
              Please upload all required documents ({{ uploadedCount }}/{{ requiredCount }})
            </span>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
    .document-item {
      background: white;
    }
  `]
})
export class DocumentUploadComponent {
    private documentUploadService = inject(DocumentUploadService);

    @Input() loanId: string | null = null;
    @Input() documents: DocumentConfig[] = [];
    @Input() acceptedFileTypes = '.pdf,.jpg,.jpeg,.png';
    @Input() showOverallStatus = true;

    @Output() allUploaded = new EventEmitter<boolean>();
    @Output() uploadComplete = new EventEmitter<{ type: string; success: boolean }>();
    @Output() fileSelected = new EventEmitter<{ type: string; file: File }>();

    // Expose service signals for template access
    getStatus(type: string): DocumentUploadStatus {
        return this.documentUploadService.getStatus(type);
    }

    get allRequiredUploaded(): boolean {
        const requiredDocs = this.documents.filter(d => d.required);
        return requiredDocs.every(doc => this.getStatus(doc.type) === 'done');
    }

    get uploadedCount(): number {
        return this.documents.filter(doc => this.getStatus(doc.type) === 'done').length;
    }

    get requiredCount(): number {
        return this.documents.filter(d => d.required).length;
    }

    getDefaultIcon(type: string): string {
        switch (type.toUpperCase()) {
            case 'KTP': return '🆔';
            case 'KK': return '👨‍👩‍👧‍👦';
            case 'NPWP': return '📋';
            case 'SLIP_GAJI':
            case 'SLIPGAJI': return '💰';
            default: return '📄';
        }
    }

    onFileSelected(event: Event, type: string): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        this.fileSelected.emit({ type, file });

        if (!this.loanId) {
            console.error('Cannot upload: loanId is not set');
            return;
        }

        this.documentUploadService.uploadDocument(this.loanId, file, type, {
            onSuccess: () => {
                this.uploadComplete.emit({ type, success: true });
                this.checkAllUploaded();
            },
            onError: (err) => {
                this.uploadComplete.emit({ type, success: false });
            }
        });
    }

    reupload(type: string): void {
        const statusSignal = this.documentUploadService.getStatusSignal(type);
        if (statusSignal) {
            statusSignal.set('pending');
        }
    }

    private checkAllUploaded(): void {
        this.allUploaded.emit(this.allRequiredUploaded);
    }

    /**
     * Reset all document statuses
     */
    reset(): void {
        this.documentUploadService.resetStatuses();
    }
}
