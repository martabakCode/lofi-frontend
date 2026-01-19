import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { ReportService } from '../../../core/services/report.service';
import { SlaBadgeComponent } from '../../../shared/components/sla-badge/sla-badge.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoanStatus } from '../../../core/models/loan.models';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loan-review',
  standalone: true,
  imports: [CommonModule, RouterModule, SlaBadgeComponent, ConfirmationModalComponent],
  templateUrl: './loan-review.component.html',
  styleUrls: ['./loan-review.component.css']
})
export class LoanReviewComponent implements OnInit, OnDestroy {
  private loanFacade = inject(LoanFacade);
  private reportService = inject(ReportService);
  private eventBus = inject(LoanEventBus);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  loans = signal<any[]>([]);
  loading = this.loanFacade.loading;
  error = signal<string | null>(null);
  totalRecords = signal<number>(0);

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
  isExporting = signal(false);

  ngOnInit() {
    this.loadLoans();

    // PUBLISHER/SUBSCRIBER: Listen for updates to refresh list
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
    this.searchQuery.set(value);
    this.loadLoans();
  }

  loadLoans() {
    const params: any = {
      // status field might be handled by backend default or facade, checking getLatestLoans signature
      // Facade calls service which takes params.
      // Based on loan-approval component, we might want to filter by SUBMITTED here if this is review queue?
      // Step 27 says "New loan applications will appear here for your review".
      // TS matches loanFacade.getLatestLoans().
      // I'll keep default but allow search.
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
        console.error('Failed to load loans', err);
        this.error.set('Failed to load review queue');
      }
    });
  }

  exportLoans() {
    this.isExporting.set(true);
    const params: any = { size: 1000 };
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
    ].join('\\n');

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
        this.loanFacade.rollbackLoan(loanId, 'REJECTED: ' + notes).subscribe({
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
      // If action expects argument, pass it. But action signature in modal is just () => void in some cases?
      // Actually defined as (notes: string) => void | null.
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
}
