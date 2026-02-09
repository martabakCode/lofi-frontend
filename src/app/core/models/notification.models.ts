export type NotificationType = 'LOAN' | 'PAYMENT' | 'ACCOUNT' | 'SYSTEM' | 'OTHER';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    referenceId: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export interface NotificationPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface NotificationSort {
    field: string;
    direction: 'asc' | 'desc';
}

export interface NotificationFilters {
    search: string;
    type: string;
    status: string;
}

export interface NotificationListState {
    items: Notification[];
    loading: boolean;
    error: string | null;
    pagination: NotificationPagination;
    sort: NotificationSort;
    filters: NotificationFilters;
}

export interface NotificationListResponse {
    items: Notification[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Notification Statistics
export interface NotificationStats {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byDate: { date: string; count: number }[];
}

// Create Notification Request (Admin only)
export interface NotificationCreateRequest {
    userId?: string; // Optional - if empty, broadcast to all
    title: string;
    body: string;
    type: NotificationType;
    referenceId?: string;
    link?: string;
}

// Bulk Action Request (Admin only)
export interface BulkActionRequest {
    notificationIds: string[];
    action: 'mark_read' | 'delete';
}
