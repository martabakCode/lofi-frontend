import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNotificationFacade } from '../../facades/admin-notification.facade';
import { NotificationStatsComponent } from '../../components/notification-stats/notification-stats.component';
import { BulkActionsBarComponent } from '../../components/bulk-actions-bar/bulk-actions-bar.component';
import { CreateNotificationModalComponent } from '../../components/create-notification-modal/create-notification-modal.component';
import { NotificationType, NotificationCreateRequest } from '../../../../core/models/notification.models';

@Component({
  selector: 'app-notification-manage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationStatsComponent,
    BulkActionsBarComponent,
    CreateNotificationModalComponent
  ],
  template: `
    <div class="p-6 lg:p-10 space-y-8">
      <!-- Header Area -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-text-primary tracking-tight">Notification Management</h1>
          <p class="text-text-muted mt-1">Monitor, filter, and broadcast notifications across the platform</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            (click)="showCreateModal.set(true)"
            class="flex items-center gap-2 px-6 py-3 bg-brand-main text-white font-bold rounded-2xl hover:bg-brand-hover transition-all active:scale-95 shadow-lg shadow-brand-main/20"
          >
            <i class="pi pi-plus"></i>
            Create New
          </button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <app-notification-stats [stats]="stats()" />

      <!-- Management Table -->
      <div class="bg-bg-surface rounded-3xl border border-border-default shadow-sm overflow-hidden">
        <!-- Toolbar -->
        <div class="p-6 border-b border-border-default flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="relative w-full md:w-96">
            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Search by title, body, or user ID..."
              class="w-full pl-11 pr-4 py-3 bg-bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-soft outline-none transition-all text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <select 
              [(ngModel)]="typeFilter"
              (change)="onFilterChange()"
              class="px-4 py-3 bg-bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-soft outline-none transition-all text-sm font-medium pr-10 text-text-primary"
            >
              <option value="">All Types</option>
              <option value="LOAN">Loans</option>
              <option value="PAYMENT">Payments</option>
              <option value="SYSTEM">System</option>
              <option value="ACCOUNT">Account</option>
            </select>

            <button 
              (click)="refresh()"
              class="p-3 bg-bg-muted text-text-secondary rounded-2xl hover:bg-bg-muted/80 transition-colors"
              title="Refresh data"
            >
              <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
            </button>
          </div>
        </div>

        <!-- Table Content -->
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-bg-muted/30">
                <th class="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    [checked]="isAllSelected()" 
                    (change)="toggleAll()"
                    class="w-5 h-5 rounded-lg border-border-default text-brand-main focus:ring-brand-main transition-all cursor-pointer bg-bg-surface"
                  />
                </th>
                <th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Type & Status</th>
                <th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Message Content</th>
                <th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">User</th>
                <th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Created At</th>
                <th class="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-default">
              @for (item of items(); track item.id) {
                <tr class="hover:bg-bg-muted/30 transition-colors group">
                  <td class="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      [checked]="isSelected(item.id)" 
                      (change)="toggleSelection(item.id)"
                      class="w-5 h-5 rounded-lg border-border-default text-brand-main focus:ring-brand-main transition-all cursor-pointer bg-bg-surface"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <span [ngClass]="getTypeBadgeClass(item.type)" class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {{ item.type }}
                      </span>
                      @if (!item.isRead) {
                        <span class="w-2 h-2 bg-brand-main rounded-full" title="Unread"></span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 max-w-sm">
                    <div class="font-bold text-text-primary truncate">{{ item.title }}</div>
                    <div class="text-sm text-text-muted line-clamp-1">{{ item.body }}</div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-3 py-1 bg-bg-muted text-text-secondary text-xs font-mono rounded-lg">
                      {{ item.userId | slice:0:8 }}...
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                    {{ item.createdAt | date:'MMM d, y, h:mm a' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="deleteItem(item.id)" class="p-2 text-text-muted hover:text-error-text hover:bg-error-bg/20 rounded-xl transition-all">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-border-default flex items-center justify-between bg-bg-muted/20">
          <div class="text-sm text-text-muted">
            Showing <span class="font-bold text-text-primary">{{ (pagination().page - 1) * pagination().pageSize + 1 }}</span>
            to <span class="font-bold text-text-primary">{{ Math.min(pagination().page * pagination().pageSize, pagination().total) }}</span>
            of <span class="font-bold text-text-primary">{{ pagination().total }}</span> items
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              [disabled]="pagination().page === 1"
              (click)="setPage(pagination().page - 1)"
              class="px-4 py-2 bg-bg-surface border border-border-default rounded-xl text-sm font-semibold text-text-primary hover:bg-bg-muted disabled:opacity-50 transition-all active:scale-95"
            >
              Previous
            </button>
            <button 
              [disabled]="pagination().page === pagination().totalPages"
              (click)="setPage(pagination().page + 1)"
              class="px-4 py-2 bg-bg-surface border border-border-default rounded-xl text-sm font-semibold text-text-primary hover:bg-bg-muted disabled:opacity-50 transition-all active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Overlay Components -->
    <app-bulk-actions-bar 
      [count]="selectedCount()" 
      (onMarkRead)="bulkMarkRead()"
      (onDelete)="bulkDelete()"
      (onCancel)="clearSelection()"
    />

    @if (showCreateModal()) {
      <app-create-notification-modal 
        (onClose)="showCreateModal.set(false)"
        (onCreate)="createNotification($event)"
      />
    }
  `
})
export class NotificationManageComponent implements OnInit {
  private facade = inject(AdminNotificationFacade);
  Math = Math;

  items = this.facade.items;
  loading = this.facade.loading;
  pagination = this.facade.pagination;
  stats = this.facade.stats;
  selectedCount = this.facade.totalSelected;
  isAllSelected = this.facade.isAllSelected;

  searchQuery = '';
  typeFilter = '';
  showCreateModal = signal(false);

  ngOnInit(): void {
    this.facade.loadAllNotifications();
    this.facade.loadStats();
  }

  refresh(): void {
    this.facade.loadAllNotifications();
    this.facade.loadStats();
  }

  onSearch(): void {
    this.facade.setFilter('search', this.searchQuery);
  }

  onFilterChange(): void {
    this.facade.setFilter('type', this.typeFilter);
  }

  setPage(page: number): void {
    this.facade.setPage(page);
  }

  isSelected(id: string): boolean {
    return this.facade.selectedIds().includes(id);
  }

  toggleSelection(id: string): void {
    this.facade.toggleSelection(id);
  }

  toggleAll(): void {
    this.facade.toggleAllSelection();
  }

  clearSelection(): void {
    if (this.isAllSelected()) {
      this.facade.toggleAllSelection();
    } else {
      // This is a bit hacky but works for now since toggleAll handles both cases
      this.facade.toggleAllSelection();
      this.facade.toggleAllSelection();
    }
  }

  getTypeBadgeClass(type: NotificationType): string {
    switch (type) {
      case 'LOAN': return 'bg-warning-bg text-warning-text';
      case 'PAYMENT': return 'bg-success-bg text-success-text';
      case 'ACCOUNT': return 'bg-info-bg text-info-text';
      case 'SYSTEM': return 'bg-brand-soft text-brand-main';
      default: return 'bg-bg-muted text-text-muted';
    }
  }

  bulkMarkRead(): void {
    this.facade.bulkMarkAsRead();
  }

  bulkDelete(): void {
    this.facade.bulkDelete();
  }

  deleteItem(id: string): void {
    this.facade.deleteNotification(id);
  }

  createNotification(request: NotificationCreateRequest): void {
    this.facade.createNotification(request);
    this.showCreateModal.set(false);
  }
}
