import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    loading = signal(false);
    error = signal('');

    onSubmit() {
        if (this.loginForm.valid) {
            this.error.set('');

            this.authService.login(this.loginForm.value).subscribe({
                next: (res) => {
                    this.loading.set(false);
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set('Invalid credentials');
                }
            });
        }
    }
}
