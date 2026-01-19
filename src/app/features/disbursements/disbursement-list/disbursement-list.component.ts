import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoanDisbursementBuilder } from '../../../core/patterns/disbursement-builder';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './disbursement-list.component.html',
  styleUrls: ['./disbursement-list.component.css']
})
export class DisbursementComponent implements OnInit, OnDestroy {
  private loanFacade = inject(LoanFacade);
  private eventBus = inject(LoanEventBus);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  loans = signal<any[]>([]);
  loading = this.loanFacade.loading;
  error = signal<string | null>(null);
  processingId = signal<string | null>(null);

  // Modal State
  modal = signal({
    isOpen: false,
    loanId: '',
    title: 'Disburse Loan',
    message: '',
    confirmLabel: 'Confirm Disbursement',
    confirmBtnClass: 'bg-green-600',
    requireNotes: true,
    placeholder: 'Enter bank reference number...',
  });

  searchQuery = signal<string>('');
  isExporting = signal(false);

  totalAmount = computed(() =>
    this.loans().reduce((sum, l) => sum + (l.amount || 0), 0)
  );

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
    // Only approved loans are ready for disbursement
    const params: any = {
      status: 'APPROVED',
      page: 0,
      size: 50
    };

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    this.loanFacade.getLatestLoans(params).subscribe({
      next: (response) => {
        this.loans.set(response.content ?? []);
      },
      error: (err) => {
        this.error.set('Failed to load approved loans');
      }
    });
  }

  exportLoans() {
    this.isExporting.set(true);
    const params: any = { status: 'APPROVED', size: 1000 };
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
    a.download = `disbursement-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onDisburseClick(loan: any) {
    this.modal.set({
      ...this.modal(),
      isOpen: true,
      loanId: loan.id,
      message: `Finalize disbursement for ${loan.customerName} of ${this.formatCurrency(loan.amount)}?`
    });
  }

  executeDisbursement(refNumber: string) {
    const loanId = this.modal().loanId;
    this.processingId.set(loanId);

    try {
      // BUILDER PATTERN
      const payload = new LoanDisbursementBuilder()
        .withLoanId(loanId)
        .withReference(refNumber)
        .withTodayAsDate()
        .build();

      this.loanFacade.disburseLoan(payload).subscribe({
        next: () => {
          this.processingId.set(null);
          this.eventBus.emitLoanUpdated();
          this.modal.set({ ...this.modal(), isOpen: false });
          this.toast.show('Loan disbursed successfully', 'success');
        },
        error: (err) => {
          this.processingId.set(null);
          this.toast.show('Disbursement failed', 'error');
        }
      });
    } catch (e: any) {
      this.toast.show(e.message, 'error');
      this.processingId.set(null);
    }
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'DISBURSED': return 'info';
      default: return 'warn';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
