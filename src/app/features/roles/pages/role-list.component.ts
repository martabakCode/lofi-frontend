import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role, Permission } from '../../../core/models/rbac.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { DetailModalComponent } from '../../../shared/components/detail-modal/detail-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    SortableHeaderComponent,
    DetailModalComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Roles</h2>
          <p class="text-slate-500 dark:text-slate-400">Manage user roles and their associated permissions.</p>
        </div>
        <a routerLink="/dashboard/roles/new" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Role
        </a>
      </header>

      <!-- Search -->
      <div class="card p-4">
        <div class="flex gap-4">
          <div class="relative flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></i>
            <input 
              type="text" 
              placeholder="Search roles..." 
              (input)="onSearch($event)"
              class="form-input pl-10 w-full"
              [value]="searchQuery()" />
          </div>
          <button 
            (click)="exportRoles()"
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
          <h3 class="text-lg font-semibold m-0">All Roles</h3>
          <span class="text-sm text-text-muted">{{ roles().length }} roles found</span>
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
                  Role Name
                </app-sortable-header>
                <th>Permissions</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr *ngIf="isLoading()">
                <td colspan="3" class="loading-cell">
                  <div class="loading-spinner">
                    <i class="pi pi-spin pi-spinner"></i>
                    <span>Loading roles...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr *ngIf="!isLoading() && roles().length === 0">
                <td colspan="3" class="empty-cell">
                  <div class="empty-state">
                    <i class="pi pi-shield"></i>
                    <span>No roles found</span>
                    <p>Click "Add Role" to create one</p>
                  </div>
                </td>
              </tr>

              <!-- Data -->
              <tr *ngFor="let role of roles()" class="data-row">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-brand-soft text-brand-main flex items-center justify-center font-bold">
                      {{ role.name.charAt(0) }}
                    </div>
                    <span class="font-medium text-text-primary">{{ role.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let perm of role.permissions" class="badge badge-info text-xs">
                      {{ perm.name || perm }}
                    </span>
                    <span *ngIf="!role.permissions || role.permissions.length === 0" class="text-text-muted italic text-sm">No permissions</span>
                  </div>
                </td>
                <td class="actions-cell">
                  <button class="btn-action view" (click)="viewRoleDetail(role)" title="View Details">
                    <i class="pi pi-eye"></i>
                  </button>
                  <a [routerLink]="['/dashboard/roles', role.id, 'edit']" class="btn-action edit" title="Edit">
                    <i class="pi pi-pencil"></i>
                  </a>
                  <button class="btn-action delete" (click)="confirmDelete(role)" title="Delete">
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

    <!-- Detail Modal -->
    <app-detail-modal 
      [isOpen]="isDetailModalOpen()" 
      [title]="(selectedRole()?.name || '') + ' - Role Details'"
      (close)="closeDetailModal()">
      
      <div *ngIf="selectedRole()" class="space-y-6">
        <!-- Role Info -->
        <div class="pb-4 border-b border-border-default">
          <h3 class="text-xl font-bold text-text-primary">{{ selectedRole()!.name }}</h3>
          <p class="text-text-muted">{{ selectedRole()!.description || 'No description' }}</p>
        </div>

        <!-- Permissions -->
        <div class="space-y-3">
          <h4 class="font-semibold text-text-primary flex items-center gap-2">
            <i class="pi pi-shield text-brand-main"></i>
            Assigned Permissions ({{ selectedRole()!.permissions.length || 0 }})
          </h4>
          
          <div *ngIf="selectedRole()!.permissions.length === 0" class="text-text-muted italic">
            No permissions assigned to this role.
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let perm of selectedRole()!.permissions" 
                  class="px-3 py-1 rounded-full text-sm font-medium bg-brand-soft text-brand-main">
              {{ perm.name || perm }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-border-default">
          <button (click)="closeDetailModal()" class="btn-secondary">Close</button>
          <button (click)="closeDetailModal(); editRole(selectedRole()!)" class="btn-primary">
            <i class="pi pi-pencil mr-2"></i>Edit Role
          </button>
        </div>
      </div>
    </app-detail-modal>

    <!-- Delete Confirmation -->
    <app-confirmation-modal
      [isOpen]="isDeleteModalOpen()"
      title="Delete Role"
      [message]="'Are you sure you want to delete ' + (roleToDelete()?.name || '') + '? This action cannot be undone.'"
      confirmLabel="Delete"
      confirmBtnClass="bg-red-500 hover:bg-red-600"
      (confirm)="onDeleteConfirmed()"
      (close)="isDeleteModalOpen.set(false)">
    </app-confirmation-modal>
  `
})
export class RoleListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Data signals
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
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

  // Detail modal
  isDetailModalOpen = signal(false);
  selectedRole = signal<Role | null>(null);

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  roleToDelete = signal<Role | null>(null);

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
      this.loadRoles();
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.isLoading.set(true);

    const sort = `${this.sortField()},${this.sortDirection()}`;

    this.rbacService.getRoles({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort,
      search: this.searchQuery() || undefined
    }).subscribe({
      next: (response) => {
        this.roles.set(response.items);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('Failed to load roles', 'error');
      }
    });
  }

  loadPermissions() {
    this.rbacService.getAllPermissions().subscribe({
      next: (data) => this.allPermissions.set(data),
      error: () => this.toastService.show('Failed to load permissions', 'error')
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadRoles();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadRoles();
  }

  onSort(sortConfig: SortConfig) {
    this.sortField.set(sortConfig.field);
    this.sortDirection.set(sortConfig.direction);
    this.loadRoles();
  }

  viewRoleDetail(role: Role) {
    this.selectedRole.set(role);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.selectedRole.set(null);
  }

  confirmDelete(role: Role) {
    this.roleToDelete.set(role);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirmed() {
    const role = this.roleToDelete();
    if (!role) return;

    this.rbacService.deleteRole(role.id).subscribe({
      next: () => {
        this.toastService.show('Role deleted successfully', 'success');
        this.loadRoles();
        this.isDeleteModalOpen.set(false);
        this.roleToDelete.set(null);
      },
      error: () => {
        this.toastService.show('Failed to delete role', 'error');
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  exportRoles() {
    this.isExporting.set(true);

    this.rbacService.getRoles({
      pageSize: 1000,
      search: this.searchQuery() || undefined
    }).subscribe({
      next: (response) => {
        this.downloadCsv(response.items);
        this.isExporting.set(false);
      },
      error: () => {
        this.toastService.show('Failed to export roles', 'error');
        this.isExporting.set(false);
      }
    });
  }

  private downloadCsv(data: Role[]) {
    const headers = ['Name', 'Description', 'Permissions'];
    const rows = data.map(r => [
      r.name,
      r.description || '',
      r.permissions?.map(p => p.name).join('; ') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roles-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.show('Roles exported successfully', 'success');
  }

  editRole(role: Role) {
    this.router.navigate(['/dashboard/roles', role.id, 'edit']);
  }
}
