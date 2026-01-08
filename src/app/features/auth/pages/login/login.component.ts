import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PButtonComponent } from '../../../../shared/ui/p-button/p-button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, MessageModule, PButtonComponent],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-6">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-surface-700 dark:text-surface-300">Email Address</label>
        <input 
          pInputText 
          id="email" 
          type="email" 
          formControlName="email"
          class="w-full" 
          [class.ng-invalid]="emailControl?.invalid && emailControl?.touched"
          [class.ng-dirty]="emailControl?.invalid && emailControl?.touched"
          placeholder="admin@Lofi Apps.dev"
        />
        <div *ngIf="emailControl?.invalid && emailControl?.touched" class="mt-1">
          <small class="text-red-500 font-medium" *ngIf="emailControl?.errors?.['required']">Email is required</small>
          <small class="text-red-500 font-medium" *ngIf="emailControl?.errors?.['email']">Please enter a valid email address</small>
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
        <input 
          pInputText 
          id="password" 
          type="password" 
          formControlName="password"
          class="w-full"
          [class.ng-invalid]="passwordControl?.invalid && passwordControl?.touched"
          [class.ng-dirty]="passwordControl?.invalid && passwordControl?.touched"
          placeholder="••••••••"
        />
        <div *ngIf="passwordControl?.invalid && passwordControl?.touched" class="mt-1">
          <small class="text-red-500 font-medium" *ngIf="passwordControl?.errors?.['required']">Password is required</small>
        </div>
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
        [disabled]="loginForm.invalid || isLoading()"
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
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    if (!email || !password) return;

    this.isLoading.set(true);
    this.authService.login({ email, password }).subscribe({
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
