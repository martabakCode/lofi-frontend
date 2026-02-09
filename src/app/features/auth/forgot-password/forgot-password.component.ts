import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    forgotForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    loading = signal(false);
    message = signal('');
    error = signal('');
    emailSent = signal(false);

    // Cooldown for resend functionality
    resendCooldown = signal(0);
    canResend = signal(true);

    startResendCooldown(): void {
        this.canResend.set(false);
        this.resendCooldown.set(30);

        const interval = setInterval(() => {
            this.resendCooldown.update(v => {
                if (v <= 1) {
                    clearInterval(interval);
                    this.canResend.set(true);
                    return 0;
                }
                return v - 1;
            });
        }, 1000);
    }

    onSubmit() {
        if (this.forgotForm.valid) {
            this.loading.set(true);
            this.message.set('');
            this.error.set('');

            this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
                next: (res) => {
                    this.loading.set(false);
                    this.message.set(res.message || 'If an account exists, a reset link has been sent to your email.');
                    this.emailSent.set(true);
                    this.startResendCooldown();
                    this.forgotForm.reset();
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set(err.error?.message || 'An error occurred. Please try again.');
                }
            });
        }
    }

    resendEmail(): void {
        if (this.canResend() && this.forgotForm.get('email')?.value) {
            this.onSubmit();
        }
    }

    resetForm(): void {
        this.emailSent.set(false);
        this.message.set('');
        this.error.set('');
        this.forgotForm.reset();
    }
}
