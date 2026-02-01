import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, Branch, Role } from '../../../core/models/rbac.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { DetailModalComponent } from '../../../shared/components/detail-modal/detail-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PaginationComponent,
    SortableHeaderComponent,
    DetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);

  // Data signals
  users = signal<User[]>([]);
  branches = signal<Branch[]>([]);
  roles = signal<Role[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalItems = signal(0);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);

  // Sorting
  sortField = signal('fullName');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Search
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  // Filters
  selectedRoleFilter = signal<string>('');
  selectedBranchFilter = signal<string>('');
  selectedStatusFilter = signal<string>('');

  // Modal states
  isDetailModalOpen = signal(false);
  selectedUser = signal<User | null>(null);

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  userToDelete = signal<User | null>(null);

  // Role management modal
  isRoleModalOpen = signal(false);
  selectedRoles = signal<string[]>([]);
  isSavingRoles = signal(false);

  // Export
  isExporting = signal(false);

  constructor() {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadFilters();
  }

  loadData() {
    this.loadUsers();
  }

  loadFilters() {
    // Load branches and roles for filters
    forkJoin({
      branches: this.rbacService.getAllBranches(),
      roles: this.rbacService.getAllRoles()
    }).subscribe({
      next: (data) => {
        this.branches.set(data.branches);
        this.roles.set(data.roles);
      },
      error: () => {
        this.toastService.show('Failed to load filter data', 'error');
      }
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    const sort = `${this.sortField()},${this.sortDirection()}`;

    this.rbacService.getUsers({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort,
      search: this.searchQuery() || undefined,
      role: this.selectedRoleFilter() || undefined,
      branch: this.selectedBranchFilter() || undefined,
      status: this.selectedStatusFilter() || undefined
    }).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.toastService.show('Failed to load users', 'error');
        this.error.set('Failed to load user data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSort(sortConfig: SortConfig) {
    this.sortField.set(sortConfig.field);
    this.sortDirection.set(sortConfig.direction);
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters() {
    this.selectedRoleFilter.set('');
    this.selectedBranchFilter.set('');
    this.selectedStatusFilter.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Computed values
  activeUserCount = computed(() =>
    this.users().filter(u => this.getUserStatus(u) === 'Active').length
  );

  inactiveUserCount = computed(() =>
    this.users().filter(u => this.getUserStatus(u) === 'Inactive').length
  );

  hasActiveFilters = computed(() => {
    return this.selectedRoleFilter() ||
      this.selectedBranchFilter() ||
      this.selectedStatusFilter() ||
      this.searchQuery();
  });

  // Detail modal
  openDetailModal(user: User) {
    this.selectedUser.set(user);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.selectedUser.set(null);
  }

  // Delete functionality
  confirmDelete(user: User) {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirmed() {
    const user = this.userToDelete();
    if (!user) return;

    this.rbacService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.show('User deleted successfully', 'success');
        this.loadUsers();
        this.isDeleteModalOpen.set(false);
        this.userToDelete.set(null);
      },
      error: () => {
        this.toastService.show('Failed to delete user', 'error');
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  // Role management
  openRoleModal(user: User) {
    this.selectedUser.set(user);
    this.selectedRoles.set(user.roles?.map(r => typeof r === 'string' ? r : r.id) || []);
    this.isRoleModalOpen.set(true);
  }

  closeRoleModal() {
    this.isRoleModalOpen.set(false);
    this.selectedUser.set(null);
    this.selectedRoles.set([]);
  }

  toggleRole(roleId: string) {
    const current = this.selectedRoles();
    if (current.includes(roleId)) {
      this.selectedRoles.set(current.filter(id => id !== roleId));
    } else {
      this.selectedRoles.set([...current, roleId]);
    }
  }

  hasRole(roleId: string): boolean {
    return this.selectedRoles().includes(roleId);
  }

  saveRoles() {
    const user = this.selectedUser();
    if (!user) return;

    this.isSavingRoles.set(true);
    this.rbacService.updateUser(user.id, {
      roles: this.selectedRoles().map(id => ({ id } as Role))
    }).subscribe({
      next: () => {
        this.toastService.show('Roles updated successfully', 'success');
        this.isSavingRoles.set(false);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: () => {
        this.toastService.show('Failed to update roles', 'error');
        this.isSavingRoles.set(false);
      }
    });
  }

  // Export functionality
  exportUsers() {
    this.isExporting.set(true);

    // Get all users for export
    this.rbacService.getUsers({
      pageSize: 1000,
      search: this.searchQuery() || undefined,
      role: this.selectedRoleFilter() || undefined,
      branch: this.selectedBranchFilter() || undefined,
      status: this.selectedStatusFilter() || undefined
    }).subscribe({
      next: (response) => {
        this.downloadCsv(response.items);
        this.isExporting.set(false);
      },
      error: () => {
        this.toastService.show('Failed to export users', 'error');
        this.isExporting.set(false);
      }
    });
  }

  private downloadCsv(data: User[]) {
    const headers = ['Full Name', 'Username', 'Email', 'Phone', 'Role', 'Branch', 'Status'];
    const rows = data.map(u => [
      u.fullName,
      u.username,
      u.email,
      u.phone || '-',
      this.getRoleNames(u),
      u.branch ? u.branch.name : '-',
      this.getUserStatus(u)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.show('Users exported successfully', 'success');
  }

  // Helper methods
  getUserStatus(user: User): 'Active' | 'Inactive' {
    return user.status || 'Active';
  }

  getRoleNames(user: User): string {
    if (!user.roles || user.roles.length === 0) return 'No Role';
    return user.roles.map(r => {
      const name = typeof r === 'string' ? r : r.name;
      return name ? name.replace('ROLE_', '') : 'Unknown';
    }).join(', ');
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getRoleColor(role: any): string {
    if (!role) return 'default';
    const roleName = typeof role === 'string' ? role : role.name;
    if (!roleName) return 'default';

    const colors: Record<string, string> = {
      'ADMIN': 'admin',
      'SUPER_ADMIN': 'superadmin',
      'MARKETING': 'marketing',
      'BRANCH_MANAGER': 'manager',
      'BACK_OFFICE': 'backoffice',
      'CUSTOMER': 'customer'
    };
    const cleanName = roleName.replace('ROLE_', '');
    return colors[cleanName] || 'default';
  }

  getRoleDisplayName(role: any): string {
    if (!role) return 'Unknown';
    const name = typeof role === 'string' ? role : role.name;
    return name ? name.replace('ROLE_', '').replace('_', ' ') : 'Unknown';
  }

  getRoleBadgeClass(role: any): string {
    const color = this.getRoleColor(role);
    const classes: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700',
      'superadmin': 'bg-red-100 text-red-700',
      'marketing': 'bg-green-100 text-green-700',
      'manager': 'bg-blue-100 text-blue-700',
      'backoffice': 'bg-orange-100 text-orange-700',
      'customer': 'bg-gray-100 text-gray-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return classes[color] || classes['default'];
  }
}
