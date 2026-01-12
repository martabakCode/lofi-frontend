import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
        <!-- Mobile Overlay -->
        <div *ngIf="isSidebarOpen()" (click)="closeSidebar()"
            class="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300">
        </div>

        <!-- Sidebar -->
        <app-sidebar [isOpen]="isSidebarOpen()" (onClose)="closeSidebar()" (onLogout)="logout()" class="contents"></app-sidebar>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <app-topbar [user]="user()" (onToggleSidebar)="toggleSidebar()"></app-topbar>

            <!-- Content Area -->
            <section class="flex-1 overflow-y-auto p-4 lg:p-8 relative">
                <div class="max-w-7xl mx-auto w-full">
                    <router-outlet></router-outlet>
                </div>
            </section>
        </main>
    </div>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
