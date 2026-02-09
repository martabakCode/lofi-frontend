import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styles: [`
    :host {
        display: block;
        height: 100vh;
        overflow: hidden;
    }

    .main-container {
        background: var(--bg-page);
        color: var(--text-primary);
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .mobile-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        transition: opacity 0.3s ease, background-color 0.2s ease;
    }

    .dark .mobile-overlay {
        background: rgba(0, 0, 0, 0.7);
    }

    .main-content {
        background: var(--bg-page);
        transition: background-color 0.2s ease;
    }

    .content-section {
        background: var(--bg-page);
        transition: background-color 0.2s ease;
    }

    * {
        transition-property: background-color, border-color, color;
        transition-duration: 0.2s;
        transition-timing-function: ease;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);

  user = this.authService.currentUser;
  isSidebarOpen = signal(false);

  // Expose dark mode signal for template
  isDarkMode = this.themeService.isDarkMode;

  ngOnInit() {
    // Request notification permission when entering dashboard
    this.notificationService.requestPermission();
  }

  constructor() {
    // Effect to handle theme class on body/html
    if (typeof window !== 'undefined') {
      effect(() => {
        if (this.themeService.isDarkMode()) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      });
    }
  }

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
