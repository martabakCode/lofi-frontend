import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap, Observable } from 'rxjs';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Notification, NotificationListState, NotificationListResponse } from '../../../core/models/notification.models';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationFacade {
    private notificationApi = inject(NotificationApiService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    // State signals
    private state = signal<NotificationListState>({
        items: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 1
        },
        sort: {
            field: 'createdAt',
            direction: 'desc'
        },
        filters: {
            search: '',
            type: '',
            status: ''
        }
    });

    // Selectors (computed signals)
    items = computed(() => this.state().items);
    loading = computed(() => this.state().loading);
    error = computed(() => this.state().error);
    pagination = computed(() => this.state().pagination);
    filters = computed(() => this.state().filters);

    unreadCount = computed(() =>
        this.state().items.filter(n => !n.isRead).length
    );

    /**
     * Load current user's notifications
     */
    loadMyNotifications(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        this.notificationApi.getUserNotifications().pipe(
            finalize(() => this.state.update(s => ({ ...s, loading: false })))
        ).subscribe({
            next: (items: Notification[]) => {
                this.state.update(s => ({
                    ...s,
                    items,
                    pagination: {
                        ...s.pagination,
                        total: items.length,
                        totalPages: Math.ceil(items.length / s.pagination.pageSize)
                    }
                }));
            },
            error: (err) => {
                const errorMsg = err.message || 'Failed to load notifications';
                this.state.update(s => ({ ...s, error: errorMsg }));
                this.toastService.show(errorMsg, 'error');
            }
        });
    }

    /**
     * Mark notification as read
     */
    markAsRead(id: string): void {
        this.notificationApi.markAsRead(id).subscribe({
            next: () => {
                this.state.update(s => ({
                    ...s,
                    items: s.items.map(n => n.id === id ? { ...n, isRead: true } : n)
                }));
            },
            error: () => this.toastService.show('Failed to mark notification as read', 'error')
        });
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        this.notificationApi.markAllAsRead().subscribe({
            next: () => {
                this.state.update(s => ({
                    ...s,
                    items: s.items.map(n => ({ ...n, isRead: true }))
                }));
                this.toastService.show('All notifications marked as read', 'success');
            },
            error: () => this.toastService.show('Failed to mark all notifications as read', 'error')
        });
    }

    /**
     * Get a single notification by ID
     */
    getNotification(id: string): Observable<Notification> {
        return this.notificationApi.getNotificationById(id).pipe(
            tap({
                next: (n) => {
                    if (!n.isRead) {
                        this.markAsRead(n.id);
                    }
                },
                error: () => this.toastService.show('Failed to load notification details', 'error')
            })
        );
    }

    /**
     * Navigate to notification detail
     */
    viewNotification(id: string): void {
        this.router.navigate(['/dashboard/notifications', id]);
    }
}
