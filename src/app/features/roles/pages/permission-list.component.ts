import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../core/models/rbac.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    SortableHeaderComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Permissions</h2>
          <p class="text-slate-500 dark:text-slate-400">Define fine-grained access levels.</p>
        </div>
        <a routerLink="/dashboard/roles/permissions/new" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Permission
        </a>
      </header>

      <!-- Search -->
      <div class="card p-4">
        <div class="flex gap-4">
          <div class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></i>
            <input 
              type="text" 
              placeholder="Search permissions..." 
              (input)="onSearch($event)"
              class="form-input pl-10 w-full"
              [value]="searchQuery()" />
          </div>
          <button 
            (click)="exportPermissions()"
            [disabled]="isExporting()"
            class="btn-secondary">
            <i class="pi pi-download mr-2" [class.pi-spin]="isExporting()"></i>
            Export
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold m-0">All Permissions</h3>
          <span class="text-sm text-text-muted">{{ totalItems() }} permissions found</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <app-sortable-header 
                  field="name" 
                  [sortField]="sortField()" 
                  [sortDirection]="sortDirection()"
                  (sort)="onSort($event)">
                  Name
                </app-sortable-header>
                <th>Description</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr *ngIf="isLoading()">
                <td colspan="3" class="loading-cell">
                  <div class="loading-spinner">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Loading permissions...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr *ngIf="!isLoading() && permissions().length === 0">
                <td colspan="3" class="empty-cell">
                  <div class="empty-state">
                    <i class="pi pi-key"></i>
                    <span>No permissions found</span>
                    <p>Click "Add Permission" to create one</p>
                  </div>
                </td>
              </tr>

              <!-- Data -->
              <tr *ngFor="let permission of permissions()" class="data-row">
                <td>
                  <span class="badge badge-info font-mono uppercase">
                    {{ permission.name }}
                  </span>
                </td>
                <td class="text-text-secondary">{{ permission.description }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/dashboard/roles/permissions', permission.id, 'edit']" class="btn-action edit" title="Edit">
                    <i class="pi pi-pencil"></i>
                  </a>
                  <button class="btn-action delete" (click)="confirmDelete(permission)" title="Delete">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <app-pagination 
          [page]="currentPage()"
          [pageSize]="pageSize()"
          [total]="totalItems()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)">
        </app-pagination>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <app-confirmation-modal
      [isOpen]="isDeleteModalOpen()"
      title="Delete Permission"
      [message]="'Are you sure you want to delete ' + (permissionToDelete()?.name || '') + '? This action cannot be undone.'"
      confirmLabel="Delete"
      confirmBtnClass="bg-red-500 hover:bg-red-600"
      (confirm)="onDeleteConfirmed()"
      (close)="isDeleteModalOpen.set(false)">
    </app-confirmation-modal>
  `
})
export class PermissionListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);

  // Data signals
  permissions = signal<Permission[]>([]);
  isLoading = signal(false);
  totalItems = signal(0);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);

  // Sorting
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Search
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  permissionToDelete = signal<Permission | null>(null);

  // Export
  isExporting = signal(false);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadPermissions();
    });
  }

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.isLoading.set(true);

    const sort = `${this.sortField()},${this.sortDirection()}`;

    this.rbacService.getPermissions({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort,
      search: this.searchQuery() || undefined
    }).subscribe({
      next: (response) => {
        this.permissions.set(response.items);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('Failed to load permissions', 'error');
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPermissions();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPermissions();
  }

  onSort(sortConfig: SortConfig) {
    this.sortField.set(sortConfig.field);
    this.sortDirection.set(sortConfig.direction);
    this.loadPermissions();
  }

  confirmDelete(permission: Permission) {
    this.permissionToDelete.set(permission);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirmed() {
    const permission = this.permissionToDelete();
    if (!permission) return;

    this.rbacService.deletePermission(permission.id).subscribe({
      next: () => {
        this.toastService.show('Permission deleted successfully', 'success');
        this.loadPermissions();
        this.isDeleteModalOpen.set(false);
        this.permissionToDelete.set(null);
      },
      error: () => {
        this.toastService.show('Failed to delete permission', 'error');
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  exportPermissions() {
    this.isExporting.set(true);

    this.rbacService.getPermissions({
      pageSize: 1000,
      search: this.searchQuery() || undefined
    }).subscribe({
      next: (response) => {
        this.downloadCsv(response.items);
        this.isExporting.set(false);
      },
      error: () => {
        this.toastService.show('Failed to export permissions', 'error');
        this.isExporting.set(false);
      }
    });
  }

  private downloadCsv(data: Permission[]) {
    const headers = ['Name', 'Description'];
    const rows = data.map(p => [p.name, p.description]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.show('Permissions exported successfully', 'success');
  }
}
