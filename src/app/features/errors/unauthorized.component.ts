import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * UnauthorizedComponent - Access Denied Page
 * Displays when user tries to access a route they don't have permission for
 */
@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen flex items-center justify-center bg-bg-muted px-4">
            <div class="max-w-md w-full text-center">
                <!-- Icon -->
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <i class="pi pi-lock text-5xl text-red-500"></i>
                </div>

                <!-- Title -->
                <h1 class="text-3xl font-bold text-text-primary mb-3">
                    Access Denied
                </h1>

                <!-- Description -->
                <p class="text-text-secondary mb-8">
                    You don't have permission to access this page. Please contact your
                    administrator if you believe this is a mistake.
                </p>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <a routerLink="/dashboard" class="btn-primary">
                        <i class="pi pi-home mr-2"></i>
                        Go to Dashboard
                    </a>
                    <button onclick="history.back()" class="btn-secondary">
                        <i class="pi pi-arrow-left mr-2"></i>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    `
})
export class UnauthorizedComponent { }
