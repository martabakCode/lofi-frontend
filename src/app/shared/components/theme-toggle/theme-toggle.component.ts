import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="toggle()"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.title]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      class="p-2 rounded-full
             text-blue-600 dark:text-blue-400
             hover:bg-blue-100 dark:hover:bg-blue-800
             transition-colors duration-200"
    >
      <span *ngIf="isDark()">☀️</span>
      <span *ngIf="!isDark()">🌙</span>
    </button>
  `,
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  toggle() {
    this.themeService.toggleTheme();
  }

  isDark() {
    return this.themeService.isDarkMode();
  }
}