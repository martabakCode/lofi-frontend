import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
export class SidebarComponent {
    private authService = inject(AuthService);

    isOpen = input<boolean>(false);
    onClose = output<void>();
    onLogout = output<void>();

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
