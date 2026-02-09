import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationType } from '../../../../core/models/notification.models';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class.opacity-70]="notification.isRead"
      class="relative flex gap-4 p-4 mb-3 transition-all duration-300 ease-in-out bg-bg-surface border border-border-default shadow-sm rounded-2xl hover:shadow-md active:scale-[0.98] cursor-pointer group"
      (click)="onView.emit(notification.id)"
    >
      <!-- Unread Indicator -->
      @if (!notification.isRead) {
        <div class="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-main rounded-full"></div>
      }

      <!-- Icon Section -->
      <div [ngClass]="getIconBgClass(notification.type)" class="flex items-center justify-center w-12 h-12 rounded-xl shrink-0">
        <i [class]="getIconClass(notification.type)" class="text-xl"></i>
      </div>

      <!-- Content Section -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-1">
          <h4 class="text-base font-semibold text-text-primary truncate pr-6">
            {{ notification.title }}
          </h4>
        </div>
        <p class="mb-2 text-sm text-text-secondary line-clamp-2">
          {{ notification.body }}
        </p>
        <div class="flex items-center gap-3 text-xs text-text-muted">
          <span class="flex items-center gap-1">
            <i class="pi pi-clock"></i>
            {{ formatTime(notification.createdAt) }}
          </span>
          <span class="px-2 py-0.5 rounded-full bg-bg-muted text-text-secondary uppercase font-medium tracking-wider">
            {{ notification.type }}
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        @if (!notification.isRead) {
          <button 
            (click)="$event.stopPropagation(); onMarkRead.emit(notification.id)"
            class="p-2 text-brand-main rounded-lg hover:bg-brand-soft focus:ring-2 focus:ring-brand-soft outline-none transition-colors"
            title="Mark as read"
          >
            <i class="pi pi-check-circle"></i>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NotificationCardComponent {
  @Input({ required: true }) notification!: Notification;
  @Output() onView = new EventEmitter<string>();
  @Output() onMarkRead = new EventEmitter<string>();

  getIconClass(type: NotificationType): string {
    switch (type) {
      case 'LOAN': return 'pi pi-wallet text-warning-text';
      case 'PAYMENT': return 'pi pi-credit-card text-success-text';
      case 'ACCOUNT': return 'pi pi-user text-info-text';
      case 'SYSTEM': return 'pi pi-info-circle text-brand-main';
      default: return 'pi pi-bell text-text-muted';
    }
  }

  getIconBgClass(type: NotificationType): string {
    switch (type) {
      case 'LOAN': return 'bg-warning-bg';
      case 'PAYMENT': return 'bg-success-bg';
      case 'ACCOUNT': return 'bg-info-bg';
      case 'SYSTEM': return 'bg-brand-soft';
      default: return 'bg-bg-muted';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }
}
