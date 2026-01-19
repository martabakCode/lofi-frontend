import { Component, signal, ElementRef, HostListener, inject, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

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
export class NotificationPanelComponent {
    isOpen = signal(false);

    notifications = signal<Notification[]>([
        {
            id: '1',
            title: 'Loan Approved',
            message: 'Loan application #LN-2024-001 has been approved.',
            time: '2 mins ago',
            read: false,
            type: 'success'
        },
        {
            id: '2',
            title: 'New Policy Update',
            message: 'Please review the updated credit scoring policy.',
            time: '1 hour ago',
            read: false,
            type: 'info'
        },
        {
            id: '3',
            title: 'System Maintenance',
            message: 'Scheduled maintenance tonight at 00:00.',
            time: '5 hours ago',
            read: true,
            type: 'warning'
        }
    ]);

    hasUnread = computed(() => this.notifications().some(n => !n.read));
    unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

    private elementRef = inject(ElementRef);

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
        this.notifications.update(notes =>
            notes.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }
}
