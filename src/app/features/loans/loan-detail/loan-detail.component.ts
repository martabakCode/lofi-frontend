import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanVM } from '../models/loan.models';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status/status-badge.component';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageHeaderComponent,
        CardComponent,
        StatusBadgeComponent,
        LoanActionsComponent
    ],
    templateUrl: './loan-detail.component.html',
    styleUrls: ['./loan-detail.component.css']
})
export class LoanDetailComponent implements OnInit {
    private loanFacade = inject(LoanFacade);
    private toastService = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private documentService = inject(DocumentService);
    private authService = inject(AuthService);

    // State
    loan = signal<LoanVM | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);
    actionLoading = signal(false);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadLoan(id);
            }
        });
    }

    loadLoan(id: string) {
        this.loading.set(true);
        this.error.set(null);

        this.loanFacade.getLoan(id).subscribe({
            next: (loan) => {
                this.loan.set(loan);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message || 'Failed to load loan details');
                this.loading.set(false);
                this.toastService.show('Failed to load loan details', 'error');
            }
        });
    }

    goBack() {
        this.router.navigate(['/dashboard/loans']);
    }

    handleAction(event: { type: string; payload?: any }) {
        const loan = this.loan();
        if (!loan) return;

        const loanId = loan.id;
        this.actionLoading.set(true);

        const refresh = () => {
            this.actionLoading.set(false);
            this.loadLoan(loanId);
        };

        const onError = (err: any) => {
            this.actionLoading.set(false);
            if (err.status === 409) {
                this.toastService.show('Status has changed. Reloading...', 'warning');
                this.loadLoan(loanId);
            } else {
                this.toastService.show(err.error?.message || 'Action failed', 'error');
            }
        };

        switch (event.type) {
            case 'SUBMIT':
                this.loanFacade.submitLoan(loanId).subscribe({ next: refresh, error: onError });
                break;
            case 'REVIEW':
                const notes = event.payload?.notes || 'Reviewed';
                this.loanFacade.reviewLoan(loanId, notes).subscribe({ next: refresh, error: onError });
                break;
            case 'APPROVE':
                this.loanFacade.approveLoan(loanId, 'Approved').subscribe({ next: refresh, error: onError });
                break;
            case 'REJECT':
                const reason = event.payload?.reason || 'Rejected';
                this.loanFacade.rejectLoan(loanId, reason).subscribe({ next: refresh, error: onError });
                break;
            case 'DISBURSE':
                const ref = event.payload?.reference || 'REF-' + Date.now();
                const date = event.payload?.date || new Date().toISOString().split('T')[0];
                this.loanFacade.disburseLoan(loanId, date, ref).subscribe({ next: refresh, error: onError });
                break;
            case 'COMPLETE':
                this.loanFacade.completeLoan(loanId).subscribe({ next: refresh, error: onError });
                break;
            case 'CANCEL':
                this.loanFacade.cancelLoan(loanId).subscribe({ next: refresh, error: onError });
                break;
            default:
                this.actionLoading.set(false);
        }
    }

    viewDocument(id: string) {
        this.documentService.getDownloadUrl(id).subscribe({
            next: (data) => window.open(data.downloadUrl, '_blank'),
            error: () => this.toastService.show('Failed to open document', 'error')
        });
    }

    formatDocType(type: string): string {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    viewLocationOnMap() {
        const loan = this.loan();
        if (loan?.latitude && loan?.longitude) {
            const url = `https://www.openstreetmap.org/?mlat=${loan.latitude}&mlon=${loan.longitude}#map=15/${loan.latitude}/${loan.longitude}`;
            window.open(url, '_blank');
        }
    }

    processedLoan(): any {
        const loan = this.loan();
        return loan ? {
            id: loan.id,
            status: loan.status,
            amount: loan.amount
        } : null;
    }
}
