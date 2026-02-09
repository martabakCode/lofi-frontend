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
      class="p-2.5 rounded-xl
             text-text-muted hover:text-brand-main
             hover:bg-bg-muted
             transition-all duration-200 active:scale-95"
    >
      @if (isDark()) {
        <i class="pi pi-sun text-lg"></i>
      } @else {
        <i class="pi pi-moon text-lg"></i>
      }
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