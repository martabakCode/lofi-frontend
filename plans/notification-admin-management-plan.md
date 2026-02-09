# Notification Admin Management Plan

## Overview
Create a comprehensive notification admin management feature for the lofi-frontend application. This feature will allow administrators to view, manage, and delete notifications across the system.

## API Endpoints

### User Endpoints
- `GET /notifications` - Get user notifications
- `PUT /notifications/{id}/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all notifications as read

### Admin Endpoints
- `GET /notifications/all` - Get all notifications (Admin only) with pagination
- `GET /notifications/{id}` - Get notification by ID (Admin only)
- `DELETE /notifications/{id}` - Delete a notification (Admin only)

## Data Models

### Notification Interface
```typescript
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

export type NotificationType = 'LOAN' | 'PAYMENT' | 'ACCOUNT' | 'SYSTEM' | 'OTHER';
```

### Notification List State
```typescript
export interface NotificationListState {
  items: Notification[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters: {
    search: string;
    type: string;
    status: string;
  };
}
```

## Implementation Tasks

### 1. Create Notification Models
- File: `src/app/core/models/notification.models.ts`
- Define Notification interface
- Define NotificationType enum
- Define filter and pagination interfaces

### 2. Create Notification API Service
- File: `src/app/core/services/notification-api.service.ts`
- Implement all API methods:
  - `getUserNotifications()` - GET /notifications
  - `markAsRead(id)` - PUT /notifications/{id}/read
  - `markAllAsRead()` - PUT /notifications/mark-all-read
  - `getAllNotifications(params)` - GET /notifications/all (Admin)
  - `getNotificationById(id)` - GET /notifications/{id} (Admin)
  - `deleteNotification(id)` - DELETE /notifications/{id} (Admin)

### 3. Create Notification Facade
- File: `src/app/features/notifications/facades/notification.facade.ts`
- Implement state management using signals
- Provide methods for:
  - Loading notifications with pagination
  - Filtering and sorting
  - Marking as read
  - Deleting notifications
  - Export functionality

### 4. Create Notification List Component
- Files:
  - `src/app/features/notifications/pages/notification-list.component.ts`
  - `src/app/features/notifications/pages/notification-list.component.html`
  - `src/app/features/notifications/pages/notification-list.component.css`
- Features:
  - Table view of all notifications
  - Search by title/body
  - Filter by type and read status
  - Sort by date, type, status
  - Pagination
  - Mark as read/unread actions
  - Delete action
  - View detail action
  - Export to CSV

### 5. Create Notification Detail Component
- Files:
  - `src/app/features/notifications/pages/notification-detail/notification-detail.component.ts`
  - `src/app/features/notifications/pages/notification-detail/notification-detail.component.html`
  - `src/app/features/notifications/pages/notification-detail/notification-detail.component.css`
- Features:
  - Display full notification details
  - Show user information
  - Show reference link if available
  - Mark as read/unread action
  - Delete action
  - Back to list navigation

### 6. Create Notification Routes
- File: `src/app/features/notifications/notifications.routes.ts`
- Define routes:
  - `/dashboard/notifications` - List view
  - `/dashboard/notifications/:id` - Detail view

### 7. Update App Routes
- File: `src/app/app.routes.ts`
- Add notifications route to dashboard children

### 8. Update Sidebar
- File: `src/app/core/layouts/sidebar/sidebar.component.ts`
- Add notifications navigation link
- Add notification badge for unread count

## UI Components to Use

### Shared Components
- `PaginationComponent` - For pagination controls
- `SortableHeaderComponent` - For sortable table headers
- `DetailModalComponent` - For quick detail view
- `ConfirmationModalComponent` - For delete confirmation
- `EmptyStateComponent` - For empty list state
- `SkeletonLoaderComponent` - For loading state

### Design Patterns
- Follow Apple HIG design principles
- Use Tailwind CSS for styling
- Responsive design for mobile/tablet/desktop
- Consistent with existing admin pages (users, branches, roles)

## State Management

### Notification Facade State
```typescript
export interface NotificationListState {
  items: Notification[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters: {
    search: string;
    type: string;
    status: string;
  };
}
```

### Computed Values
- `unreadCount` - Count of unread notifications
- `hasActiveFilters` - Check if any filters are active
- `filteredNotifications` - Notifications after applying filters

## Testing

### Unit Tests
- [ ] Notification models validation
- [ ] Notification API service methods
- [ ] Notification facade state management
- [ ] Notification list component logic
- [ ] Notification detail component logic

### Integration Tests
- [ ] API integration with backend
- [ ] Navigation between list and detail
- [ ] Filter and sort functionality
- [ ] Pagination behavior

### E2E Tests
- [ ] Complete user flow for viewing notifications
- [ ] Mark as read functionality
- [ ] Delete notification flow
- [ ] Export functionality

## Dependencies

### Angular Dependencies
- @angular/common
- @angular/core
- @angular/router
- @angular/forms
- @angular/http

### RxJS Operators
- map
- tap
- finalize
- debounceTime
- distinctUntilChanged
- takeUntilDestroyed
- forkJoin

### Shared Services
- ToastService
- RbacService (for user data)

## File Structure

```
src/app/
├── core/
│   ├── models/
│   │   └── notification.models.ts (NEW)
│   └── services/
│       └── notification-api.service.ts (NEW)
├── features/
│   └── notifications/
│       ├── facades/
│       │   └── notification.facade.ts (NEW)
│       ├── pages/
│       │   ├── notification-list.component.ts (NEW)
│       │   ├── notification-list.component.html (NEW)
│       │   ├── notification-list.component.css (NEW)
│       │   └── notification-detail/
│       │       ├── notification-detail.component.ts (NEW)
│       │       ├── notification-detail.component.html (NEW)
│       │       └── notification-detail.component.css (NEW)
│       └── notifications.routes.ts (NEW)
└── app.routes.ts (MODIFY)
```

## Implementation Order

1. Create notification models
2. Create notification API service
3. Create notification facade
4. Create notification list component
5. Create notification detail component
6. Create notification routes
7. Update app routes
8. Update sidebar
9. Test all functionality

## Notes

- The existing `NotificationService` is for Firebase push notifications and should not be modified
- Create a new `NotificationApiService` for the notification management API
- Follow the same patterns used in `UserFacade` and `RbacService`
- Use signals for state management (Angular 17+)
- Ensure all admin endpoints are properly protected
- Use existing shared components (PaginationComponent, SortableHeaderComponent, etc.)
- Follow Apple HIG design principles for UI consistency
