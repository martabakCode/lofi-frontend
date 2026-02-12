
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <!-- Background Decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-100/20 dark:bg-primary-900/10 blur-[100px]"></div>
          <div class="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-[100px]"></div>
      </div>

      <div class="relative z-10 max-w-lg w-full text-center">
        <!-- Icon -->
        <div class="mb-8 relative inline-block">
            <div class="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-xl animate-pulse"></div>
            <i class="pi pi-compass text-8xl text-brand-main relative z-10"></i>
        </div>

        <h1 class="text-7xl font-black text-text-primary mb-2 tracking-tighter">404</h1>
        <h2 class="text-2xl font-bold text-text-primary mb-6">Page Not Found</h2>
        
        <p class="text-text-secondary mb-10 text-lg leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/" 
               class="btn-primary min-w-[160px] shadow-lg shadow-primary-500/20">
              <i class="pi pi-home mr-2"></i>
              Back to Home
            </a>
            <button onclick="history.back()" 
                    class="btn-secondary min-w-[160px]">
              <i class="pi pi-arrow-left mr-2"></i>
              Go Back
            </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NotFoundComponent { }
