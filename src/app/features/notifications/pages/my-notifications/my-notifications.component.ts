import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserNotificationFacade } from '../../facades/user-notification.facade';
import { NotificationCardComponent } from '../../components/notification-card/notification-card.component';

@Component({
  selector: 'app-my-notifications',
  standalone: true,
  imports: [CommonModule, NotificationCardComponent],
  template: `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-text-primary tracking-tight">My Notifications</h1>
          <p class="text-text-muted mt-1">Stay updated with your account activity</p>
        </div>
        
        @if (unreadCount() > 0) {
          <button 
            (click)="markAllAsRead()"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-main bg-brand-soft hover:bg-brand-soft/20 rounded-xl transition-all active:scale-95"
          >
            <i class="pi pi-check-circle"></i>
            Mark all as read
          </button>
        }
      </div>

      <!-- Content State -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-24 bg-bg-muted animate-pulse rounded-2xl"></div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 bg-bg-surface rounded-3xl border-2 border-dashed border-border-default">
          <div class="w-20 h-20 bg-bg-muted rounded-full flex items-center justify-center mb-4">
            <i class="pi pi-bell text-4xl text-text-muted opacity-50"></i>
          </div>
          <h3 class="text-xl font-bold text-text-primary">All caught up!</h3>
          <p class="text-text-muted mt-2">You don't have any notifications right now.</p>
        </div>
      } @else {
        <!-- Notification Groups (Simplified for now - flat list) -->
        <div class="space-y-1">
          @for (notification of items(); track notification.id) {
            <app-notification-card 
              [notification]="notification"
              (onView)="viewNotification($event)"
              (onMarkRead)="markAsRead($event)"
            />
          }
        </div>

        <!-- Load More / Simple Pagination could go here -->
      }
    </div>
  `
})
export class MyNotificationsComponent implements OnInit {
  private facade = inject(UserNotificationFacade);

  items = this.facade.items;
  loading = this.facade.loading;
  unreadCount = this.facade.unreadCount;

  ngOnInit(): void {
    this.facade.loadMyNotifications();
  }

  markAsRead(id: string): void {
    this.facade.markAsRead(id);
  }

  markAllAsRead(): void {
    this.facade.markAllAsRead();
  }

  viewNotification(id: string): void {
    this.facade.viewNotification(id);
  }
}
