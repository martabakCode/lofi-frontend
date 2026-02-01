import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { NotificationPanelComponent } from './notification-panel.component';
import { ProfileMenuComponent } from './profile-menu.component';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterLink, ThemeToggleComponent, NotificationPanelComponent, ProfileMenuComponent, FormsModule],
    template: `
    <header class="h-16 bg-bg-surface/80 border-b border-border-default flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0 backdrop-blur-md transition-colors duration-200">
        <!-- Left: Logo (mobile), Search & Mobile Toggle -->
        <div class="flex items-center gap-4 flex-1">
            <!-- Mobile Logo -->
            <a routerLink="/dashboard" class="lg:hidden flex items-center gap-2">
                <img src="logo.png" alt="LoFi Logo" class="w-7 h-7 rounded object-contain">
            </a>
            <button (click)="onToggleSidebar.emit()" class="lg:hidden p-2 text-text-muted hover:bg-bg-muted rounded-lg transition-colors">
                <i class="pi pi-bars text-xl"></i>
            </button>
            <div class="flex items-center gap-2 px-3 py-2 bg-bg-muted/50 rounded-xl border border-border-default text-text-muted group focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20 transition-all w-full max-w-[180px] sm:max-w-xs md:max-w-sm">
                <i class="pi pi-search text-sm group-focus-within:text-brand-accent transition-colors"></i>
                <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search..." class="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-muted/50" />
                <kbd class="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-bg-surface border border-border-default rounded shadow-sm opacity-60">⌘K</kbd>
            </div>
        </div>

        <!-- Right: Actions & Profile -->
        <div class="flex items-center gap-2 sm:gap-4">
            <!-- Theme Toggle -->
            <app-theme-toggle></app-theme-toggle>

            <!-- Notifications -->
            <app-notification-panel></app-notification-panel>

            <!-- Divider -->
            <div class="hidden sm:block h-8 w-px bg-border-default mx-1"></div>

            <!-- Profile -->
            <app-profile-menu [user]="user()"></app-profile-menu>
        </div>
    </header>
  `,
    styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class TopbarComponent {
    user = input<any>();
    onToggleSidebar = output<void>();

    private router = inject(Router);
    searchQuery = '';

    menuItems: any[] = [
        { label: 'Profile', icon: 'pi pi-user' },
        { label: 'Settings', icon: 'pi pi-cog' },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out' }
    ];

    onSearch() {
        if (this.searchQuery.trim()) {
            console.log('Searching for:', this.searchQuery);
            // Navigate to loan review as a default search location
            this.router.navigate(['/dashboard/loans/review'], { queryParams: { search: this.searchQuery } });
        }
    }
}
