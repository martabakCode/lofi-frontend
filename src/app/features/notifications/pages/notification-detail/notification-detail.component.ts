import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserNotificationFacade } from '../../facades/user-notification.facade';
import { AdminNotificationFacade } from '../../facades/admin-notification.facade';
import { AuthService } from '../../../../core/services/auth.service';
import { Notification } from '../../../../core/models/notification.models';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-notification-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        DatePipe,
        ConfirmationModalComponent
    ],
    templateUrl: './notification-detail.component.html'
})
export class NotificationDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    public userFacade = inject(UserNotificationFacade);
    private adminFacade = inject(AdminNotificationFacade);

    isAdmin = signal(false);

    notificationId = signal<string>('');
    notification = signal<Notification | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Modal states
    isDeleteModalOpen = signal(false);

    ngOnInit() {
        this.isAdmin.set(this.authService.getUserRoles().some(r => ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r)));

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.notificationId.set(id);
                this.loadNotification(id);
            }
        });
    }

    loadNotification(id: string) {
        this.loading.set(true);
        this.error.set(null);

        this.userFacade.getNotification(id).subscribe({
            next: (notif) => {
                this.notification.set(notif);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message || 'Failed to load notification details');
                this.loading.set(false);
            }
        });
    }

    markAsRead() {
        const id = this.notificationId();
        if (id) {
            this.userFacade.markAsRead(id);
            // Update local state for immediate feedback
            this.notification.update(n => n ? { ...n, isRead: true } : null);
        }
    }

    confirmDelete() {
        this.isDeleteModalOpen.set(true);
    }

    onDeleteConfirmed() {
        const id = this.notificationId();
        if (id && this.isAdmin()) {
            this.adminFacade.deleteNotification(id);
            this.isDeleteModalOpen.set(false);
            this.backToList();
        }
    }

    backToList() {
        const isAdmin = this.authService.getUserRoles().some(r => ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));
        if (isAdmin) {
            this.router.navigate(['/dashboard/notifications/manage']);
        } else {
            this.router.navigate(['/dashboard/notifications/my']);
        }
    }
}
