import { Component, inject, OnInit, signal, computed, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanEventBus } from '../../../core/patterns/loan-event-bus.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoanWorkflowModalComponent, LoanDetailInfo, LoanWorkflowStep } from '../../../shared/components/loan-workflow-modal/loan-workflow-modal.component';
import { LoanDisbursementBuilder } from '../../../core/patterns/disbursement-builder';
import { ToastService } from '../../../core/services/toast.service';
import { LoanService } from '../../../core/services/loan.service';
import { Subject, takeUntil, forkJoin, of, catchError, finalize, retry, timer, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LoanVM } from '../../loans/models/loan.models';
import { RbacService } from '../../../core/services/rbac.service';
import { Branch, ROLES } from '../../../core/models/rbac.models';
import { AuthService } from '../../../core/services/auth.service';

type WorkflowStatus = 'SUBMITTED' | 'REVIEWED' | 'APPROVED';

interface LoanStats {
  submitted: number;
  reviewed: number;
  approved: number;
}

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, LoanWorkflowModalComponent],
  templateUrl: './disbursement-list.component.html',
  styleUrls: ['./disbursement-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisbursementComponent implements OnInit, OnDestroy {
  private loanFacade = inject(LoanFacade);
  private loanService = inject(LoanService);
  private eventBus = inject(LoanEventBus);
  private toast = inject(ToastService);
  private router = inject(Router);
  private rbacService = inject(RbacService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Track subscriptions untuk bisa cancel pending requests
  private loansSubscription?: Subscription;
  private statsSubscription?: Subscription;
  private autoReloadTimer?: Subscription;

  // Local loading state (not shared with facade)
  isLoading = signal<boolean>(false);
  loans = signal<LoanVM[]>([]);
  error = signal<string | null>(null);
  processingId = signal<string | null>(null);

  // Stats from backend
  stats = signal<LoanStats>({ submitted: 0, reviewed: 0, approved: 0 });
  isLoadingStats = signal<boolean>(false);

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
    availableActions: []
  });

  // Confirmation Modal State
  modal = signal({
    isOpen: false,
    loanId: '',
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

  // Role verification helper
  isBackOffice = computed(() => this.authService.hasRole(ROLES.BACK_OFFICE));

  // Status filter - default ke APPROVED agar langsung ada data
  statusFilter = signal<WorkflowStatus | 'ALL'>('APPROVED');

  // Last refresh timestamp untuk force refresh
  lastRefreshTime = signal<number>(Date.now());

  totalAmount = computed(() =>
    this.loans().reduce((sum, l) => sum + (l.amount || 0), 0)
  );

  // Count dari stats backend
  pendingReviewCount = computed(() => this.stats().submitted);
  pendingApprovalCount = computed(() => this.stats().reviewed);
  pendingDisbursementCount = computed(() => this.stats().approved);

  ngOnInit() {
    this.loadBranches();

    // Delay sedikit untuk memastikan view sudah ready
    setTimeout(() => {
      this.refreshData(true); // Force refresh saat init
    }, 100);

    // PUBLISHER/SUBSCRIBER: Listen for updates to refresh list
    this.eventBus.loanUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Event bus: loan updated, refreshing...');
        this.refreshData(true); // Force refresh
      });

    // Auto reload setiap 30 detik untuk memastikan data up-to-date
    this.autoReloadTimer = timer(30000, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Auto reload triggered');
        this.refreshData(true);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Cancel pending subscriptions
    this.loansSubscription?.unsubscribe();
    this.statsSubscription?.unsubscribe();
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
    this.refreshData(true);
  }

  onStatusFilterChange(status: WorkflowStatus | 'ALL') {
    this.statusFilter.set(status);
    this.loadLoans();
  }

  // Load statistik dari backend untuk semua status
  loadStats(force: boolean = false) {
    // Cancel previous pending request
    this.statsSubscription?.unsubscribe();

    this.isLoadingStats.set(true);

    const baseParams: any = {};
    if (this.selectedBranchId() && !this.isBackOffice()) {
      baseParams.branchId = this.selectedBranchId();
    }

    // Cache-busting: tambah timestamp jika force refresh
    if (force) {
      baseParams._t = Date.now();
    }

    // Fetch count untuk masing-masing status dengan error handling per request
    const requests = {
      submitted: this.loanService.getLoans({ ...baseParams, status: 'SUBMITTED', page: 0, size: 1 }).pipe(
        catchError(err => {
          console.warn('Failed to load SUBMITTED count:', err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 });
        })
      ),
      reviewed: this.loanService.getLoans({ ...baseParams, status: 'REVIEWED', page: 0, size: 1 }).pipe(
        catchError(err => {
          console.warn('Failed to load REVIEWED count:', err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 });
        })
      ),
      approved: this.loanService.getLoans({ ...baseParams, status: 'APPROVED', page: 0, size: 1 }).pipe(
        catchError(err => {
          console.warn('Failed to load APPROVED count:', err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 });
        })
      )
    };

    this.statsSubscription = forkJoin(requests).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('Failed to load stats after retries:', err);
        return of({
          submitted: { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 },
          reviewed: { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 },
          approved: { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 }
        });
      }),
      finalize(() => {
        this.isLoadingStats.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (results) => {
        console.log('Stats loaded:', results);
        this.stats.set({
          submitted: results.submitted.totalElements || 0,
          reviewed: results.reviewed.totalElements || 0,
          approved: results.approved.totalElements || 0
        });
      }
    });
  }

  loadLoans(force: boolean = false) {
    // Cancel previous pending request
    this.loansSubscription?.unsubscribe();

    this.isLoading.set(true);
    this.error.set(null);

    const params: any = {
      page: 0,
      size: 50
    };

    // Jika filter ALL, default ke APPROVED
    if (this.statusFilter() !== 'ALL') {
      params.status = this.statusFilter();
    } else {
      params.status = 'APPROVED';
    }

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    if (this.selectedBranchId() && !this.isBackOffice()) {
      params.branchId = this.selectedBranchId();
    }

    // Cache-busting: tambah timestamp jika force refresh
    if (force) {
      params._t = Date.now();
    }

    console.log('Loading loans with params:', params);

    this.loansSubscription = this.loanFacade.getLatestLoans(params).pipe(
      // Retry 2 kali dengan delay 1 detik sebelum menyerah
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('Load loans error after retries:', err);
        this.error.set('Failed to load loans. Please try again.');
        return of({ content: [], totalElements: 0, totalPages: 0 });
      }),
      finalize(() => {
        this.isLoading.set(false);
        // Trigger change detection secara manual untuk OnPush strategy
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        console.log('Loans loaded:', response.content?.length, 'items, raw:', response);
        // Log full response untuk debug
        if (!response.content || response.content.length === 0) {
          console.warn('Empty response received:', response);
        }
        // Pastikan selalu set array baru untuk trigger signal
        this.loans.set([...(response.content ?? [])]);

        // Auto reload sekali lagi jika data kosong tapi tidak ada error (mungkin race condition)
        if ((!response.content || response.content.length === 0) && !this.error()) {
          console.log('Data empty, will auto reload in 3 seconds...');
          setTimeout(() => {
            if (this.loans().length === 0 && !this.isLoading()) {
              console.log('Auto reloading due to empty data...');
              this.loadLoans(true);
            }
          }, 3000);
        }
      }
    });
  }

  // Refresh manual dengan reload stats juga
  refreshData(force: boolean = true) {
    console.log('Refreshing data... force:', force);
    this.lastRefreshTime.set(Date.now());
    this.loadStats(force);
    this.loadLoans(force);
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
      loan.tenor,
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
    a.download = `disbursement-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ========== Action Methods ==========

  onReview(loanId: string) {
    this.openConfirmModal({
      title: 'Review Application',
      message: 'Are you sure you want to mark this application as Reviewed?',
      confirmLabel: 'Confirm Review',
      confirmBtnClass: 'bg-blue-600',
      requireNotes: true,
      placeholder: 'Enter review notes...',
      action: (notes: string) => {
        this.processingId.set(loanId);
        this.loanFacade.reviewLoan(loanId, notes).subscribe({
          next: () => {
            this.processingId.set(null);
            this.eventBus.emitLoanUpdated();
            this.closeModal();
            this.toast.show('Application reviewed successfully', 'success');
          },
          error: (err) => {
            this.processingId.set(null);
            this.toast.show('Review failed', 'error');
          }
        });
      }
    });
  }

  onApprove(loanId: string) {
    this.openConfirmModal({
      title: 'Approve Application',
      message: 'Finalize approval for this loan application?',
      confirmLabel: 'Approve',
      confirmBtnClass: 'bg-amber-600',
      requireNotes: true,
      placeholder: 'Enter approval notes...',
      action: (notes: string) => {
        this.processingId.set(loanId);
        this.loanFacade.approveLoan(loanId, notes).subscribe({
          next: () => {
            this.processingId.set(null);
            this.eventBus.emitLoanUpdated();
            this.closeModal();
            this.toast.show('Application approved successfully', 'success');
          },
          error: (err) => {
            this.processingId.set(null);
            this.toast.show('Approve failed', 'error');
          }
        });
      }
    });
  }

  onDisburse(loanId: string) {
    this.openConfirmModal({
      title: 'Disburse Loan',
      message: 'Finalize disbursement for this loan?',
      confirmLabel: 'Confirm Disbursement',
      confirmBtnClass: 'bg-green-600',
      requireNotes: true,
      placeholder: 'Enter bank reference number...',
      action: (refNumber: string) => {
        this.processingId.set(loanId);
        try {
          const payload = new LoanDisbursementBuilder()
            .withLoanId(loanId)
            .withReference(refNumber)
            .withTodayAsDate()
            .build();

          this.loanFacade.disburseLoan(payload).subscribe({
            next: () => {
              this.processingId.set(null);
              this.eventBus.emitLoanUpdated();
              this.closeModal();
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
        this.processingId.set(loanId);
        this.loanFacade.rejectLoan(loanId, notes).subscribe({
          next: () => {
            this.processingId.set(null);
            this.eventBus.emitLoanUpdated();
            this.closeModal();
            this.toast.show('Application rejected', 'info');
          },
          error: (err) => {
            this.processingId.set(null);
            this.toast.show('Rejection failed', 'error');
          }
        });
      }
    });
  }

  openConfirmModal(config: any) {
    this.modal.set({
      isOpen: true,
      loanId: config.loanId || '',
      ...config
    });
  }

  closeModal() {
    this.modal.update(m => ({ ...m, isOpen: false }));
  }

  onExecuteAction(notes: string) {
    if (this.modal().action) {
      this.modal().action!(notes);
    }
  }

  // ========== Workflow Modal Methods ==========

  onViewWorkflowDetails(loan: LoanVM): void {
    // Force reload detail dengan cache-busting
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
          appliedDate: detail.submittedAt || detail.createdAt,
          // Location data for map
          latitude: detail.latitude,
          longitude: detail.longitude,
          // Documents
          documents: detail.documents
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
    const steps: LoanWorkflowStep[] = [
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
    return steps;
  }

  private getAvailableActions(status: string): string[] {
    const actions: string[] = [];
    if (status === 'SUBMITTED') {
      actions.push('REVIEW');
    } else if (status === 'REVIEWED') {
      actions.push('APPROVE');
    } else if (status === 'APPROVED') {
      actions.push('DISBURSE');
    }
    return actions;
  }

  onWorkflowAction(event: { type: string; notes?: string }): void {
    const loanId = this.workflowModal().loanDetail?.id;
    if (!loanId) return;

    // Close workflow modal first
    this.workflowModal.set({ ...this.workflowModal(), isOpen: false });

    // Route to appropriate action
    switch (event.type) {
      case 'REVIEW':
        this.onReview(loanId);
        break;
      case 'APPROVE':
        this.onApprove(loanId);
        break;
      case 'DISBURSE':
        this.onDisburse(loanId);
        break;
    }
  }

  onWorkflowClose(): void {
    this.workflowModal.set({
      ...this.workflowModal(),
      isOpen: false
    });
  }

  onViewFullPage(loanId: string): void {
    this.router.navigate(['/dashboard/loans', loanId]);
  }

  // ========== UI Helpers ==========

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'SUBMITTED': return 'badge-warning';
      case 'REVIEWED': return 'badge-info';
      case 'APPROVED': return 'badge-success';
      case 'DISBURSED': return 'badge-info';
      case 'REJECTED': return 'badge-error';
      default: return 'badge-info';
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

  // Helper to check if a loan can be reviewed
  canReview(loan: LoanVM): boolean {
    return loan.status === 'SUBMITTED';
  }

  // Helper to check if a loan can be approved
  canApprove(loan: LoanVM): boolean {
    return loan.status === 'REVIEWED';
  }

  // Helper to check if a loan can be disbursed
  canDisburse(loan: LoanVM): boolean {
    return loan.status === 'APPROVED';
  }

  // Track by function untuk optimasi rendering
  trackByLoanId(index: number, loan: LoanVM): string {
    return loan.id;
  }

  // View location on Google Maps
  viewLocationOnMap(loan: LoanVM): void {
    if (loan.latitude && loan.longitude) {
      const url = `https://www.google.com/maps?q=${loan.latitude},${loan.longitude}`;
      window.open(url, '_blank');
    }
  }

  // Check if there might be data mismatch (stats show count but table empty)
  hasDataMismatch(): boolean {
    const currentStatus = this.statusFilter();
    let expectedCount = 0;

    switch (currentStatus) {
      case 'SUBMITTED':
        expectedCount = this.pendingReviewCount();
        break;
      case 'REVIEWED':
        expectedCount = this.pendingApprovalCount();
        break;
      case 'APPROVED':
        expectedCount = this.pendingDisbursementCount();
        break;
      case 'ALL':
        expectedCount = this.pendingReviewCount() + this.pendingApprovalCount() + this.pendingDisbursementCount();
        break;
    }

    return expectedCount > 0 && this.loans().length === 0 && !this.isLoading() && !this.error();
  }
}
