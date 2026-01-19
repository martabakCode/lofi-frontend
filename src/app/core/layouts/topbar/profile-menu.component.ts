import { Component, input, inject, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile-menu',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-menu.component.html',
    styles: [`
    :host {
      display: block;
      position: relative;
    }
  `]
})
export class ProfileMenuComponent {
    user = input<any>();
    isOpen = signal(false);

    private elementRef = inject(ElementRef);
    private authService = inject(AuthService);
    private router = inject(Router);

    toggle() {
        this.isOpen.update(v => !v);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    getRoleName(): string {
        const u = this.user();
        if (!u) return '';
        const roles = u.roles || u.roleNames;
        if (!roles || roles.length === 0) return '';
        const role = roles[0];
        const name = typeof role === 'string' ? role : role.name;
        return name ? name.replace('ROLE_', '').replace('_', ' ') : '';
    }

    getInitials(): string {
        return this.user()?.fullName?.[0]?.toUpperCase() || 'G';
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.isOpen.set(false);
    }

    navigateTo(path: string) {
        this.router.navigate([path]);
        this.isOpen.set(false);
    }
}
