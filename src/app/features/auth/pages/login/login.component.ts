import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PButtonComponent } from '../../../../shared/ui/p-button/p-button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PButtonComponent],
  template: `
    <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-6">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-surface-700 dark:text-surface-300">Email Address</label>
        <input 
          pInputText 
          id="email" 
          type="email" 
          name="email"
          [(ngModel)]="email" 
          required 
          class="w-full" 
          placeholder="admin@antigravity.dev"
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
        <input 
          pInputText 
          id="password" 
          type="password" 
          name="password"
          [(ngModel)]="password" 
          required 
          class="w-full"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded">
          <label for="remember" class="ml-2 block text-sm text-surface-600 dark:text-surface-400">Remember me</label>
        </div>
        <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">Forgot password?</a>
      </div>

      <app-p-button 
        label="Sign In" 
        [loading]="isLoading()" 
        (onClick)="onLogin()"
        styleClass="w-full"
      ></app-p-button>

      <div class="text-center mt-6">
        <p class="text-sm text-surface-500 dark:text-surface-400">
          Don't have an account? 
          <a href="#" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">Sign up</a>
        </p>
      </div>
    </form>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = signal(false);

  onLogin() {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        // Handle error (e.g., show toast)
      }
    });
  }
}
