import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, ThemeToggleComponent],
    template: `
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0">
        <!-- Left: Mobile Toggle & Search -->
        <div class="flex items-center gap-4 flex-1">
            <button (click)="onToggleSidebar.emit()" class="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span class="text-xl">☰</span>
            </button>

            <div class="hidden md:flex relative w-full max-w-md">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input type="text" placeholder="Search or type command..." 
                    class="w-full pl-10 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors" />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd class="px-2 py-0.5 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">⌘K</kbd>
                </div>
            </div>
        </div>

        <!-- Right: Actions & Profile -->
        <div class="flex items-center gap-3 sm:gap-4">
            <app-theme-toggle></app-theme-toggle>

            <button class="p-2 text-slate-500 hover:text-primary-600 transition-colors relative">
                <span class="text-xl">🔔</span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <div class="relative group">
                <button class="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ user()?.fullName || 'User' }}</p>
                        <p class="text-xs text-slate-500 capitalize">{{ user()?.roles?.[0] || 'Admin' }}</p>
                    </div>
                    <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {{ (user()?.fullName?.[0] || 'U') }}
                    </div>
                </button>
                
                <!-- Simple Dropdown -->
                <div class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block hover:block">
                    <a *ngFor="let item of menuItems" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                        <span *ngIf="item.label">{{item.label}}</span>
                        <hr *ngIf="!item.label" class="border-slate-200 dark:border-slate-700 my-1">
                    </a>
                </div>
            </div>
        </div>
    </header>
  `
})
export class TopbarComponent {
    user = input<any>();
    onToggleSidebar = output<void>();

    menuItems: any[] = [
        { label: 'Profile', icon: 'pi pi-user' },
        { label: 'Settings', icon: 'pi pi-cog' },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out' }
    ];
}
