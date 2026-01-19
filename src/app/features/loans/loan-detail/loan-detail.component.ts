import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanService, BackendLoanResponse } from '../../../core/services/loan.service';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

// Adapter to match Loan interface for actions (Facade returns UI model, Service returns Backend DTO)
// We'll use the BackendDTO for Detail View as it has more fields (timestamps).
// We might need to map it to Loan Interface for LoanActionsComponent.

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LoanActionsComponent],
    template: `
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm text-gray-500">
        <a routerLink="/loans" class="hover:text-primary-600">Loans</a>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ loan()?.id || '...' }}</span>
      </nav>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error / Not Found -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {{ error() }}
        <button (click)="loadLoan()" class="underline ml-2">Retry</button>
      </div>

      <div *ngIf="!loading() && loan(); let l" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- LEFT COL: STATUS & TIMELINE -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Status Card -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Current Status</h3>
            <div class="flex items-center justify-between">
              <span [class]="getStatusBadgeClass(l.loanStatus)" class="px-3 py-1 text-sm font-bold rounded-full">
                {{ l.loanStatus }}
              </span>
              <span class="text-xs text-gray-400">
                {{ l.updatedAt | date:'medium' }}
              </span>
            </div>
            
            <div class="mt-6">
                <!-- Status Timeline (Approximated from timestamps) -->
                <div class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                    <div class="mb-6 ml-6">
                        <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                             <i class="fas fa-file-alt text-blue-600 text-xs"></i>
                        </span>
                        <h3 class="font-medium text-gray-900 dark:text-white">Applied</h3>
                        <p class="text-sm text-gray-500">{{ (l.submittedAt | date:'medium') || 'Pending' }}</p>
                    </div>
                     <div class="mb-6 ml-6" *ngIf="l.approvedAt">
                        <span class="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                             <i class="fas fa-check text-green-600 text-xs"></i>
                        </span>
                        <h3 class="font-medium text-gray-900 dark:text-white">Approved</h3>
                        <p class="text-sm text-gray-500">{{ l.approvedAt | date:'medium' }}</p>
                    </div>
                     <div class="mb-6 ml-6" *ngIf="l.disbursedAt">
                        <span class="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                             <i class="fas fa-money-bill text-purple-600 text-xs"></i>
                        </span>
                        <h3 class="font-medium text-gray-900 dark:text-white">Disbursed</h3>
                        <p class="text-sm text-gray-500">{{ l.disbursedAt | date:'medium' }}</p>
                    </div>
                     <div class="mb-6 ml-6" *ngIf="l.rejectedAt">
                        <span class="absolute flex items-center justify-center w-6 h-6 bg-red-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                             <i class="fas fa-times text-red-600 text-xs"></i>
                        </span>
                        <h3 class="font-medium text-gray-900 dark:text-white">Rejected</h3>
                        <p class="text-sm text-gray-500">{{ l.rejectedAt | date:'medium' }}</p>
                    </div>
                </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
             <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-4">Actions</h3>
             <app-loan-actions 
                [loan]="processedLoan(l)" 
                [loading]="actionLoading()"
                (action)="handleAction($event, l.id)">
             </app-loan-actions>
          </div>
        </div>

        <!-- RIGHT COL: DETAILS -->
        <div class="lg:col-span-2 space-y-6">
             <!-- Summary -->
             <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Loan Details</h2>
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <p class="text-sm text-gray-500">Applicant</p>
                        <p class="font-medium">{{ l.customerName }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Product</p>
                        <p class="font-medium">{{ l.product.productName }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Amount</p>
                        <p class="font-medium text-lg">{{ l.loanAmount | currency:'IDR':'symbol':'1.0-0' }}</p>
                    </div>
                     <div>
                        <p class="text-sm text-gray-500">Tenure</p>
                        <p class="font-medium">{{ l.tenor }} Months</p>
                    </div>
                </div>
             </div>

             <!-- Documents (Read Only unless Draft - handled by separate component/view usually, here simple list) -->
             <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Documents</h2>
                <div class="text-sm text-gray-500 italic">
                    Document preview not implemented in this view. 
                    <span *ngIf="l.loanStatus === 'DRAFT'" class="not-italic text-primary-600 cursor-pointer" routerLink="/loans/apply">Edit in Application</span>
                </div>
                <div class="mt-4 flex gap-2">
                    <div class="bg-gray-100 p-2 rounded text-xs flex items-center">
                        <i class="fas fa-id-card mr-2"></i> KTP (Uploaded)
                    </div>
                     <div class="bg-gray-100 p-2 rounded text-xs flex items-center">
                        <i class="fas fa-users mr-2"></i> KK (Uploaded)
                    </div>
                    <div class="bg-gray-100 p-2 rounded text-xs flex items-center">
                        <i class="fas fa-file-invoice mr-2"></i> NPWP (Uploaded)
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  `
})
export class LoanDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private loanService = inject(LoanService);
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

    // Helper to map BackendDTO to UI interface for ActionsComponent
    processedLoan(l: BackendLoanResponse): any {
        return {
            id: l.id,
            status: l.loanStatus,
            amount: l.loanAmount,
            // ... other fields if needed by actions
        };
    }
}
