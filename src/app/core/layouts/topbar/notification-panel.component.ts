import { Component, signal, ElementRef, HostListener, inject, output, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserNotificationFacade } from '../../../features/notifications/facades/user-notification.facade';
import { Notification } from '../../models/notification.models';

@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-panel.component.html',
    styles: [`
    :host {
      display: block;
      position: relative;
    }
  `]
})
export class NotificationPanelComponent implements OnInit {
    public facade = inject(UserNotificationFacade);
    private router = inject(Router);
    private elementRef = inject(ElementRef);

    isOpen = signal(false);

    notifications = this.facade.items;
    loading = this.facade.loading;
    unreadCount = this.facade.unreadCount;
    hasUnread = computed(() => this.unreadCount() > 0);

    ngOnInit() {
        this.facade.loadMyNotifications();
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    markAsRead(id: string) {
        this.facade.markAsRead(id);
    }

    markAllRead() {
        this.facade.markAllAsRead();
    }

    formatTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'LOAN': return 'pi-money-bill text-success-text';
            case 'PAYMENT': return 'pi-wallet text-info-text';
            case 'ACCOUNT': return 'pi-user text-brand-main';
            case 'SYSTEM': return 'pi-cog text-warning-text';
            default: return 'pi-bell text-text-muted';
        }
    }
}
