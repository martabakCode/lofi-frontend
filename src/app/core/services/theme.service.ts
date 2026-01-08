import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'Lofi Apps-theme';
  private isBrowser: boolean;
  
  // Theme state signal
  isDarkMode = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      // Initialize from localStorage
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      this.isDarkMode.set(savedTheme ? savedTheme === 'dark' : prefersDark);
      this.applyTheme();
    }

    // Reactively apply theme changes
    effect(() => {
      if (this.isBrowser) {
        this.applyTheme();
        localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
      }
    });
  }

  toggleTheme() {
    this.isDarkMode.update(dark => !dark);
  }

  private applyTheme() {
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
