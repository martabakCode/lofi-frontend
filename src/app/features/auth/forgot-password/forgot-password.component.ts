import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);

    forgotForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    loading = false;

    onSubmit() {
        if (this.forgotForm.valid) {
            this.loading = true;
            // Mock API call
            setTimeout(() => {
                this.loading = false;
                alert('If an account exists for ' + this.forgotForm.value.email + ', you will receive a password reset link.');
            }, 1000);
        }
    }
}
