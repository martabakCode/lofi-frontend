import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl dark:shadow-none border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-primary-600 dark:text-primary-400">Lofi Apps</h1>
            <p class="text-surface-500 dark:text-surface-400 mt-2">Enterprise Angular Boilerplate</p>
          </div>
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
