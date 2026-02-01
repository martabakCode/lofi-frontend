import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Permission
        </button>
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
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <app-sortable-header 
                  field="name" 
                  [sortField]="sortField()" 
                  [sortDirection]="sortDirection()"
                  (sort)="onSort($event)">
                  Name
                </app-sortable-header>
                <th class="px-6 py-4">Description</th>
                <th class="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <!-- Loading -->
              <tr *ngIf="isLoading()">
                <td colspan="3" class="px-6 py-8 text-center text-slate-500">
                  <i class="pi pi-spin pi-spinner mr-2"></i>Loading...
                </td>
              </tr>

              <!-- Empty -->
              <tr *ngIf="!isLoading() && permissions().length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-slate-500">
                  No permissions found.
                </td>
              </tr>

              <!-- Data -->
              <tr *ngFor="let permission of permissions()" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded text-xs font-mono font-bold uppercase">
                    {{permission.name}}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{permission.description}}</td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button (click)="editPermission(permission)" 
                      class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all flex items-center justify-center"
                      title="Edit">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button (click)="confirmDelete(permission)" 
                      class="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center justify-center"
                      title="Delete">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <app-pagination 
          [currentPageValue]="currentPage()"
          [pageSizeValue]="pageSize()"
          [totalItemsValue]="totalItems()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)">
        </app-pagination>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="displayDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="closeDialog()"></div>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{isEdit ? 'Edit Permission' : 'New Permission'}}</h3>
            <button (click)="closeDialog()" class="text-slate-400 hover:text-slate-600">
              <i class="pi pi-times"></i>
            </button>
        </div>
        
        <form [formGroup]="permissionForm" (ngSubmit)="savePermission()" class="p-6 space-y-4">
            <div class="space-y-1">
                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Permission Name</label>
                <input id="name" formControlName="name" placeholder="READ_USERS" 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
                <p class="text-xs text-slate-500">Should be uppercase with underscores.</p>
            </div>

            <div class="space-y-1">
                <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input id="description" formControlName="description" placeholder="Ability to view user list" 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="btn-secondary" (click)="closeDialog()">Cancel</button>
                <button type="submit" 
                    [disabled]="permissionForm.invalid || isSaving()"
                    class="btn-primary flex items-center gap-2">
                    <i *ngIf="isSaving()" class="pi pi-spin pi-spinner"></i>
                    Save
                </button>
            </div>
        </form>
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
  private fb = inject(FormBuilder);

  // Data signals
  permissions = signal<Permission[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
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

  // Modal state
  displayDialog = false;
  isEdit = false;
  selectedId: string | null = null;

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  permissionToDelete = signal<Permission | null>(null);

  // Export
  isExporting = signal(false);

  permissionForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
    description: ['', Validators.required]
  });

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

  openNew() {
    this.isEdit = false;
    this.selectedId = null;
    this.permissionForm.reset();
    this.displayDialog = true;
  }

  editPermission(permission: Permission) {
    this.isEdit = true;
    this.selectedId = permission.id;
    this.permissionForm.patchValue(permission);
    this.displayDialog = true;
  }

  closeDialog() {
    this.displayDialog = false;
    this.isEdit = false;
    this.selectedId = null;
    this.permissionForm.reset();
  }

  savePermission() {
    if (this.permissionForm.invalid) return;

    this.isSaving.set(true);
    const data = this.permissionForm.value as Partial<Permission>;

    if (this.isEdit && this.selectedId) {
      this.rbacService.updatePermission(this.selectedId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeDialog();
          this.toastService.show('Permission updated successfully', 'success');
          this.loadPermissions();
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.show('Failed to update permission', 'error');
        }
      });
    } else {
      this.rbacService.createPermission(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeDialog();
          this.toastService.show('Permission created successfully', 'success');
          this.loadPermissions();
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.show('Failed to create permission', 'error');
        }
      });
    }
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
