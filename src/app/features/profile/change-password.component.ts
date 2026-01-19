import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-xl mx-auto space-y-6">
       <div class="mb-8">
           <h1 class="text-2xl font-bold text-text-primary m-0">Change Password</h1>
           <p class="text-text-secondary m-0">Ensure your account stays secure</p>
       </div>

       <div class="bg-bg-surface border border-border-default rounded-2xl shadow-sm p-6 md:p-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
             
             <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">Current Password</label>
                <input type="password" formControlName="currentPassword" class="form-input w-full" placeholder="••••••••" />
             </div>

             <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
                <input type="password" formControlName="newPassword" class="form-input w-full" placeholder="••••••••" />
                <p class="text-xs text-text-muted mt-1">Must be at least 8 characters</p>
             </div>

             <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
                <input type="password" formControlName="confirmationPassword" class="form-input w-full" placeholder="••••••••" />
             </div>

             <div class="pt-4 flex gap-4">
                <button type="button" (click)="cancel()" class="btn-ghost flex-1">Cancel</button>
                <button type="submit" [disabled]="form.invalid || loading" class="btn-primary flex-1">
                   @if (loading) { <i class="pi pi-spin pi-spinner"></i> }
                   @else { <span>Update Password</span> }
                </button>
             </div>
          </form>
       </div>
    </div>
  `
})
export class ChangePasswordComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    toast = inject(ToastService);
    router = inject(Router);

    loading = false;

    form = this.fb.group({
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmationPassword: ['', Validators.required]
    });

    onSubmit() {
        if (this.form.invalid) return;
        const val = this.form.value;

        if (val.newPassword !== val.confirmationPassword) {
            this.toast.show('New passwords do not match', 'error');
            return;
        }

        this.loading = true;
        this.authService.changePassword(val).subscribe({
            next: () => {
                this.toast.show('Password updated successfully', 'success');
                this.loading = false;
                this.form.reset();
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.toast.show(err.error?.message || 'Failed to update password', 'error');
            }
        });
    }

    cancel() {
        this.router.navigate(['/dashboard']);
    }
}
