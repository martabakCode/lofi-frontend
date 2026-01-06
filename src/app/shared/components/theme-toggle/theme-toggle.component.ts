import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="themeService.toggleTheme()" 
      class="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-600 dark:text-surface-400 transition-colors duration-200"
      [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <i class="pi" [ngClass]="themeService.isDarkMode() ? 'pi-sun' : 'pi-moon'"></i>
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
