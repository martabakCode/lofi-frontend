import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    resetForm: FormGroup = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    loading = signal(false);
    message = '';
    error = '';
    token: string | null = null;

    // Password visibility states
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    // Password strength signals
    passwordStrength = computed(() => {
        const password = this.resetForm.get('newPassword')?.value || '';
        return this.calculatePasswordStrength(password);
    });

    passwordStrengthLabel = computed(() => {
        const strength = this.passwordStrength();
        if (strength.score <= 1) return 'Weak';
        if (strength.score <= 2) return 'Fair';
        if (strength.score <= 3) return 'Good';
        return 'Strong';
    });

    passwordStrengthColor = computed(() => {
        const strength = this.passwordStrength();
        if (strength.score <= 1) return 'bg-red-500';
        if (strength.score <= 2) return 'bg-yellow-500';
        if (strength.score <= 3) return 'bg-blue-500';
        return 'bg-green-500';
    });

    ngOnInit(): void {
        // Extract token from query parameters
        this.token = this.route.snapshot.queryParamMap.get('token');

        if (!this.token) {
            this.error = 'Invalid or missing reset token. Please request a new password reset link.';
        }
    }

    calculatePasswordStrength(password: string): { score: number; requirements: { met: boolean; label: string }[] } {
        const requirements = [
            { met: password.length >= 8, label: 'At least 8 characters' },
            { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
            { met: /[a-z]/.test(password), label: 'One lowercase letter' },
            { met: /[0-9]/.test(password), label: 'One number' },
            { met: /[^A-Za-z0-9]/.test(password), label: 'One special character' }
        ];

        const score = requirements.filter(r => r.met).length;
        return { score, requirements };
    }

    toggleNewPasswordVisibility(): void {
        this.showNewPassword.update(v => !v);
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword.update(v => !v);
    }

    passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.resetForm.valid && this.token) {
            this.loading.set(true);
            this.message = '';
            this.error = '';

            const { newPassword } = this.resetForm.value;

            this.authService.resetPassword(this.token, newPassword).subscribe({
                next: (res) => {
                    this.loading.set(false);
                    this.message = res.message || 'Password has been reset successfully.';

                    // Redirect to login after a short delay
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 2000);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error = err.error?.message || 'An error occurred. Please try again or request a new reset link.';
                }
            });
        }
    }

    cancel(): void {
        this.router.navigate(['/auth/login']);
    }

    requestNewLink(): void {
        this.router.navigate(['/auth/forgot-password']);
    }
}
