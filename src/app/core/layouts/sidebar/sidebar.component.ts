import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserNotificationFacade } from '../../../features/notifications/facades/user-notification.facade';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
    private authService = inject(AuthService);
    public notificationFacade = inject(UserNotificationFacade);

    isOpen = input<boolean>(false);
    isCollapsed = signal(false);
    onClose = output<void>();
    onLogout = output<void>();
    onToggleCollapse = output<boolean>();

    toggleCollapse() {
        this.isCollapsed.update((v: boolean) => !v);
        this.onToggleCollapse.emit(this.isCollapsed());
    }

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.notificationFacade.loadMyNotifications();
        }
    }


    hasPermission(p: string): boolean {
        return this.authService.hasPermission(p);
    }

    isAdmin(): boolean {
        return this.authService.getUserRoles().includes('ROLE_ADMIN') ||
            this.authService.getUserRoles().includes('ROLE_SUPER_ADMIN');
    }

    hasAnyRole(roles: string[]): boolean {
        const userRoles = this.authService.getUserRoles();
        return roles.some(r => userRoles.includes(r));
    }
}
