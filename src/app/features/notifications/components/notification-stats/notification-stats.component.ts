import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStats } from '../../../../core/models/notification.models';

@Component({
  selector: 'app-notification-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Total Notifications -->
      <div class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-muted uppercase tracking-wider">Total</span>
          <div class="w-10 h-10 bg-info-bg rounded-xl flex items-center justify-center">
            <i class="pi pi-bell text-info-text"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-text-primary">{{ stats?.total || 0 }}</h3>
        </div>
      </div>

      <!-- Unread -->
      <div class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-muted uppercase tracking-wider">Unread</span>
          <div class="w-10 h-10 bg-warning-bg rounded-xl flex items-center justify-center">
            <i class="pi pi-envelope text-warning-text"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-text-primary">{{ stats?.unread || 0 }}</h3>
          <span class="text-xs text-warning-text font-semibold">
            {{ getPercentage(stats?.unread, stats?.total) }}%
          </span>
        </div>
      </div>

      <!-- System Items -->
      <div class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-muted uppercase tracking-wider">System</span>
          <div class="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
            <i class="pi pi-cog text-brand-main"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-text-primary">{{ stats?.byType?.SYSTEM || 0 }}</h3>
        </div>
      </div>

      <!-- Loan Related -->
      <div class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-muted uppercase tracking-wider">Loans</span>
          <div class="w-10 h-10 bg-success-bg rounded-xl flex items-center justify-center">
            <i class="pi pi-wallet text-success-text"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-text-primary">{{ stats?.byType?.LOAN || 0 }}</h3>
        </div>
      </div>
    </div>
  `
})
export class NotificationStatsComponent {
  @Input() stats: NotificationStats | null = null;

  getPercentage(value: number | undefined, total: number | undefined): number {
    if (!value || !total) return 0;
    return Math.round((value / total) * 100);
  }
}
