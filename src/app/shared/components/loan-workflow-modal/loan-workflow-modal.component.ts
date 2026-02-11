import { Component, EventEmitter, Input, Output, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityTimelineComponent, TimelineItem } from '../apple-hig/activity-timeline/activity-timeline.component';
import { LeafletMapComponent, MapLocation } from '../leaflet-map/leaflet-map.component';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoanDocument } from '../../../features/loans/models/loan.models';

export interface LoanWorkflowStep {
    step: 'SUBMITTED' | 'REVIEW' | 'APPROVAL' | 'DISBURSE';
    status: 'completed' | 'current' | 'pending';
    timestamp?: string;
    userName?: string;
    notes?: string;
}

export interface LoanDetailInfo {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    productName: string;
    amount: number;
    tenor: number;
    interestRate?: number;
    adminFee?: number;
    purpose?: string;
    status: string;
    currentStage: string;
    bankName?: string;
    bankBranch?: string;
    accountNumber?: string;
    accountHolderName?: string;
    disbursementReference?: string;
    submittedAt?: string;
    reviewedAt?: string;
    approvedAt?: string;
    disbursedAt?: string;
    appliedDate?: string;
    // Location data
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    province?: string;
    // Documents
    documents?: LoanDocument[];
}

@Component({
    selector: 'app-loan-workflow-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ActivityTimelineComponent, LeafletMapComponent],
    templateUrl: './loan-workflow-modal.component.html',
    styleUrls: ['./loan-workflow-modal.component.css']
})
export class LoanWorkflowModalComponent {
    private documentService = inject(DocumentService);
    private toastService = inject(ToastService);

    @Input() set isOpen(value: boolean) {
        this._isOpen.set(value);
    }
    @Input() loanDetail: LoanDetailInfo | null = null;
    @Input() workflowSteps: LoanWorkflowStep[] = [];
    @Input() availableActions: string[] = [];

    @Output() onAction = new EventEmitter<{ type: string; notes?: string }>();
    @Output() onClose = new EventEmitter<void>();
    @Output() onViewFullPage = new EventEmitter<string>();

    private _isOpen = signal(false);
    isOpenValue = computed(() => this._isOpen());
    
    downloadingDocId = signal<string | null>(null);

    actionNotes = '';
    activeAction = signal<string | null>(null);

    // Step definitions
    readonly steps = [
        { key: 'SUBMITTED', label: 'Submitted', icon: 'pi pi-send' },
        { key: 'REVIEW', label: 'Review', icon: 'pi pi-search' },
        { key: 'APPROVAL', label: 'Approval', icon: 'pi pi-check-circle' },
        { key: 'DISBURSE', label: 'Disburse', icon: 'pi pi-wallet' }
    ] as const;

    getStepStatus(stepKey: string): 'completed' | 'current' | 'pending' {
        const step = this.workflowSteps.find(s => s.step === stepKey);
        return step?.status || 'pending';
    }

    getStepInfo(stepKey: string): LoanWorkflowStep | undefined {
        return this.workflowSteps.find(s => s.step === stepKey);
    }

    canPerformAction(action: string): boolean {
        return this.availableActions.includes(action);
    }

    startAction(type: string): void {
        this.activeAction.set(type);
        this.actionNotes = '';
    }

    executeAction(): void {
        if (this.activeAction()) {
            this.onAction.emit({
                type: this.activeAction()!,
                notes: this.actionNotes || undefined
            });
            this.cancelAction();
        }
    }

    cancelAction(): void {
        this.activeAction.set(null);
        this.actionNotes = '';
    }

    close(): void {
        this.cancelAction();
        this.onClose.emit();
    }

    viewFullPage(): void {
        if (this.loanDetail) {
            this.onViewFullPage.emit(this.loanDetail.id);
        }
    }

    getActionLabel(action: string): string {
        const labels: Record<string, string> = {
            'REVIEW': 'Review Loan',
            'APPROVE': 'Approve Loan',
            'DISBURSE': 'Disburse Loan'
        };
        return labels[action] || action;
    }

    isActionRequired(): boolean {
        // Notes are required for APPROVE and DISBURSE, optional for REVIEW
        return ['APPROVE', 'DISBURSE'].includes(this.activeAction() || '');
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    hasLocation(): boolean {
        return !!(this.loanDetail?.latitude && this.loanDetail?.longitude);
    }

    getMapLocation(): MapLocation | null {
        if (this.hasLocation()) {
            return {
                latitude: this.loanDetail!.latitude!,
                longitude: this.loanDetail!.longitude!
            };
        }
        return null;
    }

    viewLocationOnMap(): void {
        if (this.hasLocation()) {
            const { latitude, longitude } = this.loanDetail!;
            // Google Maps direct link
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(url, '_blank');
        }
    }

    // Document methods
    hasDocuments(): boolean {
        return !!(this.loanDetail?.documents && this.loanDetail.documents.length > 0);
    }

    getDocumentIcon(documentType: string): string {
        const type = documentType.toUpperCase();
        if (type.includes('PDF')) return 'pi-file-pdf';
        if (type.includes('IMAGE') || type.includes('PHOTO')) return 'pi-image';
        if (type.includes('KTP') || type.includes('ID')) return 'pi-id-card';
        if (type.includes('KK')) return 'pi-users';
        if (type.includes('SLIP') || type.includes('PAYROLL')) return 'pi-money-bill';
        if (type.includes('NPWP')) return 'pi-briefcase';
        return 'pi-file';
    }

    getDocumentIconColor(documentType: string): string {
        const type = documentType.toUpperCase();
        if (type.includes('PDF')) return 'text-red-500';
        if (type.includes('IMAGE') || type.includes('PHOTO')) return 'text-blue-500';
        if (type.includes('KTP') || type.includes('ID')) return 'text-green-500';
        return 'text-gray-500';
    }

    formatDocType(type: string): string {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    downloadDocument(doc: LoanDocument): void {
        this.downloadingDocId.set(doc.id);
        this.documentService.getDownloadUrl(doc.id).subscribe({
            next: (data) => {
                // Open download URL in new tab
                window.open(data.downloadUrl, '_blank');
                this.downloadingDocId.set(null);
            },
            error: () => {
                this.toastService.show('Failed to get download link', 'error');
                this.downloadingDocId.set(null);
            }
        });
    }

    getTimelineItems(): TimelineItem[] {
        const items: TimelineItem[] = [];

        const submitted = this.getStepInfo('SUBMITTED');
        if (submitted && submitted.status === 'completed') {
            items.push({
                type: 'success',
                icon: 'pi pi-send',
                title: 'Loan Submitted',
                description: submitted.notes || 'Application received',
                user: submitted.userName,
                timestamp: new Date(submitted.timestamp!)
            });
        }

        const reviewed = this.getStepInfo('REVIEW');
        if (reviewed && reviewed.status === 'completed') {
            items.push({
                type: 'primary',
                icon: 'pi pi-search',
                title: 'Loan Reviewed',
                description: reviewed.notes || 'Review completed',
                user: reviewed.userName,
                timestamp: new Date(reviewed.timestamp!)
            });
        }

        const approved = this.getStepInfo('APPROVAL');
        if (approved && approved.status === 'completed') {
            items.push({
                type: 'success',
                icon: 'pi pi-check-circle',
                title: 'Loan Approved',
                description: approved.notes || 'Approval granted',
                user: approved.userName,
                timestamp: new Date(approved.timestamp!)
            });
        }

        const disbursed = this.getStepInfo('DISBURSE');
        if (disbursed && disbursed.status === 'completed') {
            items.push({
                type: 'info',
                icon: 'pi pi-wallet',
                title: 'Loan Disbursed',
                description: disbursed.notes || 'Funds released',
                user: disbursed.userName,
                timestamp: new Date(disbursed.timestamp!)
            });
        }

        return items;
    }
}
