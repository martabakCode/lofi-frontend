import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize, tap, Observable } from 'rxjs';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { ToastService } from '../../../core/services/toast.service';
import {
    Notification,
    NotificationListState,
    NotificationListResponse,
    NotificationStats,
    NotificationCreateRequest
} from '../../../core/models/notification.models';

export interface AdminNotificationState extends NotificationListState {
    stats: NotificationStats | null;
    selectedIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AdminNotificationFacade {
    private notificationApi = inject(NotificationApiService);
    private toastService = inject(ToastService);

    // State signals
    private state = signal<AdminNotificationState>({
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
        },
        stats: null,
        selectedIds: []
    });

    // Selectors (computed signals)
    items = computed(() => this.state().items);
    loading = computed(() => this.state().loading);
    error = computed(() => this.state().error);
    pagination = computed(() => this.state().pagination);
    filters = computed(() => this.state().filters);
    stats = computed(() => this.state().stats);
    selectedIds = computed(() => this.state().selectedIds);

    totalSelected = computed(() => this.state().selectedIds.length);
    isAllSelected = computed(() =>
        this.state().items.length > 0 &&
        this.state().selectedIds.length === this.state().items.length
    );

    /**
     * Load all notifications (with management filters)
     */
    loadAllNotifications(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        const { page, pageSize } = this.state().pagination;
        const filters = this.state().filters;

        this.notificationApi.getAllNotifications(page, pageSize, filters).pipe(
            finalize(() => this.state.update(s => ({ ...s, loading: false })))
        ).subscribe({
            next: (response: NotificationListResponse) => {
                this.state.update(s => ({
                    ...s,
                    items: response.items,
                    pagination: {
                        page: response.page,
                        pageSize: response.pageSize,
                        total: response.total,
                        totalPages: response.totalPages
                    },
                    selectedIds: [] // Clear selection on reload
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
     * Load notification stats
     */
    loadStats(): void {
        this.notificationApi.getNotificationStats().subscribe({
            next: (stats) => this.state.update(s => ({ ...s, stats })),
            error: () => this.toastService.show('Failed to load notification statistics', 'error')
        });
    }

    /**
     * Create new notification
     */
    createNotification(request: NotificationCreateRequest): void {
        this.state.update(s => ({ ...s, loading: true }));
        this.notificationApi.createNotification(request).pipe(
            finalize(() => this.state.update(s => ({ ...s, loading: false })))
        ).subscribe({
            next: () => {
                this.toastService.show('Notification created successfully', 'success');
                this.loadAllNotifications();
                this.loadStats();
            },
            error: (err) => this.toastService.show(err.message || 'Failed to create notification', 'error')
        });
    }

    /**
     * Set page
     */
    setPage(page: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, page }
        }));
        this.loadAllNotifications();
    }

    /**
     * Set filter
     */
    setFilter(key: keyof AdminNotificationState['filters'], value: string): void {
        this.state.update(s => ({
            ...s,
            filters: { ...s.filters, [key]: value },
            pagination: { ...s.pagination, page: 1 }
        }));
        this.loadAllNotifications();
    }

    /**
     * Toggle item selection
     */
    toggleSelection(id: string): void {
        this.state.update(s => {
            const selectedIds = s.selectedIds.includes(id)
                ? s.selectedIds.filter(idx => idx !== id)
                : [...s.selectedIds, id];
            return { ...s, selectedIds };
        });
    }

    /**
     * Toggle all visible item selection
     */
    toggleAllSelection(): void {
        this.state.update(s => {
            const allIds = s.items.map(i => i.id);
            const selectedIds = s.selectedIds.length === allIds.length ? [] : allIds;
            return { ...s, selectedIds };
        });
    }

    /**
     * Bulk mark as read
     */
    bulkMarkAsRead(): void {
        const ids = this.state().selectedIds;
        if (ids.length === 0) return;

        this.notificationApi.bulkMarkAsRead(ids).subscribe({
            next: () => {
                this.toastService.show(`${ids.length} notifications marked as read`, 'success');
                this.loadAllNotifications();
                this.loadStats();
            },
            error: () => this.toastService.show('Failed to mark notifications as read', 'error')
        });
    }

    /**
     * Bulk delete
     */
    bulkDelete(): void {
        const ids = this.state().selectedIds;
        if (ids.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${ids.length} notifications?`)) return;

        this.notificationApi.bulkDelete(ids).subscribe({
            next: () => {
                this.toastService.show(`${ids.length} notifications deleted successfully`, 'success');
                this.loadAllNotifications();
                this.loadStats();
            },
            error: () => this.toastService.show('Failed to delete notifications', 'error')
        });
    }

    /**
     * Individual delete
     */
    deleteNotification(id: string): void {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        this.notificationApi.deleteNotification(id).subscribe({
            next: () => {
                this.toastService.show('Notification deleted successfully', 'success');
                this.loadAllNotifications();
                this.loadStats();
            },
            error: () => this.toastService.show('Failed to delete notification', 'error')
        });
    }
}
