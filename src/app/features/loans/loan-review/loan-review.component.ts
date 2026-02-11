import { Component, inject, OnInit, signal, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from '../../../core/services/report.service';
import { SlaBadgeComponent } from '../../../shared/components/sla-badge/sla-badge.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoanWorkflowModalComponent, LoanDetailInfo, LoanWorkflowStep } from '../../../shared/components/loan-workflow-modal/loan-workflow-modal.component';
import { LoanStatus } from '../../../core/models/loan.models';
import { LoanVM } from '../models/loan.models';
import { RbacService } from '../../../core/services/rbac.service';
import { Branch } from '../../../core/models/rbac.models';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoanService } from '../../../core/services/loan.service';
import { Subject, takeUntil, Subscription, retry, catchError, of, finalize, timer } from 'rxjs';

@Component({
  selector: 'app-loan-review',
  standalone: true,
  imports: [CommonModule, RouterModule, SlaBadgeComponent, ConfirmationModalComponent, LoanWorkflowModalComponent],
  templateUrl: './loan-review.component.html',
  styleUrls: ['./loan-review.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanReviewComponent implements OnInit, OnDestroy {
  private loanFacade = inject(LoanFacade);
  private loanService = inject(LoanService);
  private authService = inject(AuthService);
  private reportService = inject(ReportService);
  private eventBus = inject(LoanEventBus);
  private toast = inject(ToastService);
  private router = inject(Router);
  private rbacService = inject(RbacService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Track subscriptions untuk bisa cancel pending requests
  private loansSubscription?: Subscription;
  private autoReloadTimer?: Subscription;

  loans = signal<LoanVM[]>([]);
  // Local loading state, not shared with facade
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalRecords = signal<number>(0);
  lastRefreshTime = signal<number>(Date.now());

  // Workflow Modal State
  workflowModal = signal<{
    isOpen: boolean;
    loanDetail: LoanDetailInfo | null;
    workflowSteps: LoanWorkflowStep[];
    availableActions: string[];
  }>({
    isOpen: false,
    loanDetail: null,
    workflowSteps: [],
    availableActions: ['REVIEW', 'APPROVE']
  });

  // Modal State
  modal = signal({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    confirmBtnClass: '',
    requireNotes: false,
    placeholder: '',
    action: null as ((notes: string) => void) | null
  });

  searchQuery = signal<string>('');
  branches = signal<Branch[]>([]);
  selectedBranchId = signal<string>('');
  isExporting = signal(false);

  ngOnInit() {
    this.loadBranches();
    
    // Delay sedikit untuk memastikan view ready
    setTimeout(() => {
      this.loadLoans(true);
    }, 100);

    // PUBLISHER/SUBSCRIBER: Listen for updates to refresh list
    this.eventBus.loanUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('LoanReview: Event bus update received');
        this.loadLoans(true);
      });
      
    // Auto reload setiap 30 detik
    this.autoReloadTimer = timer(30000, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('LoanReview: Auto reload triggered');
        this.loadLoans(true);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.loansSubscription?.unsubscribe();
    this.autoReloadTimer?.unsubscribe();
  }

  onSearch(query: Event) {
    const value = (query.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.loadLoans();
  }

  loadBranches() {
    this.rbacService.getAllBranches().subscribe({
      next: (branches) => this.branches.set(branches),
      error: () => this.toast.show('Failed to load branches', 'error')
    });
  }

  onBranchChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedBranchId.set(select.value);
    this.loadLoans(true);
  }

  refreshData() {
    this.loadLoans(true);
  }

  loadLoans(force: boolean = false) {
    // Cancel previous pending request
    this.loansSubscription?.unsubscribe();

    this.isLoading.set(true);
    this.error.set(null);

    const params: any = {
      page: 0,
      size: 10
    };
    const user = this.authService.currentUser();
    if (user?.branchId) {
      params.branchId = user.branchId;
    } else if (this.selectedBranchId()) {
      params.branchId = this.selectedBranchId();
    }
    params.status = 'SUBMITTED';

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    // Cache-busting
    if (force) {
      params._t = Date.now();
    }

    console.log('LoanReview: Loading loans with params:', params);

    this.loansSubscription = this.loanFacade.getLatestLoans(params).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('LoanReview: Load loans error:', err);
        this.error.set('Failed to load review queue. Please try again.');
        return of({ content: [], totalElements: 0, totalPages: 0 });
      }),
      finalize(() => {
        this.isLoading.set(false);
        this.lastRefreshTime.set(Date.now());
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        console.log('LoanReview: Loans loaded:', response.content?.length, 'items');
        this.loans.set([...(response.content ?? [])]);
        this.totalRecords.set(response.totalElements ?? 0);
        
        // Auto reload jika data kosong tapi tidak ada error
        if ((!response.content || response.content.length === 0) && !this.error()) {
          console.log('LoanReview: Data empty, will retry in 3 seconds...');
          setTimeout(() => {
            if (this.loans().length === 0 && !this.isLoading()) {
              this.loadLoans(true);
            }
          }, 3000);
        }
      }
    });
  }

  exportLoans() {
    this.isExporting.set(true);
    const params: any = { size: 1000 };
    const user = this.authService.currentUser();
    if (user?.branchId) {
      params.branchId = user.branchId;
    } else if (this.selectedBranchId()) {
      params.branchId = this.selectedBranchId();
    }
    params.status = 'SUBMITTED';

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    this.loanFacade.getLatestLoans(params).subscribe({
      next: (response) => {
        const data = response.content || [];
        this.downloadCsv(data);
        this.isExporting.set(false);
      },
      error: (err) => {
        this.toast.show('Failed to export loans', 'error');
        this.isExporting.set(false);
      }
    });
  }

  private downloadCsv(data: any[]) {
    if (data.length === 0) {
      this.toast.show('No data to export', 'warning');
      return;
    }

    const headers = ['ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'];
    const rows = data.map(loan => [
      loan.id,
      loan.customerName,
      loan.productName,
      loan.amount,
      loan.status,
      loan.appliedDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-review-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  canApprove(loan: any): boolean {
    return this.loanFacade.canPerformAction(loan.status as LoanStatus, 'APPROVE');
  }

  canRollback(loan: any): boolean {
    return this.loanFacade.canPerformAction(loan.status as LoanStatus, 'ROLLBACK');
  }

  openConfirmModal(config: any) {
    this.modal.set({
      isOpen: true,
      ...config
    });
  }

  onReview(loanId: string) {
    this.openConfirmModal({
      title: 'Review Application',
      message: 'Are you sure you want to mark this application as Reviewed?',
      confirmLabel: 'Confirm Review',
      confirmBtnClass: 'bg-brand-main',
      requireNotes: false,
      action: () => {
        this.loanFacade.reviewLoan(loanId, 'Reviewed by Marketing').subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Application reviewed', 'success');
          },
          error: (err) => this.toast.show('Review failed', 'error')
        });
      }
    });
  }

  onApprove(loanId: string) {
    this.openConfirmModal({
      title: 'Approve Application',
      message: 'Finalize approval for this loan application?',
      confirmLabel: 'Approve',
      confirmBtnClass: 'bg-green-600',
      requireNotes: true,
      placeholder: 'Enter approval notes...',
      action: (notes: string) => {
        this.loanFacade.approveLoan(loanId, notes).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Application approved', 'success');
          },
          error: (err) => this.toast.show('Approve failed', 'error')
        });
      }
    });
  }

  onReject(loanId: string) {
    this.openConfirmModal({
      title: 'Reject Application',
      message: 'This action will permanently reject the application. Please provide a reason.',
      confirmLabel: 'Reject',
      confirmBtnClass: 'bg-red-600',
      requireNotes: true,
      placeholder: 'Mandatory rejection reason...',
      action: (notes: string) => {
        this.loanFacade.rejectLoan(loanId, notes).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Application rejected', 'info');
          }
        });
      }
    });
  }

  onRollback(loanId: string) {
    this.openConfirmModal({
      title: 'Rollback to Previous Stage',
      message: 'Return this loan to the previous desk for correction?',
      confirmLabel: 'Rollback',
      confirmBtnClass: 'bg-amber-600',
      requireNotes: true,
      placeholder: 'Explain what needs to be fixed...',
      action: (notes: string) => {
        this.loanFacade.rollbackLoan(loanId, notes).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Application rolled back', 'info');
          }
        });
      }
    });
  }

  closeModal() {
    this.modal.update(m => ({ ...m, isOpen: false }));
  }

  onExecuteAction(notes: string) {
    if (this.modal().action) {
      this.modal().action!(notes);
      this.closeModal();
    }
  }

  onDisburse(loanId: string) {
    this.openConfirmModal({
      title: 'Disburse Loan',
      message: 'Are you sure you want to finalize disbursement for this loan?',
      confirmLabel: 'Disburse',
      confirmBtnClass: 'bg-indigo-600',
      requireNotes: true,
      placeholder: 'Enter bank reference number...',
      action: (refNum: string) => {
        const payload = {
          loanId,
          referenceNumber: refNum,
          disbursementDate: new Date().toISOString().split('T')[0]
        };
        this.loanFacade.disburseLoan(payload).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.modal.set({ ...this.modal(), isOpen: false });
            this.toast.show('Loan disbursed successfully', 'success');
          },
          error: (err) => this.toast.show('Disburse failed', 'error')
        });
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUBMITTED': return 'badge-warning';
      case 'APPROVED': return 'badge-success';
      case 'REVIEWED': return 'badge-info';
      case 'REJECTED': return 'badge-error';
      default: return 'badge-muted';
    }
  }

  exportSlaReport(loanId: string) {
    this.reportService.exportSlaReport(loanId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sla-report-${loanId}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toast.show('SLA Report exported', 'success');
      },
      error: (err) => console.error('Failed to export SLA report', err)
    });
  }

  // ========== Workflow Modal Methods ==========

  onViewWorkflowDetails(loan: any): void {
    this.loanService.getLoanDetailForWorkflow(loan.id).pipe(
      retry({ count: 2, delay: 500 })
    ).subscribe({
      next: (detail) => {
        const loanDetail: LoanDetailInfo = {
          id: detail.id,
          customerName: detail.customerName,
          productName: detail.product?.productName || 'Unknown',
          amount: detail.loanAmount,
          tenor: detail.tenor,
          interestRate: detail.product?.interestRate,
          adminFee: detail.product?.adminFee,
          status: detail.loanStatus,
          currentStage: detail.currentStage,
          disbursementReference: detail.disbursementReference,
          submittedAt: detail.submittedAt,
          approvedAt: detail.approvedAt,
          disbursedAt: detail.disbursedAt,
          appliedDate: detail.submittedAt || detail.createdAt
        };

        const workflowSteps = this.buildWorkflowSteps(detail);

        this.workflowModal.set({
          isOpen: true,
          loanDetail,
          workflowSteps,
          availableActions: this.getAvailableActions(detail.loanStatus)
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.show('Failed to load loan details', 'error');
      }
    });
  }

  private buildWorkflowSteps(detail: any): LoanWorkflowStep[] {
    return [
      {
        step: 'SUBMITTED',
        status: detail.submittedAt ? 'completed' : 'pending',
        timestamp: detail.submittedAt,
        userName: 'Customer'
      },
      {
        step: 'REVIEW',
        status: detail.reviewedAt ? 'completed' : (detail.submittedAt ? 'current' : 'pending'),
        timestamp: detail.reviewedAt
      },
      {
        step: 'APPROVAL',
        status: detail.approvedAt ? 'completed' : (detail.reviewedAt ? 'current' : 'pending'),
        timestamp: detail.approvedAt
      },
      {
        step: 'DISBURSE',
        status: detail.disbursedAt ? 'completed' : (detail.approvedAt ? 'current' : 'pending'),
        timestamp: detail.disbursedAt
      }
    ];
  }

  private getAvailableActions(status: string): string[] {
    const actions: string[] = [];
    if (status === 'SUBMITTED') {
      actions.push('REVIEW');
      actions.push('APPROVE');
    }
    return actions;
  }

  onWorkflowAction(event: { type: string; notes?: string }): void {
    const loanId = this.workflowModal().loanDetail?.id;
    if (!loanId) return;

    if (event.type === 'REVIEW') {
      this.workflowModal.set({ ...this.workflowModal(), isOpen: false });
      this.onReview(loanId);
    } else if (event.type === 'APPROVE') {
      this.workflowModal.set({ ...this.workflowModal(), isOpen: false });
      this.onApprove(loanId);
    }
  }

  onWorkflowClose(): void {
    this.workflowModal.set({ ...this.workflowModal(), isOpen: false });
  }

  onViewFullPage(loanId: string): void {
    this.router.navigate(['/dashboard/loans', loanId]);
  }
  
  // Track by function
  trackByLoanId(index: number, loan: LoanVM): string {
    return loan.id;
  }
}
