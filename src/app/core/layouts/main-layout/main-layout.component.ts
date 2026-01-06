import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ThemeToggleComponent],
  template: `
    <div class="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-all duration-300">
        <div class="p-6 border-b border-surface-200 dark:border-surface-800">
          <h1 class="text-xl font-bold text-primary-600 dark:text-primary-400">Antigravity</h1>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <a href="#" class="flex items-center px-4 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <i class="pi pi-home mr-3"></i> Dashboard
          </a>
          <a href="#" class="flex items-center px-4 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <i class="pi pi-users mr-3"></i> Users
          </a>
        </nav>
        <div class="p-4 border-t border-surface-200 dark:border-surface-800">
           <button 
             (click)="logout()"
             class="w-full flex items-center px-4 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
           >
             <i class="pi pi-sign-out mr-3"></i> Logout
           </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar -->
        <header class="h-16 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-8">
          <button class="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg lg:hidden">
            <i class="pi pi-bars"></i>
          </button>
          <div class="flex items-center space-x-4">
            <app-theme-toggle></app-theme-toggle>
            <div class="flex items-center space-x-3 border-l border-surface-200 dark:border-surface-800 pl-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-semibold text-surface-900 dark:text-surface-0">{{ user()?.name }}</p>
                <p class="text-xs text-surface-500">{{ user()?.role }}</p>
              </div>
              <div class="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                {{ user()?.name?.charAt(0) }}
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <section class="flex-1 overflow-y-auto p-8">
           <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
