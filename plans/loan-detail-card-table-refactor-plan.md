# Loan Detail & Card Table Refactoring Plan

## Overview
Refactor loan detail and loan list components to follow the Product feature pattern, using:
- Facade pattern for state management
- View Model (VM) for UI data transformation
- Shared components (`CardTableComponent`, `CardComponent`, `StatusBadgeComponent`)
- Signal-based reactivity
- Proper separation of concerns

## Current State vs Target State

### Current Issues:
1. `loan-list` uses raw HTML table instead of `CardTableComponent`
2. No stats cards in loan-list
3. No filtering, sorting, pagination in loan-list
4. `loan-detail` template uses custom inline styles instead of shared components
5. `loan-detail` lacks `PageHeaderComponent` and proper card structure

### Target Pattern (from Product feature):
- Clean separation: Logic in `.ts`, Template in `.html`
- Use `CardTableComponent`, `TableHeaderComponent`, `TableRowComponent`
- Use `PageHeaderComponent`, `PageToolbarComponent`
- Use `CardComponent` for detail sections
- Use `StatusBadgeComponent` for status display
- Use facade pattern with signals

---

## Step 1: Create LoanVM Model

**File:** `src/app/features/loans/models/loan.models.ts`

```typescript
export interface LoanResponse {
    id: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    loanAmount: number;
    tenor: number;
    loanStatus: LoanStatus;
    appliedDate: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    disbursedAt?: string;
    completedAt?: string;
    updatedAt: string;
    latitude?: number;
    longitude?: number;
    documents?: LoanDocument[];
}

export interface LoanDocument {
    id: string;
    documentType: string;
    fileName: string;
}

export type LoanStatus = 
    | 'DRAFT' 
    | 'SUBMITTED' 
    | 'REVIEWED' 
    | 'APPROVED' 
    | 'REJECTED' 
    | 'DISBURSED' 
    | 'COMPLETED' 
    | 'CANCELLED';

export interface LoanVM {
    id: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    amount: number;
    tenor: number;
    status: LoanStatus;
    appliedDate: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    disbursedAt?: string;
    completedAt?: string;
    updatedAt: string;
    latitude?: number;
    longitude?: number;
    documents?: LoanDocument[];
    // UI helper fields
    amountLabel: string;
    tenorLabel: string;
    statusLabel: string;
    statusVariant: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'DEFAULT';
}

export interface LoanStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    disbursed: number;
    completed: number;
}
```

---

## Step 2: Create LoanAdapter

**File:** `src/app/features/loans/adapters/loan.adapter.ts`

```typescript
import { LoanResponse, LoanVM } from '../models/loan.models';

export class LoanAdapter {
    static toView(dto: LoanResponse): LoanVM {
        return {
            ...dto,
            amount: dto.loanAmount,
            amountLabel: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(dto.loanAmount),
            tenorLabel: `${dto.tenor} months`,
            statusLabel: dto.loanStatus.replace('_', ' '),
            statusVariant: this.getStatusVariant(dto.loanStatus)
        };
    }

    static toViewList(dtos: LoanResponse[]): LoanVM[] {
        return dtos.map(dto => this.toView(dto));
    }

    private static getStatusVariant(status: string): LoanVM['statusVariant'] {
        switch (status) {
            case 'APPROVED':
            case 'DISBURSED':
            case 'COMPLETED':
                return 'SUCCESS';
            case 'SUBMITTED':
            case 'REVIEWED':
                return 'WARNING';
            case 'REJECTED':
            case 'CANCELLED':
                return 'ERROR';
            case 'DRAFT':
                return 'INFO';
            default:
                return 'DEFAULT';
        }
    }
}
```

---

## Step 3: Create LoanFacade

**File:** `src/app/features/loans/facades/loan.facade.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { LoanService } from '../../../core/services/loan.service';
import { LoanAdapter } from '../adapters/loan.adapter';
import { LoanVM, LoanResponse } from '../models/loan.models';
import { finalize, map, tap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class LoanFacade {
    private loanService = inject(LoanService);
    private toastService = inject(ToastService);

    // State signals
    private loansSignal = signal<LoanVM[]>([]);
    private loadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    // Selectors
    loans = computed(() => this.loansSignal());
    loading = computed(() => this.loadingSignal());
    error = computed(() => this.errorSignal());

    loadLoans() {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.loanService.getLatestLoans()
            .pipe(
                finalize(() => this.loadingSignal.set(false)),
                map(res => LoanAdapter.toViewList(res.content || []))
            )
            .subscribe({
                next: (loans) => this.loansSignal.set(loans),
                error: (err) => {
                    this.errorSignal.set(err.message || 'Failed to load loans');
                    this.toastService.show('Failed to load loans', 'error');
                }
            });
    }

    getLoan(id: string) {
        return this.loanService.getLoanById(id).pipe(
            map(dto => LoanAdapter.toView(dto))
        );
    }

    // Action methods with loading state management
    submitLoan(id: string) {
        this.loadingSignal.set(true);
        return this.loanService.submitLoan(id).pipe(
            tap({
                next: () => this.toastService.show('Loan submitted successfully', 'success'),
                error: () => this.toastService.show('Failed to submit loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    reviewLoan(id: string, notes: string) {
        this.loadingSignal.set(true);
        return this.loanService.reviewLoan(id, notes).pipe(
            tap({
                next: () => this.toastService.show('Loan reviewed successfully', 'success'),
                error: () => this.toastService.show('Failed to review loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    approveLoan(id: string, notes: string) {
        this.loadingSignal.set(true);
        return this.loanService.approveLoan(id, notes).pipe(
            tap({
                next: () => this.toastService.show('Loan approved successfully', 'success'),
                error: () => this.toastService.show('Failed to approve loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    rejectLoan(id: string, reason: string) {
        this.loadingSignal.set(true);
        return this.loanService.rejectLoan(id, reason).pipe(
            tap({
                next: () => this.toastService.show('Loan rejected', 'info'),
                error: () => this.toastService.show('Failed to reject loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    disburseLoan(id: string, date: string, reference: string) {
        this.loadingSignal.set(true);
        return this.loanService.disburseLoan(id, date, reference).pipe(
            tap({
                next: () => this.toastService.show('Loan disbursed successfully', 'success'),
                error: () => this.toastService.show('Failed to disburse loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    completeLoan(id: string) {
        this.loadingSignal.set(true);
        return this.loanService.completeLoan(id).pipe(
            tap({
                next: () => this.toastService.show('Loan completed successfully', 'success'),
                error: () => this.toastService.show('Failed to complete loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }

    cancelLoan(id: string) {
        this.loadingSignal.set(true);
        return this.loanService.cancelLoan(id).pipe(
            tap({
                next: () => this.toastService.show('Loan cancelled', 'info'),
                error: () => this.toastService.show('Failed to cancel loan', 'error')
            }),
            finalize(() => this.loadingSignal.set(false))
        );
    }
}
```

---

## Step 4: Refactor Loan List Component

### 4.1 Update TypeScript

**File:** `src/app/features/loans/loan-list/loan-list.component.ts`

```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoanFacade } from '../facades/loan.facade';
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

    // Delete confirmation
    isDeleteModalOpen = signal(false);
    loanToCancel = signal<LoanVM | null>(null);

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

    private filteredLoans = computed(() => {
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

    totalItems = computed(() => this.filteredLoans().length);
    totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

    filteredLoans = computed(() => {
        const result = this.filteredLoans();
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return result.slice(start, end);
    });

    // Actions
    confirmCancel(loan: LoanVM) {
        this.loanToCancel.set(loan);
        this.isDeleteModalOpen.set(true);
    }

    onCancelConfirmed() {
        const loan = this.loanToCancel();
        if (!loan) return;

        this.loanFacade.cancelLoan(loan.id).subscribe({
            next: () => {
                this.toastService.show('Loan cancelled successfully', 'success');
                this.isDeleteModalOpen.set(false);
                this.loanToCancel.set(null);
                this.loadLoans();
            },
            error: () => {
                this.toastService.show('Failed to cancel loan', 'error');
                this.isDeleteModalOpen.set(false);
            }
        });
    }

    exportLoans() {
        const data = this.loans();
        if (data.length === 0) {
            this.toastService.show('No loans to export', 'warning');
            return;
        }
        this.downloadCsv(data);
        this.toastService.show('Loans exported successfully', 'success');
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
    }
}
```

### 4.2 Update Template

**File:** `src/app/features/loans/loan-list/loan-list.component.html`

```html
<div class="space-y-6">
    <!-- Header -->
    <app-page-header title="Loan Management" subtitle="Manage and track loan applications">
    </app-page-header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <i class="pi pi-database text-xl"></i>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900">{{ totalLoans() }}</p>
                <p class="text-sm text-gray-500">Total Loans</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <i class="pi pi-clock text-xl"></i>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900">{{ pendingLoans() }}</p>
                <p class="text-sm text-gray-500">Pending Review</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <i class="pi pi-check-circle text-xl"></i>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900">{{ approvedLoans() }}</p>
                <p class="text-sm text-gray-500">Approved/Disbursed</p>
            </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <i class="pi pi-times-circle text-xl"></i>
            </div>
            <div>
                <p class="text-2xl font-bold text-gray-900">{{ rejectedLoans() }}</p>
                <p class="text-sm text-gray-500">Rejected</p>
            </div>
        </div>
    </div>

    <!-- Toolbar -->
    <app-page-toolbar>
        <app-search-input (search)="onSearch($event)"></app-search-input>

        <div class="flex items-center gap-3">
            <!-- Status Filter -->
            <select [ngModel]="selectedStatusFilter()"
                (ngModelChange)="selectedStatusFilter.set($event); onFilterChange()"
                class="form-select h-9 text-sm border-gray-200 rounded-lg focus:ring-brand-main focus:border-brand-main">
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="COMPLETED">Completed</option>
            </select>

            <app-sort-dropdown [options]="sortOptions" (sortChange)="onSortChange($event)">
            </app-sort-dropdown>

            <button *ngIf="hasActiveFilters()" (click)="clearFilters()"
                class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Clear
            </button>

            <div class="h-6 w-px bg-gray-200 mx-1"></div>

            <button (click)="loadLoans()" [disabled]="loading()"
                class="p-2 text-gray-500 hover:text-brand-main hover:bg-brand-soft rounded-lg transition-colors"
                title="Refresh">
                <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            </button>

            <a routerLink="/dashboard/loans/apply"
                class="inline-flex items-center gap-2 px-4 py-2 bg-brand-main text-white text-sm font-medium rounded-lg hover:bg-brand-hover shadow-sm transition-all active:scale-95">
                <i class="pi pi-plus"></i> New Loan
            </a>
        </div>
    </app-page-toolbar>

    <!-- Table -->
    <app-card-table>
        <app-table-header [columns]="columns" [hasActions]="true" (sort)="onSort($event)"></app-table-header>

        <!-- Loading -->
        <tr *ngIf="loading()">
            <td colspan="7" class="p-8 text-center text-gray-500">
                <i class="pi pi-spinner pi-spin text-3xl mb-2"></i>
                <p>Loading loans...</p>
            </td>
        </tr>

        <!-- Empty -->
        <tr *ngIf="!loading() && filteredLoans().length === 0">
            <td colspan="7" class="p-12 text-center">
                <app-empty-state [title]="hasActiveFilters() ? 'No loans found' : 'No loans yet'"
                    [message]="hasActiveFilters() ? 'Try adjusting your filters' : 'Create a new loan application to get started'"
                    [actionText]="!hasActiveFilters() ? 'Create Loan' : undefined">
                </app-empty-state>
            </td>
        </tr>

        <!-- Rows -->
        <app-table-row *ngFor="let loan of filteredLoans()">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-900">{{ loan.customerName }}</span>
                    <span class="text-xs text-gray-500">{{ loan.customerEmail }}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ loan.productName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ loan.amountLabel }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ loan.tenorLabel }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ loan.appliedDate | date:'mediumDate' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <app-status-badge [status]="loan.status" [label]="loan.statusLabel"></app-status-badge>
            </td>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2">
                <a [routerLink]="['/dashboard/loans', loan.id]"
                    class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors" title="View">
                    <i class="pi pi-eye"></i>
                </a>
                <button *ngIf="loan.status === 'DRAFT'"
                    (click)="confirmCancel(loan)"
                    class="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors" title="Cancel">
                    <i class="pi pi-times"></i>
                </button>
            </div>
        </app-table-row>

        <!-- Pagination -->
        <app-pagination [page]="currentPage()" [pageSize]="pageSize()" [total]="totalItems()"
            (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
        </app-pagination>
    </app-card-table>
</div>

<!-- Confirmation Modal -->
<app-confirmation-modal [isOpen]="isDeleteModalOpen()" title="Cancel Loan"
    [message]="'Are you sure you want to cancel this loan application?'"
    confirmLabel="Cancel Loan" confirmBtnClass="bg-red-500 hover:bg-red-600" (confirm)="onCancelConfirmed()"
    (close)="isDeleteModalOpen.set(false)">
</app-confirmation-modal>
```

---

## Step 5: Refactor Loan Detail Component

### 5.1 Update TypeScript

**File:** `src/app/features/loans/loan-detail/loan-detail.component.ts`

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanFacade } from '../facades/loan.facade';
import { LoanVM } from '../models/loan.models';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status/status-badge.component';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { LeafletMapComponent } from '../../../shared/components/leaflet-map/leaflet-map.component';
import { EmptyStateComponent } from '../../../shared/components/apple-hig/empty-state/empty-state.component';

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageHeaderComponent,
        CardComponent,
        StatusBadgeComponent,
        LoanActionsComponent,
        LeafletMapComponent,
        EmptyStateComponent
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

    // Check if current user is admin
    isAdmin = () => {
        const user = this.authService.currentUser();
        return user?.roles?.includes('ADMIN') ?? false;
    };

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
```

### 5.2 Update Template

**File:** `src/app/features/loans/loan-detail/loan-detail.component.html`

```html
<div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <app-page-header title="Loan Details" subtitle="View and manage loan application" [showBackButton]="true"
        (back)="goBack()">

        <div actions class="flex gap-3" *ngIf="loan()">
            <button *ngIf="loan()?.status === 'DRAFT' && isAdmin()" 
                (click)="handleAction({type: 'SUBMIT'})"
                class="btn-primary flex items-center gap-2" [disabled]="actionLoading()">
                <i class="pi pi-send"></i> Submit
            </button>
        </div>
    </app-page-header>

    <!-- Loading -->
    <div *ngIf="loading()" class="p-12 flex flex-col items-center justify-center text-gray-500">
        <i class="pi pi-spin pi-spinner text-3xl mb-4 text-brand-main"></i>
        <p>Loading loan details...</p>
    </div>

    <!-- Error -->
    <div *ngIf="error() && !loading()"
        class="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <i class="pi pi-exclamation-triangle text-xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">Error Loading Loan</h3>
        <p class="text-gray-600 mb-4">{{ error() }}</p>
        <button (click)="goBack()" class="btn-secondary">Go Back</button>
    </div>

    <!-- Main Content -->
    <ng-container *ngIf="loan() && !loading()">
        <!-- Loan Identity Card -->
        <app-card>
            <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="w-20 h-20 rounded-2xl bg-brand-soft text-brand-main flex items-center justify-center shadow-inner shrink-0">
                    <span class="text-3xl font-bold">{{ loan()!.customerName.charAt(0) }}</span>
                </div>
                <div class="flex-1 text-center md:text-left">
                    <h2 class="text-2xl font-bold text-gray-900">{{ loan()!.customerName }}</h2>
                    <p class="text-gray-500 text-sm">{{ loan()!.customerEmail }}</p>
                    <p class="text-gray-400 text-xs font-mono mt-1">ID: {{ loan()!.id }}</p>
                </div>
                <div class="shrink-0">
                    <app-status-badge [status]="loan()!.status" [label]="loan()!.statusLabel" size="lg">
                    </app-status-badge>
                </div>
            </div>
        </app-card>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Loan Information -->
            <app-card title="Loan Information" icon="pi-money-bill">
                <div class="space-y-4">
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Product</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.productName }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Amount</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.amountLabel }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Tenure</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.tenorLabel }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Applied Date</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.appliedDate | date:'mediumDate' }}</span>
                    </div>
                </div>
            </app-card>

            <!-- Timeline -->
            <app-card title="Application Timeline" icon="pi-calendar">
                <div class="space-y-4">
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Applied</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.appliedDate | date:'medium' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0" *ngIf="loan()!.submittedAt">
                        <span class="text-gray-500">Submitted</span>
                        <span class="font-semibold text-gray-900">{{ loan()!.submittedAt | date:'medium' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0" *ngIf="loan()!.approvedAt">
                        <span class="text-gray-500">Approved</span>
                        <span class="font-semibold text-green-600">{{ loan()!.approvedAt | date:'medium' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0" *ngIf="loan()!.disbursedAt">
                        <span class="text-gray-500">Disbursed</span>
                        <span class="font-semibold text-purple-600">{{ loan()!.disbursedAt | date:'medium' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0" *ngIf="loan()!.completedAt">
                        <span class="text-gray-500">Completed</span>
                        <span class="font-semibold text-indigo-600">{{ loan()!.completedAt | date:'medium' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0" *ngIf="loan()!.rejectedAt">
                        <span class="text-gray-500">Rejected</span>
                        <span class="font-semibold text-red-600">{{ loan()!.rejectedAt | date:'medium' }}</span>
                    </div>
                </div>
            </app-card>

            <!-- Location -->
            <app-card title="Application Location" icon="pi-map-marker" *ngIf="loan()!.latitude && loan()!.longitude">
                <div class="space-y-4">
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Latitude</span>
                        <span class="font-mono text-gray-900">{{ loan()!.latitude | number:'1.6-6' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-gray-500">Longitude</span>
                        <span class="font-mono text-gray-900">{{ loan()!.longitude | number:'1.6-6' }}</span>
                    </div>
                </div>
                <div class="mt-4">
                    <button (click)="viewLocationOnMap()"
                        class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <i class="pi pi-external-link"></i> View on Map
                    </button>
                </div>
            </app-card>

            <!-- Documents -->
            <app-card title="Documents" icon="pi-file">
                <div *ngIf="!loan()!.documents || loan()!.documents.length === 0" class="text-sm text-gray-500 italic">
                    No documents uploaded.
                </div>
                <div class="space-y-3" *ngIf="loan()!.documents && loan()!.documents!.length > 0">
                    <div *ngFor="let doc of loan()!.documents"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i class="pi pi-file"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">{{ formatDocType(doc.documentType) }}</p>
                                <p class="text-xs text-gray-500">{{ doc.fileName }}</p>
                            </div>
                        </div>
                        <button (click)="viewDocument(doc.id)"
                            class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors" title="View">
                            <i class="pi pi-eye"></i>
                        </button>
                    </div>
                </div>
            </app-card>
        </div>

        <!-- Actions -->
        <app-card title="Actions" icon="pi-cog" *ngIf="loan()">
            <app-loan-actions [loan]="processedLoan()" [loading]="actionLoading()"
                (action)="handleAction($event)">
            </app-loan-actions>
        </app-card>
    </ng-container>
</div>
```

---

## Step 6: Update Directory Structure

```
src/app/features/loans/
├── adapters/
│   └── loan.adapter.ts          [NEW]
├── components/
│   └── loan-actions/
├── facades/
│   └── loan.facade.ts           [NEW - refactor existing]
├── models/
│   └── loan.models.ts           [NEW]
├── loan-application/
├── loan-approval/
├── loan-detail/
│   ├── loan-detail.component.ts      [REFACTOR]
│   ├── loan-detail.component.html     [REFACTOR]
│   └── loan-detail.component.css
├── loan-list/
│   ├── loan-list.component.ts        [REFACTOR]
│   ├── loan-list.component.html      [REFACTOR]
│   └── loan-list.component.css
├── loan-review/
├── marketing-loan-application/
└── loans.routes.ts
```

---

## Summary of Changes

### Loan List
- ✅ Uses `CardTableComponent` instead of raw table
- ✅ Uses `TableHeaderComponent` and `TableRowComponent`
- ✅ Uses `PageHeaderComponent` and `PageToolbarComponent`
- ✅ Stats cards for overview
- ✅ Search, filter, sort, pagination
- ✅ Uses facade pattern with signals
- ✅ Proper loading and empty states
- ✅ Status badge component

### Loan Detail
- ✅ Uses `PageHeaderComponent` with back button
- ✅ Uses `CardComponent` for all sections
- ✅ Uses `StatusBadgeComponent` for status display
- ✅ Proper loading and error states
- ✅ Actions in separate card
- ✅ Clean separation of concerns
- ✅ Refactored template with modern Angular patterns

### New Files
- `models/loan.models.ts` - View model and types
- `adapters/loan.adapter.ts` - Data transformation
- `facades/loan.facade.ts` - Enhanced state management

---

## Files to Modify

1. `src/app/features/loans/models/loan.models.ts` - Create
2. `src/app/features/loans/adapters/loan.adapter.ts` - Create
3. `src/app/features/loans/facades/loan.facade.ts` - Refactor
4. `src/app/features/loans/loan-list/loan-list.component.ts` - Refactor
5. `src/app/features/loans/loan-list/loan-list.component.html` - Refactor
6. `src/app/features/loans/loan-detail/loan-detail.component.ts` - Refactor
7. `src/app/features/loans/loan-detail/loan-detail.component.html` - Refactor
