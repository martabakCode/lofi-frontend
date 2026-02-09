import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const NOTIFICATION_ROUTES: Routes = [
    {
        // User's personal notifications - accessible by all authenticated users
        path: 'my',
        loadComponent: () => import('./pages/my-notifications/my-notifications.component')
            .then(m => m.MyNotificationsComponent)
    },
    {
        // Admin notification management - accessible by admins only
        path: 'manage',
        loadComponent: () => import('./pages/notification-manage/notification-manage.component')
            .then(m => m.NotificationManageComponent),
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] }
    },
    {
        // Redirect old path (root of feature) to user notifications
        path: '',
        redirectTo: 'my',
        pathMatch: 'full'
    },
    {
        // Detail view
        path: ':id',
        loadComponent: () => import('./pages/notification-detail/notification-detail.component')
            .then(m => m.NotificationDetailComponent)
    }
];
