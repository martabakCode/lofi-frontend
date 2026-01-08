import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button
      type="button"
      [icon]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"
      (onClick)="toggle()"
      [rounded]="true"
      [text]="true"
      severity="secondary"
      [ariaLabel]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [title]="isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      class="!p-2
             text-blue-600 dark:text-blue-400
             hover:bg-blue-100 dark:hover:bg-blue-800
             transition-colors duration-200"
    />
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