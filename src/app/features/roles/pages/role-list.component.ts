import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role, Permission, UpdateRoleRequest, CreateRoleRequest } from '../../../core/models/rbac.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { DetailModalComponent } from '../../../shared/components/detail-modal/detail-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Role
        </button>
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
                  Role Name
                </app-sortable-header>
                <th class="px-6 py-4">Permissions</th>
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
              <tr *ngIf="!isLoading() && roles().length === 0">
                <td colspan="3" class="px-6 py-8 text-center text-slate-500">
                  No roles found.
                </td>
              </tr>

              <!-- Data -->
              <tr *ngFor="let role of roles()" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{role.name}}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let perm of role.permissions" class="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-600">
                      {{perm.name}}
                    </span>
                    <span *ngIf="!role.permissions || role.permissions.length === 0" class="text-slate-400 italic text-sm">No permissions</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button (click)="viewRoleDetail(role)" 
                      class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all flex items-center justify-center"
                      title="View Details">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button (click)="editRole(role)" 
                      class="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all flex items-center justify-center"
                      title="Edit">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button (click)="confirmDelete(role)" 
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
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{isEdit ? 'Edit Role' : 'New Role'}}</h3>
            <button (click)="closeDialog()" class="text-slate-400 hover:text-slate-600">
              <i class="pi pi-times"></i>
            </button>
        </div>
        
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="p-6 space-y-4">
            <div class="space-y-1">
                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Role Name</label>
                <input id="name" formControlName="name" placeholder="ROLE_ADMIN" 
                    [readonly]="isEdit"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" [class.bg-slate-100]="isEdit" />
            </div>

            <div class="space-y-1">
                <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input id="description" formControlName="description" placeholder="Role description..." 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign Permissions</label>
                <div class="border border-slate-300 dark:border-slate-600 rounded-lg p-2 h-48 overflow-y-auto space-y-1">
                    <label *ngFor="let perm of allPermissions()" class="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                        <input type="checkbox" 
                            [checked]="hasPermission(perm)" 
                            (change)="togglePermission(perm, $event)"
                            class="rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                        <span class="text-sm text-slate-700 dark:text-slate-300">{{perm.name}}</span>
                    </label>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="btn-secondary" (click)="closeDialog()">Cancel</button>
                <button type="submit" 
                    [disabled]="roleForm.invalid || isSaving()"
                    class="btn-primary flex items-center gap-2">
                    <i *ngIf="isSaving()" class="pi pi-spin pi-spinner"></i>
                    Save
                </button>
            </div>
        </form>
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
            Assigned Permissions ({{ selectedRole()!.permissions?.length || 0 }})
          </h4>
          
          <div *ngIf="selectedRole()!.permissions?.length === 0" class="text-text-muted italic">
            No permissions assigned to this role.
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let perm of selectedRole()!.permissions" 
                  class="px-3 py-1 rounded-full text-sm font-medium bg-brand-soft text-brand-main">
              {{ perm.name }}
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
  private fb = inject(FormBuilder);

  // Data signals
  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
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

  // Detail modal
  isDetailModalOpen = signal(false);
  selectedRole = signal<Role | null>(null);

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  roleToDelete = signal<Role | null>(null);

  // Export
  isExporting = signal(false);

  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    permissions: [[] as Permission[]]
  });

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

  openNew() {
    this.isEdit = false;
    this.selectedId = null;
    this.roleForm.reset({ permissions: [] });
    this.displayDialog = true;
  }

  editRole(role: Role) {
    this.isEdit = true;
    this.selectedId = role.id;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    this.displayDialog = true;
  }

  viewRoleDetail(role: Role) {
    this.selectedRole.set(role);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.selectedRole.set(null);
  }

  closeDialog() {
    this.displayDialog = false;
    this.isEdit = false;
    this.selectedId = null;
    this.roleForm.reset({ permissions: [] });
  }

  hasPermission(perm: Permission): boolean {
    const currentPerms = this.roleForm.value.permissions as Permission[];
    return currentPerms?.some(p => p.id === perm.id) || false;
  }

  togglePermission(perm: Permission, event: any) {
    const checked = event.target.checked;
    const currentPerms = (this.roleForm.value.permissions as Permission[]) || [];

    let newPerms: Permission[];
    if (checked) {
      newPerms = [...currentPerms, perm];
    } else {
      newPerms = currentPerms.filter(p => p.id !== perm.id);
    }

    this.roleForm.patchValue({ permissions: newPerms });
  }

  saveRole() {
    if (this.roleForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.roleForm.value;
    const permissions = (formValue.permissions as Permission[]) || [];
    const permissionIds = permissions.map(p => p.id);

    if (this.isEdit && this.selectedId) {
      const updateData: UpdateRoleRequest = {
        description: formValue.description || undefined,
        permissionIds: permissionIds
      };
      this.rbacService.updateRole(this.selectedId, updateData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeDialog();
          this.toastService.show('Role updated successfully', 'success');
          this.loadRoles();
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.show('Failed to update role', 'error');
        }
      });
    } else {
      const createData: CreateRoleRequest = {
        name: formValue.name || '',
        description: formValue.description || undefined,
        permissionIds: permissionIds
      };
      this.rbacService.createRole(createData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeDialog();
          this.toastService.show('Role created successfully', 'success');
          this.loadRoles();
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.show('Failed to create role', 'error');
        }
      });
    }
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
}
