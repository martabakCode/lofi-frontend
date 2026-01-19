import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, Branch } from '../../../core/models/rbac.models';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  searchQuery = signal<string>('');
  isExporting = signal(false);

  isDeleteModalOpen = false;
  userToDelete: User | null = null;

  activeUserCount = computed(() =>
    this.users().filter(u => this.getUserStatus(u) === 'Active').length
  );

  inactiveUserCount = computed(() =>
    this.users().filter(u => this.getUserStatus(u) === 'Inactive').length
  );

  onSearch(query: Event) {
    const value = (query.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(value);
  }

  filteredUsers = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.users();
    return this.users().filter(u =>
      u.fullName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query)
    );
  });

  exportUsers() {
    this.isExporting.set(true);
    const data = this.filteredUsers();
    if (data.length === 0) {
      this.isExporting.set(false);
      return;
    }

    this.downloadCsv(data);
    this.isExporting.set(false);
  }

  private downloadCsv(data: User[]) {
    const headers = ['Full Name', 'Username', 'Email', 'Role', 'Branch', 'Status'];
    const rows = data.map(u => [
      u.fullName,
      u.username,
      u.email,
      this.getRoleNames(u),
      u.branch ? u.branch.name : '-',
      this.getUserStatus(u)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  ngOnInit() {
    this.loadData();
  }

  loadUsers() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      users: this.rbacService.getUsers(),
      branches: this.rbacService.getBranches()
    }).subscribe({
      next: (data) => {
        this.users.set(data.users || []);
        this.branches.set(data.branches || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
        this.toastService.show('Failed to load data', 'error');
        this.error.set('Failed to load user data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  openInviteModal() {
    const fullName = prompt('Enter Full Name:');
    if (!fullName) return;
    const email = prompt('Enter Email:');
    if (!email) return;

    let branchId = '';
    const activeBranches = this.branches();
    if (activeBranches.length > 0) {
      const branchOptions = activeBranches.map((b, i) => `${i + 1}. ${b.name}`).join('\n');
      const choice = prompt(`Assign to Branch (Enter number):\n${branchOptions}`, '1');
      if (choice) {
        const idx = parseInt(choice) - 1;
        if (activeBranches[idx]) branchId = activeBranches[idx].id;
      }
    }

    this.loading.set(true);
    this.rbacService.createUser({
      fullName,
      email,
      username: email,
      branchId
    } as any).subscribe({
      next: () => {
        this.toastService.show('User invited successfully', 'success');
        this.loadData();
      },
      error: (err) => {
        this.loading.set(false);
        // Error interceptor might handle global errors, but we can prevent duplicate toasts or handle specifics
        if (err.status !== 400 && err.status !== 401 && err.status !== 403 && err.status !== 500) {
          this.toastService.show('Failed to invite user', 'error');
        }
      }
    });
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  onDeleteConfirmed() {
    if (!this.userToDelete) return;

    this.loading.set(true);
    // Assuming backend returns void or simple response
    this.rbacService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.toastService.show('User deleted successfully', 'success');
        this.loadData();
        this.isDeleteModalOpen = false;
        this.userToDelete = null;
      },
      error: (err) => {
        this.loading.set(false);
        this.isDeleteModalOpen = false; // Close modal on error too/preserve it? Usually preserve to retry, but for now close.
        if (err.status !== 400 && err.status !== 401 && err.status !== 403 && err.status !== 500) {
          this.toastService.show('Failed to delete user', 'error');
        }
      }
    });
  }

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
}
