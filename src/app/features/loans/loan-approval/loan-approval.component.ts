import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { SlaBadgeComponent } from '../../../shared/components/sla-badge/sla-badge.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoanWorkflowModalComponent, LoanDetailInfo, LoanWorkflowStep } from '../../../shared/components/loan-workflow-modal/loan-workflow-modal.component';
import { LoanStatus } from '../../../core/models/loan.models';
import { LoanVM } from '../models/loan.models';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoanService } from '../../../core/services/loan.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';

@Component({
  selector: 'app-loan-approval',
  standalone: true,
  imports: [CommonModule, RouterModule, SlaBadgeComponent, ConfirmationModalComponent, LoanWorkflowModalComponent],
  templateUrl: './loan-approval.component.html',
  styleUrls: ['./loan-approval.component.css']
})
export class LoanApprovalComponent implements OnInit, OnDestroy {
  private loanFacade = inject(LoanFacade);
  private loanService = inject(LoanService);
  private eventBus = inject(LoanEventBus);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loans = signal<LoanVM[]>([]);
  loading = this.loanFacade.loading;
  error = signal<string | null>(null);
  totalRecords = signal<number>(0);

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
    availableActions: ['APPROVE']
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
  private searchSubject = new Subject<string>();
  isExporting = signal(false);

  ngOnInit() {
    this.loadLoans();

    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.loadLoans();
    });

    this.eventBus.loanUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadLoans());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: Event) {
    const value = (query.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  loadLoans() {
    const params: any = {
      status: 'REVIEWED',
      page: 0,
      size: 10
    };

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    this.loanFacade.getLatestLoans(params).subscribe({
      next: (response) => {
        this.loans.set(response.content ?? []);
        this.totalRecords.set(response.totalElements ?? 0);
      },
      error: (err) => {
        console.error('Failed to load approval queue', err);
        this.error.set('Failed to load approval queue');
      }
    });
  }

  exportLoans() {
    this.isExporting.set(true);
    const params: any = { status: 'REVIEWED', size: 1000 };
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

    const headers = ['ID', 'Customer', 'Product', 'Amount', 'Tenure', 'Status', 'Date'];
    const rows = data.map(loan => [
      loan.id,
      loan.customerName,
      loan.productName,
      loan.amount,
      loan.tenure,
      loan.status,
      loan.appliedDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-approval-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  openConfirmModal(config: any) {
    this.modal.set({
      isOpen: true,
      ...config
    });
  }

  onApprove(loanId: string) {
    this.openConfirmModal({
      title: 'Final Approval',
      message: 'Authorize this loan for disbursement? This action cannot be undone.',
      confirmLabel: 'Authorize',
      confirmBtnClass: 'bg-amber-600',
      requireNotes: true,
      placeholder: 'Final approval notes...',
      action: (notes: string) => {
        this.loanFacade.approveLoan(loanId, notes).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Loan authorized successfully', 'success');
          },
          error: (err) => this.toast.show('Approval failed', 'error')
        });
      }
    });
  }

  onReject(loanId: string) {
    this.openConfirmModal({
      title: 'Reject Application',
      message: 'Are you sure you want to REJECT this application? The customer will be notified.',
      confirmLabel: 'Reject Permanently',
      confirmBtnClass: 'bg-red-600',
      requireNotes: true,
      placeholder: 'Rejection reason...',
      action: (notes: string) => {
        this.loanFacade.rejectLoan(loanId, notes).subscribe({
          next: () => {
            this.eventBus.emitLoanUpdated();
            this.toast.show('Application rejected', 'info');
          },
          error: (err) => this.toast.show('Rejection failed', 'error')
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
      this.modal.update(m => ({ ...m, isOpen: false }));
    }
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'REVIEWED': return 'badge-warning text-amber-600';
      case 'APPROVED': return 'badge-success text-green-600';
      default: return 'badge-info';
    }
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }

  // ========== Workflow Modal Methods ==========

  onViewWorkflowDetails(loan: any): void {
    this.loanService.getLoanDetailForWorkflow(loan.id).subscribe({
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
    if (status === 'REVIEWED') {
      actions.push('APPROVE');
    }
    return actions;
  }

  onWorkflowAction(event: { type: string; notes?: string }): void {
    const loanId = this.workflowModal().loanDetail?.id;
    if (!loanId) return;

    if (event.type === 'APPROVE') {
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
}
