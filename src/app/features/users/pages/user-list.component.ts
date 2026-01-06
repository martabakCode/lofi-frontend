import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Users</h2>
          <p class="text-surface-500 dark:text-surface-400">Manage your team members and their roles.</p>
        </div>
        <button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <i class="pi pi-plus mr-2"></i> Add User
        </button>
      </header>

      <div class="card bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
        <p-table [value]="users" [rows]="10" [paginator]="true" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Name</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Role</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Status</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-surface-200 dark:bg-surface-700 mr-3"></div>
                  <div>
                    <div class="font-medium text-surface-900 dark:text-surface-0">{{user.name}}</div>
                    <div class="text-xs text-surface-500">{{user.email}}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-surface-600 dark:text-surface-400">{{user.role}}</td>
              <td class="px-6 py-4">
                <span [class]="'px-2 py-1 rounded-full text-xs font-medium ' + (user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-surface-100 text-surface-700')">
                  {{user.status}}
                </span>
              </td>
              <td class="px-6 py-4">
                <button class="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                  <i class="pi pi-pencil"></i>
                </button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class UserListComponent {
  users = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
    { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' }
  ];
}
