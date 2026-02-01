import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanService, BackendLoanResponse } from '../../../core/services/loan.service';
import { DocumentService } from '../../../core/services/document.service';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeafletMapComponent } from '../../../shared/components/leaflet-map/leaflet-map.component';

// Adapter to match Loan interface for actions (Facade returns UI model, Service returns Backend DTO)
// We'll use the BackendDTO for Detail View as it has more fields (timestamps).
// We might need to map it to Loan Interface for LoanActionsComponent.

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LoanActionsComponent, LeafletMapComponent],
    templateUrl: './loan-detail.component.html',
    styleUrls: ['./loan-detail.component.css']
})
export class LoanDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private loanService = inject(LoanService);
    private documentService = inject(DocumentService);
    private toast = inject(ToastService);
    private router = inject(Router);

    loan = signal<BackendLoanResponse | null>(null);
    loading = signal(false);
    actionLoading = signal(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadLoan(id);
            }
        });
    }

    loadLoan(id?: string) {
        const loanId = id || this.loan()?.id;
        if (!loanId) return;

        this.loading.set(true);
        this.error.set(null);

        this.loanService.getLoanById(loanId).subscribe({
            next: (data) => {
                this.loan.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.error?.message || 'Failed to load loan details');
                // if 404
                if (err.status === 404) {
                    this.toast.show('Loan not found', 'error');
                    this.router.navigate(['/loans']);
                }
            }
        });
    }

    handleAction(e: { type: string, payload?: any }, id: string) {
        this.actionLoading.set(true);

        // SOURCE OF TRUTH: Refetch after action
        const refresh = () => {
            this.actionLoading.set(false);
            this.loadLoan(id);
        };

        const onError = (err: any) => {
            this.actionLoading.set(false);
            if (err.status === 409) {
                this.toast.show('Status has changed. Reloading...', 'warning');
                this.loadLoan(id);
            } else {
                this.toast.show(err.error?.message || 'Action failed', 'error');
            }
        };

        switch (e.type) {
            case 'SUBMIT':
                this.loanService.submitLoan(id).subscribe({ next: () => { this.toast.show('Submitted!', 'success'); refresh(); }, error: onError });
                break;
            case 'REVIEW':
                // Prompt for notes? For now simple default. Or add modal.
                const notes = prompt("Review Notes (Optional):") || "Reviewed by Marketing";
                this.loanService.reviewLoan(id, notes).subscribe({ next: () => { this.toast.show('Reviewed!', 'success'); refresh(); }, error: onError });
                break;
            case 'APPROVE':
                if (confirm("Are you sure you want to APPROVE this loan?")) {
                    this.loanService.approveLoan(id, "Approved").subscribe({ next: () => { this.toast.show('Approved!', 'success'); refresh(); }, error: onError });
                } else { this.actionLoading.set(false); }
                break;
            case 'REJECT':
                const reason = prompt("Enter Rejection Reason:") || "Rejected by Manager";
                this.loanService.rejectLoan(id, reason).subscribe({ next: () => { this.toast.show('Rejected!', 'info'); refresh(); }, error: onError });
                break;
            case 'DISBURSE':
                // Needs date/ref
                const ref = prompt("Enter Disbursement Reference:") || "REF-" + Date.now();
                this.loanService.disburseLoan(id, new Date().toISOString().split('T')[0], ref).subscribe({ next: () => { this.toast.show('Disbursed!', 'success'); refresh(); }, error: onError });
                break;
            case 'COMPLETE':
                this.loanService.completeLoan(id).subscribe({ next: () => { this.toast.show('Completed!', 'success'); refresh(); }, error: onError });
                break;
            case 'CANCEL':
                if (confirm("Cancel this loan?")) {
                    this.loanService.cancelLoan(id).subscribe({ next: () => { this.toast.show('Cancelled', 'info'); refresh(); }, error: onError });
                } else { this.actionLoading.set(false); }
                break;
            default:
                this.actionLoading.set(false);
        }
    }

    getStatusBadgeClass(status: string) {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
            case 'REVIEWED': return 'bg-blue-100 text-blue-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'DISBURSED': return 'bg-purple-100 text-purple-800';
            case 'COMPLETED': return 'bg-indigo-100 text-indigo-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    processedLoan(l: BackendLoanResponse): any {
        return {
            id: l.id,
            status: l.loanStatus,
            amount: l.loanAmount,
            // ... other fields if needed by actions
        };
    }

    viewDocument(id: string) {
        this.documentService.getDownloadUrl(id).subscribe({
            next: (data) => {
                window.open(data.downloadUrl, '_blank');
            },
            error: (err) => this.toast.show('Failed to open document', 'error')
        });
    }

    formatDocType(type: string): string {
        return type.replace('_', ' ');
    }

    viewLocationOnMap(loan: BackendLoanResponse) {
        if (loan.latitude && loan.longitude) {
            const url = `https://www.openstreetmap.org/?mlat=${loan.latitude}&mlon=${loan.longitude}#map=15/${loan.latitude}/${loan.longitude}`;
            window.open(url, '_blank');
        }
    }
}
