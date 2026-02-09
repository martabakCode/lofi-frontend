import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { LoanVM } from '../models/loan.models';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { EmptyStateComponent } from '../../../shared/components/apple-hig/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { PageToolbarComponent } from '../../../shared/components/page/page-toolbar.component';
import { SearchInputComponent } from '../../../shared/components/search/search-input.component';
import { SortDropdownComponent, SortOption } from '../../../shared/components/sorting/sort-dropdown.component';
import { CardTableComponent } from '../../../shared/components/table/card-table.component';
import { TableHeaderComponent, Column } from '../../../shared/components/table/table-header.component';
import { TableRowComponent } from '../../../shared/components/table/table-row.component';
import { StatusBadgeComponent } from '../../../shared/components/status/status-badge.component';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PaginationComponent,
    ConfirmationModalComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    PageToolbarComponent,
    SearchInputComponent,
    SortDropdownComponent,
    CardTableComponent,
    TableHeaderComponent,
    TableRowComponent,
    StatusBadgeComponent
  ],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.css']
})
export class LoanListComponent implements OnInit {
  private loanFacade = inject(LoanFacade);
  private toastService = inject(ToastService);

  // Signals
  loans = this.loanFacade.loans;
  loading = this.loanFacade.loading;

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // Sorting
  sortField = signal('appliedDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Search & Filter
  searchQuery = signal('');
  private searchSubject = new Subject<string>();
  selectedStatusFilter = signal<string>('');

  // Cancel confirmation
  isCancelModalOpen = signal(false);
  loanToCancel = signal<LoanVM | null>(null);

  // Export
  isExporting = signal(false);

  // Config
  headerActions = [
    { label: 'Export', icon: 'pi-download', click: () => this.exportLoans(), variant: 'secondary' },
    { label: 'New Loan', icon: 'pi-plus', route: '/dashboard/loans/apply', variant: 'primary' }
  ];

  columns: Column[] = [
    { field: 'customerName', header: 'Applicant', sortable: true, width: '20%' },
    { field: 'productName', header: 'Product', sortable: true, width: '15%' },
    { field: 'amount', header: 'Amount', sortable: true, width: '15%' },
    { field: 'tenor', header: 'Tenure', sortable: true, width: '10%' },
    { field: 'appliedDate', header: 'Applied Date', sortable: true, width: '15%' },
    { field: 'status', header: 'Status', width: '15%' },
    { field: 'actions', header: '', width: '10%' }
  ];

  sortOptions: SortOption[] = [
    { label: 'Newest First', value: '-appliedDate' },
    { label: 'Oldest First', value: 'appliedDate' },
    { label: 'Amount (High-Low)', value: '-amount' },
    { label: 'Amount (Low-High)', value: 'amount' },
  ];

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadLoans();
    });
  }

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loanFacade.loadLoans();
  }

  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  onSortChange(value: string) {
    if (value.startsWith('-')) {
      this.sortField.set(value.substring(1));
      this.sortDirection.set('desc');
    } else {
      this.sortField.set(value);
      this.sortDirection.set('asc');
    }
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.selectedStatusFilter.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  // Stats
  totalLoans = computed(() => this.loans().length);
  pendingLoans = computed(() => this.loans().filter(l => ['SUBMITTED', 'REVIEWED'].includes(l.status)).length);
  approvedLoans = computed(() => this.loans().filter(l => ['APPROVED', 'DISBURSED'].includes(l.status)).length);
  rejectedLoans = computed(() => this.loans().filter(l => l.status === 'REJECTED').length);

  hasActiveFilters = computed(() => {
    return this.searchQuery() !== '' || this.selectedStatusFilter() !== '';
  });

  private allFilteredLoans = computed(() => {
    let result = this.loans();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatusFilter();

    if (query) {
      result = result.filter(l =>
        l.customerName.toLowerCase().includes(query) ||
        l.customerEmail.toLowerCase().includes(query) ||
        l.productName.toLowerCase().includes(query)
      );
    }

    if (status) {
      result = result.filter(l => l.status === status);
    }

    const sortField = this.sortField();
    const sortDir = this.sortDirection();
    return [...result].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortField === 'appliedDate' || sortField === 'updatedAt') {
        comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      } else if (typeof a[sortField] === 'string') {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else {
        comparison = (a[sortField] || 0) - (b[sortField] || 0);
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  });

  totalItems = computed(() => this.allFilteredLoans().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

  filteredLoans = computed(() => {
    const result = this.allFilteredLoans();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return result.slice(start, end);
  });

  // Actions
  confirmCancel(loan: LoanVM) {
    this.loanToCancel.set(loan);
    this.isCancelModalOpen.set(true);
  }

  onCancelConfirmed() {
    const loan = this.loanToCancel();
    if (!loan) return;

    this.loanFacade.cancelLoan(loan.id).subscribe({
      next: () => {
        this.toastService.show('Loan cancelled successfully', 'success');
        this.isCancelModalOpen.set(false);
        this.loanToCancel.set(null);
        this.loadLoans();
      },
      error: () => {
        this.toastService.show('Failed to cancel loan', 'error');
        this.isCancelModalOpen.set(false);
      }
    });
  }

  exportLoans() {
    this.isExporting.set(true);
    const data = this.loans();
    if (data.length === 0) {
      this.isExporting.set(false);
      this.toastService.show('No loans to export', 'warning');
      return;
    }
    this.downloadCsv(data);
    this.isExporting.set(false);
  }

  private downloadCsv(data: LoanVM[]) {
    const headers = ['ID', 'Customer', 'Product', 'Amount', 'Tenure', 'Status', 'Applied Date'];
    const rows = data.map(l => [
      l.id,
      l.customerName,
      l.productName,
      l.amount,
      l.tenor,
      l.status,
      l.appliedDate
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loans-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toastService.show('Loans exported successfully', 'success');
  }
}
