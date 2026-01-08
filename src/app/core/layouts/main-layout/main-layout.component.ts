import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <div class="flex h-screen bg-primary-50 dark:bg-primary-950 overflow-hidden text-primary-900 dark:text-primary-0">
      <!-- Sidebar -->
      <aside class="w-64 bg-primary-0 dark:bg-primary-900 border-r border-primary-200 dark:border-primary-800 flex flex-col transition-all duration-300">
        <div class="p-6 border-b border-primary-200 dark:border-primary-800 flex items-center gap-2">
          <div class="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            <i class="pi pi-bolt text-lg"></i>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-primary-900 dark:text-primary-0">Lofi Apps</h1>
        </div>
        
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <div class="text-xs font-semibold text-primary-400 uppercase tracking-wider px-2 mb-2">Main</div>
          <a routerLink="/dashboard" routerLinkActive="active-link" class="nav-link">
            <i class="pi pi-home mr-3 text-lg"></i> Dashboard
          </a>

          <div class="text-xs font-semibold text-primary-400 uppercase tracking-wider px-2 mt-6 mb-2">Management</div>
          <a routerLink="/users" routerLinkActive="active-link" class="nav-link">
            <i class="pi pi-users mr-3 text-lg"></i> Users
          </a>
          <a routerLink="/branches" routerLinkActive="active-link" class="nav-link">
            <i class="pi pi-building mr-3 text-lg"></i> Branches
          </a>

          <div class="text-xs font-semibold text-primary-400 uppercase tracking-wider px-4 mt-6 mb-2">RBAC</div>
          <a routerLink="/roles" routerLinkActive="active-link" class="nav-link" [routerLinkActiveOptions]="{exact: true}">
            <i class="pi pi-shield mr-3 text-lg"></i> Roles
          </a>
          <a routerLink="/roles/permissions" routerLinkActive="active-link" class="nav-link">
            <i class="pi pi-key mr-3 text-lg"></i> Permissions
          </a>
        </nav>

        <div class="p-4 border-t border-primary-200 dark:border-primary-800">
           <button 
             (click)="logout()"
             class="w-full flex items-center px-4 py-2 text-primary-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
           >
             <i class="pi pi-sign-out mr-3"></i> Logout
           </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar -->
        <header class="h-16 bg-primary-0 dark:bg-primary-900 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between px-8">
          <div class="flex items-center gap-4 lg:hidden">
            <button class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg">
              <i class="pi pi-bars"></i>
            </button>
          </div>
          
          <div class="flex-1"></div>
          <div class="flex items-center space-x-4">
          </div>

          <div class="flex items-center space-x-4">
            <app-theme-toggle></app-theme-toggle>
            <div class="flex items-center space-x-3 border-l border-primary-200 dark:border-primary-800 pl-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-semibold">{{ user()?.fullName }}</p>
                <p class="text-xs text-primary-500">{{ user()?.roles?.[0]?.name || 'No Role' }}</p>
              </div>
              <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-800">
                {{ user()?.fullName?.charAt(0) }}
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <section class="flex-1 overflow-y-auto p-8 bg-primary-50 dark:bg-primary-950/50">
           <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      transition: all 0.2s;
      font-weight: 500;
    }
    .active-link {
      background-color: var(--primary-50);
      color: var(--primary-600);
      font-weight: 700;
    }
    :host-context(.dark) .active-link {
      background-color: rgba(90, 122, 205, 0.2);
      color: var(--primary-400);
    }
    :host-context(.dark) .nav-link:hover {
      background-color: rgba(39, 39, 42, 0.5);
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
