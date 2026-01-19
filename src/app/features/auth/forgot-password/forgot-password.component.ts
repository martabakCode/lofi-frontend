import { Component, inject } from '@angular/core';
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

    loading = false;
    message = '';
    error = '';

    onSubmit() {
        if (this.forgotForm.valid) {
            this.loading = true;
            this.message = '';
            this.error = '';

            this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.message = res.message || 'If an account exists, a reset link has been sent.';
                    this.forgotForm.reset();
                },
                error: (err) => {
                    this.loading = false;
                    this.error = err.error?.message || 'An error occurred. Please try again.';
                }
            });
        }
    }
}
